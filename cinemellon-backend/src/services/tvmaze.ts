import { TvShowSummary, TvShowDetails } from "../types.js";
import { resilientFetch } from "./httpClient.js";

const TVMAZE_BASE = "https://api.tvmaze.com";

interface TvMazeImage {
  medium: string;
  original: string;
}

interface TvMazeShow {
  id: number;
  name: string;
  premiered: string | null;
  image: TvMazeImage | null;
  genres: string[];
  rating: { average: number | null };
  network: { name: string } | null;
  webChannel: { name: string } | null;
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  summary: string | null;
  _embedded?: {
    cast?: { person: { name: string } }[];
    seasons?: { episodeOrder: number | null }[];
  };
}

interface TvMazeSearchItem {
  score: number;
  show: TvMazeShow;
}

async function tvmazeFetch<T>(path: string): Promise<T> {
  const res = await resilientFetch(`${TVMAZE_BASE}${path}`);
  if (!res.ok) throw new Error(`TVmaze request failed (${res.status} ${res.statusText}) for ${path}`);
  return res.json() as Promise<T>;
}

function posterUrl(image: TvMazeImage | null): string {
  return image?.original || image?.medium || "https://placehold.co/500x750/191919/A6A6AA?text=No+Poster";
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]+>/g, "").trim() : "";
}

function toSummary(show: TvMazeShow): TvShowSummary {
  return {
    id: `tvmaze-${show.id}`,
    title: show.name,
    year: show.premiered ? Number(show.premiered.slice(0, 4)) : 0,
    posterUrl: posterUrl(show.image),
    rating: show.rating?.average ?? undefined,
  };
}

/**
 * TVmaze's search has no page parameter — it returns its full set of
 * ranked matches (typically well under 100 for any real query) in a single
 * call. routes/searchResults.ts handles "pagination" by slicing this fixed
 * set server-side, rather than TVmaze re-querying per page.
 */
export async function searchTvShows(query: string): Promise<TvShowSummary[]> {
  const data = await tvmazeFetch<TvMazeSearchItem[]>(`/search/shows?q=${encodeURIComponent(query)}`);
  return data.map((item) => toSummary(item.show));
}

export async function getTvShowDetails(tvMazeId: number): Promise<TvShowDetails> {
  const show = await tvmazeFetch<TvMazeShow>(`/shows/${tvMazeId}?embed[]=cast&embed[]=seasons`);

  const cast = (show._embedded?.cast ?? []).slice(0, 10).map((c) => c.person.name);
  const seasons = show._embedded?.seasons ?? [];
  const episodeCount = seasons.reduce((sum, s) => sum + (s.episodeOrder ?? 0), 0);

  return {
    ...toSummary(show),
    overview: stripHtml(show.summary),
    genres: show.genres,
    network: show.network?.name ?? show.webChannel?.name ?? "Unknown",
    status: show.status,
    seasons: seasons.length,
    episodes: episodeCount,
    runtimeMinutes: show.averageRuntime ?? show.runtime ?? 0,
    cast,
  };
}
