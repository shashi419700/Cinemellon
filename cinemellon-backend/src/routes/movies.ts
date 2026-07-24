import { Router, Request, Response, NextFunction } from "express";
import { getMovieById, searchMovies, getQuickAccessMovies } from "../services/movieAssembly.js";

export const moviesRouter = Router();

moviesRouter.get("/movie/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) {
      res.status(404).json({ error: `No movie found for id "${req.params.id}"` });
      return;
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

moviesRouter.get("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    if (query.trim().length < 2) {
      res.json([]);
      return;
    }
    const results = await searchMovies(query);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

moviesRouter.get("/quick-access", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const movies = await getQuickAccessMovies();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});
