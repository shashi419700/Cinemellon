import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../config.js";

mkdirSync(dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
db.pragma("journal_mode = WAL");

db.exec(`
  -- Fully-assembled MovieDetails for movies looked up beyond the hand-curated
  -- seed set (see db/seedMovies.ts) — one TMDB fetch + one AI generation call
  -- the first time a given id is requested, then served from here after that.
  CREATE TABLE IF NOT EXISTS movie_cache (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  -- Trending Discussions. Seeded once via 'npm run seed'; sort_order is what
  -- /trending-discussions pages through, oldest-first, so pagination is
  -- stable across requests.
  CREATE TABLE IF NOT EXISTS discussions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    comment_count INTEGER NOT NULL,
    movie_title TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );
`);
