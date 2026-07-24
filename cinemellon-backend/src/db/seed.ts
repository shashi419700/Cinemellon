import { db } from "./index.js";
import { seedDiscussions } from "./seedDiscussions.js";

const insert = db.prepare(`
  INSERT OR REPLACE INTO discussions
    (id, title, excerpt, source_name, source_url, comment_count, movie_title, sort_order)
  VALUES
    (@id, @title, @excerpt, @sourceName, @sourceUrl, @commentCount, @movieTitle, @sortOrder)
`);

const insertAll = db.transaction((rows: typeof seedDiscussions) => {
  rows.forEach((row, index) => insert.run({ ...row, sortOrder: index }));
});

insertAll(seedDiscussions);

console.log(`Seeded ${seedDiscussions.length} discussion threads into ${db.name}`);
console.log("Movie details use the hand-curated list in db/seedMovies.ts directly — nothing to seed there.");
