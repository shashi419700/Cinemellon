import { MovieDetails, MovieSummary } from "../types.js";
import { findSeedMovie, searchSeedMovies, seedMovies } from "../db/seedMovies.js";
import { getCachedMovie, setCachedMovie } from "../db/movieCacheRepo.js";
import {
  getTmdbMovieFacts,
  getTmdbSimilarMovies,
  getNowPlayingMovies,
  resolveMovieSummaryByTitle,
  searchTmdb,
  TmdbNotConfiguredError,
} from "./tmdb.js";
import { getOmdbMovieFacts } from "./omdb.js";
import { generateStructured } from "./ai/index.js";
import { buildFullInsightPrompt, fullInsightSchema } from "./ai/prompts.js";

/** Shape the model returns for the editorial fields — see fullInsightSchema
 * in prompts.ts. similarMovieTitles is only used as a fallback when TMDB's
 * own recommendations for this title come back empty — see
 * resolveSimilarMovies below. */
type GeneratedInsights = Omit<MovieDetails, keyof MovieFacts | "id" | "similarMovies"> & {
  similarMovieTitles: string[];
};

/** The subset of factual data both TMDB and OMDB can provide — everything
 * editorial (trivia, timeline, hidden details, etc.) is layered on
 * separately below, since neither source has a concept of that content.
 * TmdbMovieFacts and OmdbMovieFacts both satisfy this structurally. */
interface MovieFacts {
  title: string;
  year: number;
  tagline: string;
  posterUrl: string;
  genres: string[];
  runtimeMinutes: number;
  director: string;
  rating: number;
  overview: string;
  mainCast: { actor: string; character: string }[];
  supportingCast: string[];
  cinematographer: string;
  musicComposer: string;
  editor: string;
  costumeDesigner: string;
}

/**
 * The single entry point the routes use to resolve an id to a full
 * MovieDetails object, in priority order:
 *   1. Hand-curated seed movie (instant, no external calls)
 *   2. Previously-assembled + cached movie (instant, one DB read)
 *   3. Fresh assembly: TMDB (or OMDB, for omdb-prefixed ids reached via the
 *      OMDB search fallback) for facts, AI for everything editorial,
 *      cached afterward so this only happens once per movie.
 */
export async function getMovieById(id: string): Promise<MovieDetails | undefined> {
  const seeded = findSeedMovie(id);
  if (seeded) return seeded;

  const cached = getCachedMovie(id);
  if (cached) return cached;

  let assembled: MovieDetails;

  if (id.startsWith("tmdb-")) {
    const tmdbId = Number(id.slice("tmdb-".length));
    if (!Number.isFinite(tmdbId)) return undefined;
    const facts = await getTmdbMovieFacts(tmdbId);
    assembled = await assembleMovie(id, facts, tmdbId);
  } else if (id.startsWith("omdb-")) {
    const imdbId = id.slice("omdb-".length);
    const facts = await getOmdbMovieFacts(imdbId);
    assembled = await assembleMovie(id, facts, undefined);
  } else {
    return undefined; // not an id shape we can resolve
  }

  setCachedMovie(id, assembled);
  return assembled;
}

async function assembleMovie(id: string, facts: MovieFacts, tmdbIdForSimilar: number | undefined): Promise<MovieDetails> {
  const { data: insights } = await generateStructured<GeneratedInsights>(
    buildFullInsightPrompt(facts.title, facts.year, facts.director, facts.overview),
    fullInsightSchema,
    8192
  );

  const similarMovies = await resolveSimilarMovies(tmdbIdForSimilar, insights.similarMovieTitles);

  return {
    id,
    title: facts.title,
    year: facts.year,
    tagline: facts.tagline,
    posterUrl: facts.posterUrl,
    genres: facts.genres,
    runtimeMinutes: facts.runtimeMinutes,
    director: facts.director,
    rating: facts.rating,
    castAndCrew: {
      mainCast: facts.mainCast,
      supportingCast: facts.supportingCast,
      cinematographer: facts.cinematographer,
      musicComposer: facts.musicComposer,
      editor: facts.editor,
      costumeDesigner: facts.costumeDesigner,
      vfxSupervisor: "Unknown",
    },
    spoilerFreeSummary: insights.spoilerFreeSummary,
    trivia: insights.trivia,
    timeline: insights.timeline,
    hiddenDetails: insights.hiddenDetails,
    easterEggs: insights.easterEggs,
    characterAnalysis: insights.characterAnalysis,
    endingExplained: insights.endingExplained,
    cinematography: insights.cinematography,
    soundAndMusic: insights.soundAndMusic,
    iconicQuotes: insights.iconicQuotes,
    awards: insights.awards,
    reception: insights.reception,
    legacy: insights.legacy,
    similarMovies,
  };
}

