import { useSearchParams } from "react-router-dom";
import { useSearchResults } from "@/hooks/useMovies";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";
import Reveal from "@/components/Reveal";
import { MediaType } from "@/types/movie";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const mediaType: MediaType = searchParams.get("type") === "series" ? "series" : "movie";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const { data, isLoading, isFetching, isError } = useSearchResults(query, mediaType, page);
  const results = data?.results ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalResults = data?.totalResults ?? 0;

  const basePath = mediaType === "movie" ? "/movie" : "/show";
  const label = mediaType === "movie" ? "movies" : "series";

  function goToPage(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-6 pb-24 2xl:max-w-[1400px]">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Search results</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            {query ? `"${query}"` : "Results"}
            <span className="ml-3 text-lg font-normal capitalize text-muted">— {label}</span>
          </h1>
          {!isLoading && totalResults > 0 && (
            <p className="mt-2 text-sm text-muted">
              {totalResults.toLocaleString()} result{totalResults === 1 ? "" : "s"}
            </p>
          )}
        </Reveal>

        {!query && <p className="mt-10 text-sm text-muted">Search for a {mediaType === "movie" ? "movie" : "series"} to see results here.</p>}

        {query && isLoading && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-surface-raised/50" />
            ))}
          </div>
        )}

        {query && !isLoading && isError && (
          <p className="mt-10 text-sm text-coral">
            Something went wrong loading results — the backend request failed. Check the console for details.
          </p>
        )}

        {query && !isLoading && !isError && results.length === 0 && (
          <p className="mt-10 text-sm text-muted">
            No {label} found for "{query}". Try a different title, or check the other toggle above the search bar.
          </p>
        )}

        {query && !isLoading && !isError && results.length > 0 && (
          <>
            <div
              className={`mt-10 grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isFetching ? "opacity-60" : "opacity-100"}`}
            >
              {results.map((item) => (
                <MovieCard key={item.id} movie={item} rating={item.rating} basePath={basePath} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}
