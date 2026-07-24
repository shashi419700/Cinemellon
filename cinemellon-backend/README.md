# Cinemellon Backend

Express API for the Cinemellon frontend — implements the five endpoints
listed in the frontend's own README: `/health`, `/movie/:id`, `/search`,
`/trending-discussions`, and `/ai/movie-insights`.

## What this does and doesn't cover

**Movies** — `GET /movie/:id` and `GET /search` are backed by two sources:

- Four hand-curated films (Inception, Arrival, The Dark Knight,
  Interstellar) migrated as-is from the frontend's former mock data —
  `src/db/seedMovies.ts`. These are returned exactly as written, never
  regenerated.
- Everything else, via [TMDB](https://www.themoviedb.org/) for factual data
  (title, cast, runtime, genres, director) plus an AI provider for
  everything TMDB doesn't have (trivia, timeline, hidden details, character
  analysis, ending explained, and so on — see `src/services/ai/prompts.ts`
  for exactly what gets generated). Assembled once per movie, then cached
  in SQLite — the first lookup for a new movie takes a few seconds; every
  one after that is instant.

**AI insights** — `POST /ai/movie-insights` powers the "Regenerate with AI"
buttons in the UI. Holds both an Anthropic and a Gemini key if you have
them; picks one per the logic in `src/services/ai/index.ts` (explicit
`AI_PROVIDER` env var if set, otherwise Anthropic if its key is present,
otherwise Gemini).

**Trending Discussions** — `GET /trending-discussions` serves from a
seeded SQLite table (`src/db/seedDiscussions.ts`, 12 threads, paginated 3
at a time via ordinary offset pagination). This is *not* pulled from any
live source — actually scraping Letterboxd/Reddit/etc. in real time raises
real reliability and terms-of-service concerns, so this stays as
curated/seeded content for now. Easy to swap the query in
`src/db/discussionsRepo.ts` for something else later if you want to change
that.

**Quick Access** — intentionally left alone. The frontend's
`getQuickAccessMovies()` keeps using its own mock data; this wasn't in the
endpoint list in the frontend README, so I didn't want to assume what you
want there (TMDB's "popular" list? a curated set? something else?). Say
the word if you want this wired up too.

I didn't have access to whatever's in `Product.md` (referenced a couple of
places in the frontend's comments but not part of what was uploaded) — if
it has more specific requirements than what I inferred from the README and
the existing type definitions, let me know and I'll adjust.

## Setup

```bash
npm install
cp .env.example .env
```

Then fill in `.env`:

- **TMDB** (needed for search and any movie beyond the original four):
  sign up free at https://www.themoviedb.org/settings/api, and use the
  "API Read Access Token" (the long one) as `TMDB_ACCESS_TOKEN`.
- **AI provider** (needed for AI insights, and for generating full details
  on any non-seeded movie): an Anthropic key from
  https://console.anthropic.com/settings/keys and/or a Gemini key from
  https://aistudio.google.com/apikey. You only need one, not both.

Nothing in this repo holds a real key — `.env` is gitignored. The server
runs and serves the four seeded movies with zero configuration; TMDB/AI
features specifically 503 with a clear message until their keys are set,
rather than failing silently or crashing.

```bash
npm run seed   # populates the discussions table — run once
npm run dev    # starts on http://localhost:4000 by default
```

Check `GET /health` any time to see which integrations are actually
configured.

## Wiring up the frontend

No frontend code changes needed — `src/services/movieService.ts` and
`aiService.ts` already call these exact endpoints whenever
`VITE_API_BASE_URL` is set. In the frontend's `.env`:

```
VITE_API_BASE_URL=http://localhost:4000
```

## Project layout

```
src/
  index.ts              Express app, route mounting, startup logging
  config.ts              env var loading
  types.ts                mirrors the frontend's types/movie.ts exactly
  db/
    index.ts               SQLite connection + schema
    seedMovies.ts            the four curated movies
    seedDiscussions.ts        the 12 seeded discussion threads
    seed.ts                   run via `npm run seed`
    discussionsRepo.ts         paginated discussion queries
    movieCacheRepo.ts           cache for TMDB/AI-assembled movies
  services/
    tmdb.ts                 TMDB API client
    movieAssembly.ts          orchestrates seed/cache/TMDB/AI into one MovieDetails
    ai/
      index.ts                 provider selection
      anthropic.ts               Anthropic client (structured output via tool use)
      gemini.ts                   Gemini client (structured output via responseSchema)
      prompts.ts                   prompt + JSON schema definitions
  routes/                  one file per endpoint (or closely related pair)
  middleware/
    errorHandler.ts          turns thrown errors into HTTP responses
```

## A note on how this was verified

I don't have network access in the sandbox this was built in, so I
couldn't run `npm install` or actually start this server against real
TMDB/Anthropic/Gemini APIs. Everything here is checked as thoroughly as
that constraint allows: every file passes a strict TypeScript compile
against hand-written type stubs for express/better-sqlite3/cors/dotenv,
and the Anthropic/Gemini/TMDB request shapes (endpoints, headers, auth,
current model names) were verified against current docs rather than
memory. But I haven't watched a real request go through it end to end —
please treat the first real run as the actual test, and tell me what
breaks if anything does.
