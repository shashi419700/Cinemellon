import { randomUUID } from "node:crypto";
import { generateStructured } from "./ai/index.js";
import { getTrendingMovies } from "./tmdb.js";
import { getDiscussionsCount, appendDiscussions } from "../db/discussionsRepo.js";
import { getIntegrationStatus } from "../config.js";
import { DiscussionThread } from "../types.js";

/**
 * Trending Discussions is meant to feel current: real, currently-popular
 * movies (from TMDB's trending endpoint) discussed via AI-generated,
 * forum-post-style blurbs. Nothing here is attributed to a specific real
 * person or claims to be an actual quoted post — sourceName is a generic
 * platform tag, same spirit as the original hand-written seed data, just
 * generated instead of hand-written and grounded in movies that are
 * genuinely trending right now instead of a fixed list.
 */

const SOURCE_TAGS = [
  { name: "Letterboxd", url: "https://letterboxd.com" },
  { name: "Reddit", url: "https://www.reddit.com/r/movies" },
  { name: "Rotten Tomatoes", url: "https://www.rottentomatoes.com" },
];

interface GeneratedDiscussion {
  movieTitle: string;
  title: string;
  excerpt: string;
  commentCount: number;
}

const batchSchema = {
  type: "object",
  properties: {
    discussions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          movieTitle: { type: "string" },
          title: { type: "string" },
          excerpt: { type: "string" },
          commentCount: { type: "integer" },
        },
        required: ["movieTitle", "title", "excerpt", "commentCount"],
      },
    },
  },
  required: ["discussions"],
} as const;

function buildPrompt(movieTitles: string[], count: number): string {
  return `You're generating sample cards for Cinemellon, a movie exploration app's "Trending Discussions" feed — short, engaging talking points about currently popular films, in the style of a post title + excerpt from a film community.

Currently-trending films to draw from (spread across a genuine variety of these, not just one or two):
${movieTitles.map((t) => `- ${t}`).join("\n")}

Generate exactly ${count} discussion cards. For each one:
- movieTitle: must be one of the titles listed above, verbatim.
- title: a short, punchy line naming one specific, genuine talking point — a theory, a technical or creative choice, a performance, a callback, an ending debate. Not a generic "this movie is great."
- excerpt: 1-2 sentences expanding on that point, written like a thoughtful fan/critic post.
- commentCount: a plausible integer reply count for such a post (roughly 40-900).

Stay grounded in what's actually true about each film — don't invent plot specifics you're not confident about.`;
}

let inFlight: Promise<void> | null = null;

async function generateAndAppend(batchSize: number): Promise<void> {
  const trending = await getTrendingMovies(20);
  if (trending.length === 0) return;

  const prompt = buildPrompt(
    trending.map((m) => m.title),
    batchSize
  );
  const { data } = await generateStructured<{ discussions: GeneratedDiscussion[] }>(prompt, batchSchema);

  const rows: DiscussionThread[] = data.discussions.map((d, i) => {
    const source = SOURCE_TAGS[i % SOURCE_TAGS.length];
    return {
      id: `gen-${randomUUID()}`,
      title: d.title,
      excerpt: d.excerpt,
      sourceName: source.name,
      sourceUrl: source.url,
      commentCount: Math.max(1, Math.round(d.commentCount)),
      movieTitle: d.movieTitle,
    };
  });

  if (rows.length > 0) appendDiscussions(rows);
}

/**
 * Tops the discussions cache up to at least `minCount` rows if needed,
 * generating a fresh batch grounded in real TMDB trending movies. Safe to
 * call on every request: it's a no-op once there's already enough cached,
 * gracefully does nothing if TMDB/AI aren't configured (the route just
 * serves whatever's already cached — hand-seeded data included), and
 * concurrent calls share a single in-flight generation rather than
 * triggering duplicate TMDB/AI requests or duplicate inserts.
 */
export async function ensureDiscussionsAvailable(minCount: number, batchSize = 12): Promise<void> {
  if (getDiscussionsCount() >= minCount) return;

  const status = getIntegrationStatus();
  if (!status.tmdb || !status.aiAvailable) return;

  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      // Re-check inside the lock: another concurrent request may have just
      // finished generating enough while we were waiting to get here.
      if (getDiscussionsCount() >= minCount) return;
      await generateAndAppend(batchSize);
    } catch (err) {
      // Generation failed (rate limit, transient network error, etc.) —
      // log it and let the route serve whatever's already cached rather
      // than failing the request entirely.
      console.error("[discussions] generation failed, serving cached data instead:", err);
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
