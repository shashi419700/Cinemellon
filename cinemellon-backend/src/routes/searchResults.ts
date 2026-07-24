import { Router, Request, Response, NextFunction } from "express";
import { searchTmdbPaginated } from "../services/tmdb.js";
import { searchOmdb } from "../services/omdb.js";
import { searchTvShows } from "../services/tvmaze.js";
import { PaginatedResult, MovieSummary, TvShowSummary } from "../types.js";

export const searchResultsRouter = Router();

const EMPTY_PAGE = { results: [], page: 1, totalPages: 0, totalResults: 0 };

/**
 * Movie search for the full results page: TMDB first (genuine server-side
 * pagination), falling back to OMDB (also genuinely paginated) only if
 * TMDB fails outright or is unconfigured, or comes back with zero results
 * for this query. Distinct from GET /search (the dropdown's route, used by
 * SearchBar) — that one is untouched by any of this.
 */
searchResultsRouter.get("/search/movies", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    if (!q) return res.json(EMPTY_PAGE satisfies PaginatedResult<MovieSummary>);

    let result: PaginatedResult<MovieSummary> | null = null;
    try {
      const tmdbResult = await searchTmdbPaginated(q, page);
      if (tmdbResult.totalResults > 0) result = tmdbResult;
    } catch (err) {
      console.error("[search/movies] TMDB search failed, falling back to OMDB:", err);
    }

    if (!result) result = await searchOmdb(q, page, "movie");

    res.json(result);
  } catch (err) {
    next(err);
  }
});

const TV_PAGE_SIZE = 10;

/**
 * Series search: TVmaze has no page parameter on its search endpoint — it
 * returns its full set of ranked matches in one call, typically well under
 * 100 for any real query. "Pagination" here is slicing that fixed set
 * server-side, so the frontend's pagination UI works identically for both
 * media types even though only one of them has a truly paginated backend.
 */
searchResultsRouter.get("/search/series", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    if (!q) return res.json(EMPTY_PAGE satisfies PaginatedResult<TvShowSummary>);

    let all: TvShowSummary[] = [];
    try {
      all = await searchTvShows(q);
    } catch (err) {
      // TVmaze itself unreachable/down — degrade to "no results" rather
      // than failing the request, same philosophy as the movie search
      // above and the rest of this codebase.
      console.error("[search/series] TVmaze search failed:", err);
    }

    const totalResults = all.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / TV_PAGE_SIZE));
    const start = (page - 1) * TV_PAGE_SIZE;

    res.json({
      results: all.slice(start, start + TV_PAGE_SIZE),
      page,
      totalPages,
      totalResults,
    } satisfies PaginatedResult<TvShowSummary>);
  } catch (err) {
    next(err);
  }
});
