import { db } from "./index.js";
import { DiscussionThread } from "../types.js";

const countStmt = db.prepare(`SELECT COUNT(*) as n FROM discussions`);
const maxSortOrderStmt = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM discussions`);
const pageStmt = db.prepare(`
  SELECT id, title, excerpt, source_name as sourceName, source_url as sourceUrl,
         comment_count as commentCount, movie_title as movieTitle
  FROM discussions
  ORDER BY sort_order ASC
  LIMIT @limit OFFSET @offset
`);
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO discussions
    (id, title, excerpt, source_name, source_url, comment_count, movie_title, sort_order)
  VALUES
    (@id, @title, @excerpt, @sourceName, @sourceUrl, @commentCount, @movieTitle, @sortOrder)
`);

export const PAGE_SIZE = 3;

/**
 * Ordinary offset pagination — page 0 is items 0..2, page 1 is 3..5, and so
 * on. Once you're past the end, this returns an empty array, which is the
 * frontend's existing signal (via useTrendingDiscussions' getNextPageParam)
 * to stop offering "Load More" — except discussionsGenerator.ts tops this
 * table up with freshly-generated rows before that point is ever reached in
 * practice, whenever TMDB + an AI provider are configured (see
 * ensureDiscussionsAvailable). Nothing here needs to know about that; it
 * just needs to return fewer/no items once there's nothing left, and it
 * does that naturally once offset exceeds the row count.
 */
export function getDiscussionsPage(page: number): DiscussionThread[] {
  const offset = Math.max(0, page) * PAGE_SIZE;
  return pageStmt.all({ limit: PAGE_SIZE, offset }) as DiscussionThread[];
}

export function getDiscussionsCount(): number {
  return (countStmt.get() as { n: number }).n;
}

/** Appends freshly-generated rows after whatever's already cached,
 * continuing the existing sort_order sequence so pagination stays stable
 * and nothing already-served ever shifts or repeats. */
export function appendDiscussions(rows: DiscussionThread[]): void {
  const startOrder = (maxSortOrderStmt.get() as { maxOrder: number }).maxOrder + 1;
  const insertAll = db.transaction((items: DiscussionThread[]) => {
    items.forEach((row, i) => insertStmt.run({ ...row, sortOrder: startOrder + i }));
  });
  insertAll(rows);
}
