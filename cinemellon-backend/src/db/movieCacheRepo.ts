import { db } from "./index.js";
import { MovieDetails } from "../types.js";

const getStmt = db.prepare(`SELECT data FROM movie_cache WHERE id = ?`);
const setStmt = db.prepare(`
  INSERT OR REPLACE INTO movie_cache (id, data, created_at) VALUES (?, ?, ?)
`);

/**
 * Cache for movies assembled from TMDB + AI generation (see
 * services/movieAssembly.ts) — NOT for the hand-curated seed movies, which
 * are served directly from db/seedMovies.ts and never touch this table.
 * There's no expiry here: a movie's factual data and generated editorial
 * content don't change, so once assembled it's cached indefinitely. If you
 * want to force a re-generation for a specific id, delete its row (or the
 * whole .db file to start clean — it's gitignored and rebuilds on next
 * request either way).
 */
export function getCachedMovie(id: string): MovieDetails | undefined {
  const row = getStmt.get(id) as { data: string } | undefined;
  return row ? (JSON.parse(row.data) as MovieDetails) : undefined;
}

export function setCachedMovie(id: string, movie: MovieDetails): void {
  setStmt.run(id, JSON.stringify(movie), Date.now());
}
