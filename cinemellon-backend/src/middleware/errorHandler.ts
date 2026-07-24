import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { TmdbNotConfiguredError } from "../services/tmdb.js";
import { NoAiProviderError } from "../services/ai/index.js";

/**
 * One place that turns thrown errors into HTTP responses, so route
 * handlers can just `throw` (or pass to `next(err)`) instead of each one
 * re-implementing status-code logic. Order matters here only in the sense
 * that this must be registered after all routes in index.ts.
 */
export const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof TmdbNotConfiguredError || err instanceof NoAiProviderError) {
    res.status(503).json({ error: err.message });
    return;
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Unexpected server error.";
  res.status(500).json({ error: message });
};
