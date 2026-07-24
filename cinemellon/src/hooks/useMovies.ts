import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getMovieById,
  searchMoviesByQuery,
  getQuickAccessMovies,
  getTrendingDiscussions,
  searchMoviesPaginated,
  searchSeriesPaginated,
  getTvShowById,
} from "@/services/movieService";
import { MediaType } from "@/types/movie";

export const useMovie = (id: string | undefined) =>
  useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieById(id as string),
    enabled: !!id,
  });

export const useTvShow = (id: string | undefined) =>
  useQuery({
    queryKey: ["tv-show", id],
    queryFn: () => getTvShowById(id as string),
    enabled: !!id,
  });

export const useMovieSearch = (query: string) =>
  useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMoviesByQuery(query),
    enabled: query.trim().length > 1,
  });

/** Powers the SearchBar dropdown for both toggle states — movie search is
 * exactly useMovieSearch's existing query (same key, same behavior, so
 * nothing regresses there); series uses the new paginated series search,
 * taking just its first page for quick suggestions. */
export const useSearchSuggestions = (query: string, mediaType: MediaType) =>
  useQuery({
    queryKey: mediaType === "movie" ? ["search", query] : ["search-series-suggestions", query],
    queryFn: () =>
      mediaType === "movie" ? searchMoviesByQuery(query) : searchSeriesPaginated(query, 1).then((r) => r.results),
    enabled: query.trim().length > 1,
  });

/** Powers the full search-results page reached via the Curate button. */
export const useSearchResults = (query: string, mediaType: MediaType, page: number) =>
  useQuery({
    queryKey: ["search-results", mediaType, query, page],
    queryFn: () => (mediaType === "movie" ? searchMoviesPaginated(query, page) : searchSeriesPaginated(query, page)),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

export const useQuickAccessMovies = () =>
  useQuery({
    queryKey: ["quick-access"],
    queryFn: getQuickAccessMovies,
  });

export const useTrendingDiscussions = (seed: number) =>
  useInfiniteQuery({
    queryKey: ["trending-discussions", seed],
    queryFn: ({ pageParam }) => getTrendingDiscussions(pageParam),
    initialPageParam: 0,
    // Stop offering "Load More" once a page comes back short — the real
    // backend has a fixed, finite dataset, so this naturally signals "no
    // more" the moment offset pagination runs past the end. A future
    // larger/growing dataset still works correctly here; it just never
    // hits this branch until you're genuinely at the end.
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
    placeholderData: keepPreviousData,
  });
