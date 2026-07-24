import { useEffect, useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Trending from "@/pages/Trending";
import MovieDetails from "@/pages/MovieDetails";
import TvShowDetails from "@/pages/TvShowDetails";
import SearchResults from "@/pages/SearchResults";
import ScrollToTop from "@/components/ScrollToTop";
import AppLoader from "@/components/AppLoader";
import { getTrendingDiscussions, getQuickAccessMovies } from "@/services/movieService";

// Floor on how long the splash stays up, so it reads as an intentional
// branded moment rather than a flash, even when the queries below resolve
// almost instantly (e.g. once Trending Discussions already has a full cache).
const MIN_SPLASH_MS = 700;

const TRENDING_DISCUSSIONS_KEY = ["trending-discussions", 0];
const QUICK_ACCESS_KEY = ["quick-access"];

export default function App() {
  const queryClient = useQueryClient();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Kick both fetches off up front, under the exact same query keys their
  // respective hooks use, so they're already in flight (or already cached)
  // by the time Home actually mounts. Trending Discussions is the one most
  // likely to be slow on a cold cache (it can trigger a live TMDB + AI
  // generation round trip); Quick Access ("You may be looking for") is a
  // single TMDB call and normally fast, but both get the same treatment for
  // consistency and so the splash accounts for either being slow.
  useEffect(() => {
    queryClient
      .prefetchInfiniteQuery({
        queryKey: TRENDING_DISCUSSIONS_KEY,
        queryFn: ({ pageParam }) => getTrendingDiscussions(pageParam as number),
        initialPageParam: 0,
      })
      .catch(() => {
        // A failed prefetch (backend down, TMDB/AI not configured, etc.)
        // shouldn't block the app from loading — the query below still
        // settles (to an error state) either way, so appReady still flips.
      });

    queryClient
      .prefetchQuery({ queryKey: QUICK_ACCESS_KEY, queryFn: getQuickAccessMovies })
      .catch(() => {});
  }, [queryClient]);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // Directly observes the real queries' fetch status, rather than tracking
  // a separate promise ourselves — this is what actually guarantees the
  // splash stays up for as long as (and only as long as) that data is
  // genuinely still loading, no matter what triggered the fetch.
  const trendingIsFetching = useIsFetching({ queryKey: TRENDING_DISCUSSIONS_KEY }) > 0;
  const quickAccessIsFetching = useIsFetching({ queryKey: QUICK_ACCESS_KEY }) > 0;
  const appReady = minTimeElapsed && !trendingIsFetching && !quickAccessIsFetching;

  return (
    <>
      <ScrollToTop />
      <AppLoader visible={!appReady} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/show/:id" element={<TvShowDetails />} />
          <Route path="/results" element={<SearchResults />} />
        </Route>
      </Routes>
    </>
  );
}
