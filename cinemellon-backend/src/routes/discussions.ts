import { Router, Request, Response, NextFunction } from "express";
import { getDiscussionsPage, PAGE_SIZE } from "../db/discussionsRepo.js";
import { ensureDiscussionsAvailable } from "../services/discussionsGenerator.js";

export const discussionsRouter = Router();

discussionsRouter.get("/trending-discussions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 0);
    const safePage = Number.isFinite(page) && page >= 0 ? page : 0;

    await ensureDiscussionsAvailable((safePage + 1) * PAGE_SIZE);

    res.json(getDiscussionsPage(safePage));
  } catch (err) {
    next(err);
  }
});
