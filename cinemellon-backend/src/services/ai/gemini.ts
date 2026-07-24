import { config } from "../../config.js";
import { resilientFetch } from "../httpClient.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiResponse {
  candidates: { content: { parts: { text?: string }[] } }[];
}

/**
 * Structured output via generationConfig.responseSchema + responseMimeType:
 * "application/json" — Gemini's equivalent of Anthropic's forced tool-use.
 * The model is constrained to emit JSON matching the schema, returned as a
 * JSON string in the first candidate's text part.
 */
export async function generateWithGemini<T>(prompt: string, schema: object): Promise<T> {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const res = await resilientFetch(`${GEMINI_BASE}/${config.geminiModel}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": config.geminiApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API request failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini response did not include any content.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Gemini response was not valid JSON despite responseSchema being set.");
  }
}