/**
 * Primary source: TMDB's own "similar movies" data for this exact title —
 * real, TMDB-curated similarity, already complete with poster/year/rating,
 * no AI involved and no extra resolution step needed. Only available when
 * this movie has a known TMDB id (tmdbIdForSimilar is undefined for
 * OMDB-sourced movies, which skip straight to the fallback below).
 *
 * Fallback: TMDB's recommendation coverage is thin for some newer or more
 * obscure titles and can come back empty (or isn't available at all for an
 * OMDB-sourced movie). When it does, fall back to the titles the AI
 * suggested while writing this movie's insights, resolving each to a real
 * TMDB entry (for its poster/year/rating) via search. A suggested title
 * that doesn't resolve to anything is just dropped — a shorter
 * similar-movies list, not a failed request.
 */
async function resolveSimilarMovies(tmdbId: number | undefined, aiSuggestedTitles: string[]): Promise<MovieSummary[]> {
  if (tmdbId !== undefined) {
    try {
      const fromTmdb = await getTmdbSimilarMovies(tmdbId, 4);
      if (fromTmdb.length > 0) return fromTmdb;
    } catch {
      // fall through to the AI-assisted path below
    }
  }

  const resolved = await Promise.all(aiSuggestedTitles.slice(0, 4).map((title) => resolveMovieSummaryByTitle(title)));
  return resolved.filter((x): x is MovieSummary => !!x);
}

/**
 * Merges hand-curated seed matches with live TMDB results, preferring the
 * seed version of a title when both exist (it's already fully written and
 * cached — no reason to show a thinner TMDB-only entry alongside it).
 * Unchanged — this backs the existing SearchBar dropdown specifically;
 * routes/searchResults.ts (TMDB/OMDB/TVmaze, paginated) is separate.
 */
export async function searchMovies(query: string): Promise<MovieSummary[]> {
  const seedMatches = searchSeedMovies(query);
  const seedTitles = new Set(seedMatches.map((m) => m.title.toLowerCase()));

  let tmdbMatches: MovieSummary[] = [];
  try {
    tmdbMatches = await searchTmdb(query);
  } catch (err) {
    // If TMDB isn't configured or the request fails, still return whatever
    // seed matches exist rather than failing the whole search.
    if (!(err instanceof TmdbNotConfiguredError)) console.error("[search] TMDB lookup failed:", err);
  }

  const deduped = tmdbMatches.filter((m) => !seedTitles.has(m.title.toLowerCase()));
  return [...seedMatches, ...deduped];
}

/**
 * Live, currently-in-theaters suggestions (TMDB's "now playing"), falling
 * back to the curated seed set if TMDB isn't configured or the request
 * fails — this used to be permanently mock data (see the backend README's
 * original note on this); now that there's a concrete "make it live"
 * answer, it's TMDB when available and the same seed fallback as before
 * when it isn't.
 */
export async function getQuickAccessMovies(): Promise<MovieSummary[]> {
  try {
    const nowPlaying = await getNowPlayingMovies(3);
    if (nowPlaying.length > 0) return nowPlaying;
  } catch (err) {
    if (!(err instanceof TmdbNotConfiguredError)) console.error("[quick-access] TMDB lookup failed:", err);
  }
  return seedMovies.slice(0, 3);
}
