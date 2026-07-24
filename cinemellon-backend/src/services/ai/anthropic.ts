import { config } from "../../config.js";
import { resilientFetch } from "../httpClient.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicContentBlock {
  type: string;
  input?: unknown;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

/**
 * Structured output via forced tool-use rather than "please respond with
 * JSON" prompting — the model is required to call a single tool whose
 * input_schema is exactly what we asked for, which is far more reliable
 * than parsing JSON out of free-form text (no code-fence stripping, no
 * risk of the model adding commentary before/after the JSON).
 */
export async function generateWithAnthropic<T>(prompt: string, schema: object, maxTokens = 4096): Promise<T> {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const res = await resilientFetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: "submit_content",
          description: "Submit the generated content, matching the required schema exactly.",
          input_schema: schema,
        },
      ],
      tool_choice: { type: "tool", name: "submit_content" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API request failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const toolUse = data.content.find((block) => block.type === "tool_use");

  if (!toolUse || toolUse.input === undefined) {
    throw new Error("Anthropic response did not include the expected tool_use block.");
  }

  return toolUse.input as T;
}
