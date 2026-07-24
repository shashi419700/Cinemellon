import { config } from "../config.js";
import { MovieSummary, PaginatedResult } from "../types.js";
import { resilientFetch } from "./httpClient.js";

const OMDB_BASE = "https://www.omdbapi.com/";

export class OmdbNotConfiguredError extends Error {
  constructor() {
    super("OMDB_API_KEY is not set — add it to .env to enable the OMDB fallback.");
    this.name = "OmdbNotConfiguredError";
  }
}

async function omdbFetch<T extends { Response: "True" | "False"; Error?: string }>(
  params: Record<string, string>
): Promise<T> {
  if (!config.omdbApiKey) throw new OmdbNotConfiguredError();

  const url = new URL(OMDB_BASE);
  url.searchParams.set("apikey", config.omdbApiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await resilientFetch(url.toString());
  if (!res.ok) throw new Error(`OMDB request failed (${res.status} ${res.statusText})`);

  const data = (await res.json()) as T;
  if (data.Response === "False") throw new Error(data.Error ?? "OMDB returned no data");
  return data;
}

function parsePoster(poster: string | undefined): string {
  return poster && poster !== "N/A" ? poster : "https://placehold.co/500x750/191919/A6A6AA?text=No+Poster";
}

// OMDB gives things like "2010" or "2010–2015" (series) — take the first 4-digit run.
function parseYear(year: string | undefined): number {
  const match = year?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Poster: string;
}

interface OmdbSearchResponse {
  Search?: OmdbSearchItem[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

const OMDB_PAGE_SIZE = 10; // fixed by OMDB itself, not our choice

/**
 * OMDB fallback search — used by routes/searchResults.ts only when TMDB
 * search fails or isn't configured. Returns the same PaginatedResult shape
 * TMDB's search does, so the route can treat both sources identically.
 */
export async function searchOmdb(query: string, page: number, type: "movie" | "series"): Promise<PaginatedResult<MovieSummary>> {
  let data: OmdbSearchResponse;
  try {
    data = await omdbFetch<OmdbSearchResponse>({ s: query, type, page: String(page) });
  } catch (err) {
    // "no results for this query" and "request failed" both land here as an
    // empty page — the caller (searchResults route) already tried TMDB
    // first, so this is the last resort either way.
    if (!(err instanceof OmdbNotConfiguredError)) console.error("[search] OMDB fallback failed:", err);
    return { results: [], page, totalPages: 0, totalResults: 0 };
  }

  const totalResults = Number(data.totalResults ?? 0);
  return {
    results: (data.Search ?? []).map((item) => ({
      id: `omdb-${item.imdbID}`,
      title: item.Title,
      year: parseYear(item.Year),
      posterUrl: parsePoster(item.Poster),
    })),
    page,
    totalPages: Math.max(1, Math.ceil(totalResults / OMDB_PAGE_SIZE)),
    totalResults,
  };
}

interface OmdbDetailsResponse {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Response: "True" | "False";
  Error?: string;
}

/** Same shape as TmdbMovieFacts (see tmdb.ts) so movieAssembly.ts can use
 * either source interchangeably. OMDB gives a flat actor list with no
 * character breakdown and no crew beyond Director, so mainCast has no
 * character names and the more specialized crew roles fall back to
 * "Unknown" — the same fallback the TMDB path already uses when a specific
 * credit isn't available. */
export interface OmdbMovieFacts {
  tmdbId: number | null;
  imdbId: string;
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

export async function getOmdbMovieFacts(imdbId: string): Promise<OmdbMovieFacts> {
  const data = await omdbFetch<OmdbDetailsResponse>({ i: imdbId, plot: "full" });

  const actors = data.Actors && data.Actors !== "N/A" ? data.Actors.split(",").map((a) => a.trim()) : [];

  return {
    tmdbId: null,
    imdbId: data.imdbID,
    title: data.Title,
    year: parseYear(data.Year),
    tagline: "",
    posterUrl: parsePoster(data.Poster),
    genres: data.Genre && data.Genre !== "N/A" ? data.Genre.split(",").map((g) => g.trim()) : [],
    runtimeMinutes: parseInt(data.Runtime, 10) || 0,
    director: data.Director && data.Director !== "N/A" ? data.Director : "Unknown",
    rating: Number(data.imdbRating) || 0,
    overview: data.Plot && data.Plot !== "N/A" ? data.Plot : "",
    mainCast: actors.slice(0, 4).map((actor) => ({ actor, character: "" })),
    supportingCast: actors.slice(4, 9),
    cinematographer: "Unknown",
    musicComposer: "Unknown",
    editor: "Unknown",
    costumeDesigner: "Unknown",
  };
}
