import { AIInsightRequest, AIInsightResponse } from "@/types/movie";
import { findMovieById } from "@/data/mockMovies";

/**
 * IMPORTANT: this service never holds an Anthropic or Gemini API key in the
 * browser. Real calls go through the backend's POST /ai/movie-insights,
 * which routes to either provider (see Product.md — "should work with both
 * Gemini API key and Anthropic key").
 *
 * Mock data is ONLY used when VITE_API_BASE_URL is unset entirely. Once
 * it's set, a failed request is a real, visible error — thrown to the
 * caller, never silently swapped for mock insights.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");

function mockInsight(req: AIInsightRequest): AIInsightResponse {
  const movie = findMovieById(req.movieTitle.toLowerCase().replace(/\s+/g, "-"));
  const fallback = ["No AI insight available yet for this movie."];
  const content =
    (movie &&
      {
        trivia: movie.trivia,
        timeline: movie.timeline.map((t) => `${t.label}: ${t.detail}`),
        hiddenDetails: movie.hiddenDetails,
        easterEggs: movie.easterEggs,
        quotes: movie.iconicQuotes.map((q) => `"${q.quote}" — ${q.character}`),
      }[req.section]) || fallback;

  return { content, model: "anthropic" };
}

export async function getAIInsight(req: AIInsightRequest): Promise<AIInsightResponse> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/ai/movie-insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AI insight request failed: ${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 300)}` : ""}`);
    }
    return res.json();
  }
  return new Promise((resolve) => setTimeout(() => resolve(mockInsight(req)), 300));
}
