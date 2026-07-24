import { Router, Request, Response, NextFunction } from "express";
import { getTvShowDetails } from "../services/tvmaze.js";

export const tvShowsRouter = Router();

tvShowsRouter.get("/show/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const match = id.match(/^tvmaze-(\d+)$/);
    if (!match) return res.status(404).json({ error: "Unknown show id format" });

    const show = await getTvShowDetails(Number(match[1]));
    res.json(show);
  } catch (err) {
    next(err);
  }
});
