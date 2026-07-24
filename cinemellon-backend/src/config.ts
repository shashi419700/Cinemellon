import "dotenv/config";

function readOptional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const config = {
  port: Number(readOptional("PORT") ?? 4000),
  corsOrigin: (readOptional("CORS_ORIGIN") ?? "http://localhost:5173,https://cinemellon-beryl.vercel.app")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, "")), // strip trailing slash(es): the browser's Origin header never has one, so a stray slash here would otherwise silently fail every CORS check
  databasePath: readOptional("DATABASE_PATH") ?? "./data/cinemellon.db",

  tmdbAccessToken: readOptional("TMDB_ACCESS_TOKEN"),
  omdbApiKey: readOptional("OMDB_API_KEY"),

  anthropicApiKey: readOptional("ANTHROPIC_API_KEY"),
  geminiApiKey: readOptional("GEMINI_API_KEY"),
  aiProvider: readOptional("AI_PROVIDER") as "anthropic" | "gemini" | undefined,
  anthropicModel: readOptional("ANTHROPIC_MODEL") ?? "claude-sonnet-5",
  geminiModel: readOptional("GEMINI_MODEL") ?? "gemini-2.5-flash",
};

/**
 * What's actually configured, for the /health endpoint and for clear startup
 * logging — so "why isn't search working" is answered by looking at one
 * response instead of grepping through .env.
 */
export function getIntegrationStatus() {
  const hasAnthropic = !!config.anthropicApiKey;
  const hasGemini = !!config.geminiApiKey;
  return {
    tmdb: !!config.tmdbAccessToken,
    omdb: !!config.omdbApiKey,
    tvmaze: true, // no API key required
    anthropic: hasAnthropic,
    gemini: hasGemini,
    aiAvailable: hasAnthropic || hasGemini,
  };
}
