import { Router, Request, Response, NextFunction } from "express";
import { AIInsightRequest, AIInsightResponse, AIInsightSection } from "../types.js";
import { generateStructured } from "../services/ai/index.js";
import { buildSectionPrompt } from "../services/ai/prompts.js";

export const aiInsightsRouter = Router();

const VALID_SECTIONS: AIInsightSection[] = ["trivia", "timeline", "hiddenDetails", "easterEggs", "quotes"];

aiInsightsRouter.post("/ai/movie-insights", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Partial<AIInsightRequest>;

    if (!body.movieTitle || typeof body.movieTitle !== "string") {
      res.status(400).json({ error: "movieTitle is required." });
      return;
    }
    if (!body.section || !VALID_SECTIONS.includes(body.section as AIInsightSection)) {
      res.status(400).json({ error: `section must be one of: ${VALID_SECTIONS.join(", ")}` });
      return;
    }

    const { prompt, schema } = buildSectionPrompt(body.movieTitle, body.section as AIInsightSection);
    const { data, model } = await generateStructured<{ items: string[] }>(prompt, schema);

    const response: AIInsightResponse = { content: data.items, model };
    res.json(response);
  } catch (err) {
    next(err);
  }
});
