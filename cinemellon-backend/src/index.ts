import express from "express";
import cors from "cors";
import { config, getIntegrationStatus } from "./config.js";
import "./db/index.js"; // ensures schema exists before routes can query it
import { healthRouter } from "./routes/health.js";
import { moviesRouter } from "./routes/movies.js";
import { discussionsRouter } from "./routes/discussions.js";
import { aiInsightsRouter } from "./routes/aiInsights.js";
import { searchResultsRouter } from "./routes/searchResults.js";
import { tvShowsRouter } from "./routes/tvShows.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use(healthRouter);
app.use(moviesRouter);
app.use(discussionsRouter);
app.use(aiInsightsRouter);
app.use(searchResultsRouter);
app.use(tvShowsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  const status = getIntegrationStatus();
  console.log(`Cinemellon backend listening on http://localhost:${config.port}`);
  console.log(
    `  TMDB:   ${status.tmdb ? "configured" : "NOT configured (search + new movies will 503)"}`
  );
  console.log(
    `  OMDB:   ${status.omdb ? "configured" : "not configured (movie search/lookup fallback disabled)"}`
  );
  console.log(`  TVmaze: configured (no key required)`);
  console.log(
    `  AI:     ${status.aiAvailable ? `configured (${status.anthropic ? "anthropic" : ""}${status.anthropic && status.gemini ? " + " : ""}${status.gemini ? "gemini" : ""})` : "NOT configured (AI insights will 503)"}`
  );
  if (!status.tmdb || !status.aiAvailable) {
    console.log(`  Copy .env.example to .env and fill in the missing keys to enable everything.`);
  }
});
