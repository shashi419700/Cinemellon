import { MovieSummary } from "@/types/movie";
import MovieCard from "@/components/MovieCard";

export default function SimilarMovies({ movies }: { movies: MovieSummary[] }) {
  if (movies.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Similar Movies</h2>
      <p className="mt-1 text-sm text-muted">Keep exploring — each card opens its own story.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} rating={m.rating} />
        ))}
      </div>
    </section>
  );
}
