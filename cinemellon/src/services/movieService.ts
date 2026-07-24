import { MovieDetails, MovieSummary, DiscussionThread, TvShowDetails, TvShowSummary, PaginatedResult } from "@/types/movie";
import { mockMovies, findMovieById, searchMovies, mockDiscussions } from "@/data/mockMovies";

/**
 * Frontend-only mode: reads from mock data with a small artificial delay
 * so loading states can be built and tested honestly.
 *
 * Once VITE_API_BASE_URL is set, every function below talks to the real
 * backend instead. A failed backend request is now a real, visible error —
 * thrown up to React Query (or whoever called it), never silently swapped
 * for mock data. Mock data is ONLY used when API_BASE is unset entirely.
 *
 * If VITE_API_BASE_URL IS set and you're still seeing what looks like mock
 * data with nothing in the console: Vite only reads .env at server startup,
 * so a `.env` created/edited while `npm run dev` was already running won't
 * take effect until you stop and restart it.
 */

const SIMULATED_LATENCY_MS = 350;
const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");

async function backendFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Backend request failed: GET ${path} → ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 300)}` : ""}`);
  }
  return res.json();
}

export async function getMovieById(id: string): Promise<MovieDetails | undefined> {
  if (API_BASE) return backendFetch<MovieDetails>(`/movie/${id}`);
  return delay(findMovieById(id));
}

export async function searchMoviesByQuery(query: string): Promise<MovieSummary[]> {
  if (API_BASE) return backendFetch<MovieSummary[]>(`/search?q=${encodeURIComponent(query)}`);
  return delay(searchMovies(query));
}

export async function getQuickAccessMovies(): Promise<MovieSummary[]> {
  if (API_BASE) return backendFetch<MovieSummary[]>(`/quick-access`);
  return delay(mockMovies.slice(0, 3));
}

export async function getTrendingDiscussions(page: number): Promise<DiscussionThread[]> {
  if (API_BASE) return backendFetch<DiscussionThread[]>(`/trending-discussions?page=${page}`);
  // Simulate pagination by cycling the mock set with a rotating offset. Page size is
  // intentionally smaller than the mock pool (3 of 4) so Load More has genuinely new
  // items to reveal at least once before the pool is exhausted — with a real backend
  // this just becomes an ordinary offset/limit query.
  const rotated = [...mockDiscussions.slice(page % mockDiscussions.length), ...mockDiscussions].slice(0, 3);
  return delay(rotated);
}

const EMPTY_PAGE = { results: [], page: 1, totalPages: 0, totalResults: 0 };

/** Full paginated movie search backing the search-results page (the
 * "Curate" flow) — distinct from searchMoviesByQuery above, which backs
 * the SearchBar dropdown and stays exactly as it was. */
export async function searchMoviesPaginated(query: string, page: number): Promise<PaginatedResult<MovieSummary>> {
  if (API_BASE) return backendFetch<PaginatedResult<MovieSummary>>(`/search/movies?q=${encodeURIComponent(query)}&page=${page}`);
  // No TV/paginated-search mock data exists yet — mock mode reuses the
  // small seed-based match set as a single page, same spirit as the
  // dropdown's mock fallback.
  const matches = searchMovies(query);
  return delay({ results: matches, page: 1, totalPages: matches.length > 0 ? 1 : 0, totalResults: matches.length });
}

/** Paginated TV series search (TVmaze on the backend). No mock/offline
 * data exists for series — mock mode returns an honest empty result. */
export async function searchSeriesPaginated(query: string, page: number): Promise<PaginatedResult<TvShowSummary>> {
  if (API_BASE) return backendFetch(`/search/series?q=${encodeURIComponent(query)}&page=${page}`);
  return delay(EMPTY_PAGE);
}

/** TV show details (TVmaze). No mock/offline data exists for series. */
export async function getTvShowById(id: string): Promise<TvShowDetails | undefined> {
  if (API_BASE) return backendFetch<TvShowDetails>(`/show/${id}`);
  return delay(undefined);
}
