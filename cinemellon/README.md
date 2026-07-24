# Cinemellon — Frontend (Phase 1)

An AI-powered movie exploration app. This is the **frontend-only** build:
everything runs on mock data so the whole experience — Home, search,
Movie Details, Trending Discussions — is fully clickable before the
backend exists.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## What's real vs. mocked right now

| Feature | Status |
|---|---|
| Home page, Hero, Quick Access, Search dropdown | Fully working, mock data |
| Movie Details (all 7 sections) | Fully working — mock data for the 4 seeded movies, TMDB + AI-generated for any other movie once the backend is running |
| Similar Movies navigation | Fully working — links between the 4 seeded movies, plus AI-suggested links (resolved to real TMDB ids) for others |
| Trending Discussions (Load More / Refresh) | Working, cycles mock threads until `VITE_API_BASE_URL` is set, then reads from the backend's seeded set (12 threads, real pagination) |
| TMDB movie data | Backend is up — see `../cinemellon-backend`. Set `VITE_API_BASE_URL` below and this switches over automatically, no frontend changes needed |
| AI insights (trivia, timeline, etc.) | Backend is up — same as above. Needs an Anthropic and/or Gemini key in the backend's `.env` to actually generate content; falls back to mock data here if the backend isn't reachable |

No API key ever lives in the frontend. `aiService.ts` and `movieService.ts`
both check for `VITE_API_BASE_URL` (see `.env.example`) and call your
backend instead of the mock data once it's set — the backend is what
should hold the Gemini/Anthropic keys and pick between them.

## Structure

```
src/
  components/   Navbar, Hero, SearchBar, MovieCard, TrendingDiscussion, SimilarMovies
  pages/        Home, Trending, MovieDetails
  layouts/      MainLayout (navbar + outlet)
  hooks/        useMovies.ts — TanStack Query wrappers
  services/     movieService.ts, aiService.ts — swap point for the real backend
  data/         mockMovies.ts — delete this once TMDB is wired in
  types/        shared TS interfaces
  utils/        greetings.ts — rotating niche hero greetings
```

## Design tokens

Matches `Product.md` exactly:

- Background `#121212`, accent gradient `#FF6B6B → #FF8E72`, neutral `#FFFFFF`
- Headline face **Playfair Display**, body face **Inter**
- Dark-first, coral used sparingly for CTAs / active states / highlights

## Next steps (Phase 2+ per the roadmap)

1. Stand up the Express backend (`/health`, `/movie/:id`, `/search`,
   `/trending-discussions`, `/ai/movie-insights`).
2. Set `VITE_API_BASE_URL` in `.env.local` — the frontend will start
   calling it automatically.
3. Delete `src/data/mockMovies.ts` once TMDB data is flowing.
