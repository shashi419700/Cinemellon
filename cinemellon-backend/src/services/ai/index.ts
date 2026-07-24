import { config } from "../../config.js";
import { generateWithAnthropic } from "./anthropic.js";
import { generateWithGemini } from "./gemini.js";

export class NoAiProviderError extends Error {
  constructor() {
    super(
      "No AI provider is configured — set ANTHROPIC_API_KEY and/or GEMINI_API_KEY in .env to enable AI-generated content."
    );
    this.name = "NoAiProviderError";
  }
}

function resolveProvider(): "anthropic" | "gemini" {
  const { aiProvider, anthropicApiKey, geminiApiKey } = config;

  if (aiProvider === "anthropic") {
    if (!anthropicApiKey) throw new Error("AI_PROVIDER is set to 'anthropic' but ANTHROPIC_API_KEY is missing.");
    return "anthropic";
  }
  if (aiProvider === "gemini") {
    if (!geminiApiKey) throw new Error("AI_PROVIDER is set to 'gemini' but GEMINI_API_KEY is missing.");
    return "gemini";
  }

  // No explicit preference — use whichever key is present, Anthropic first.
  if (anthropicApiKey) return "anthropic";
  if (geminiApiKey) return "gemini";
  throw new NoAiProviderError();
}

/**
 * Generates JSON matching `schema` using whichever provider is configured
 * (see resolveProvider above), returning both the parsed result and which
 * provider actually produced it — the frontend's AIInsightResponse.model
 * field surfaces this directly, so a "regenerated with Gemini" vs
 * "regenerated with Anthropic" distinction is visible if you ever want to
 * show it.
 */
export async function generateStructured<T>(prompt: string, schema: object, maxTokens?: number): Promise<{ data: T; model: "anthropic" | "gemini" }> {
  const provider = resolveProvider();
  const data = provider === "anthropic" ? await generateWithAnthropic<T>(prompt, schema, maxTokens) : await generateWithGemini<T>(prompt, schema);
  return { data, model: provider };
}
