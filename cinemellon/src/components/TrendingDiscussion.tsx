import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTrendingDiscussions } from "@/hooks/useMovies";
import SpecularButton from "@/components/SpecularButton";
import SpotlightCard from "@/components/SpotlightCard";
import type { DiscussionThread } from "@/types/movie";

export default function TrendingDiscussion() {
  const [seed, setSeed] = useState(0);
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useTrendingDiscussions(seed);

  // Flatten the accumulated pages and drop any repeats — a harmless safety
  // net in case a batch generation ever produces an id collision or the
  // same movie gets covered twice across separate generated batches.
  const discussions = useMemo(() => {
    const seen = new Set<string>();
    const result: DiscussionThread[] = [];
    for (const page of data?.pages ?? []) {
      for (const item of page) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      }
    }
    return result;
  }, [data]);

  const isRefreshing = isFetching && !isFetchingNextPage;

  const handleRefresh = () => {
    // Bumping the seed changes the query key, which discards accumulated
    // pages and restarts cleanly from page 0 — the real dataset is a fixed,
    // ordered set rather than the infinite mock pool this used to jump
    // around in, so "Refresh" now means "start over," not "skip ahead."
    setSeed((s) => s + 1);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 2xl:max-w-[1400px]">
      <div className="lg:flex lg:items-start lg:gap-12">
        {/* Left: big stacked heading + Refresh — stays put on desktop while cards scroll beside it */}
        <div className="mb-8 flex items-center justify-between lg:mb-0 lg:flex-shrink-0 lg:flex-col lg:items-start lg:gap-6 lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display leading-[0.95]">
            <span className="block text-3xl sm:text-4xl">Trending</span>
            <span className="block text-4xl font-semibold sm:text-5xl">Discussions</span>
          </h2>
          <SpecularButton
            size="sm"
            radius={999}
            tint="#FFFFFF"
            tintOpacity={0.03}
            textColor="#A6A6AA"
            lineColor="#FF8E72"
            baseColor="#3A3A3A"
            intensity={0.5}
            shineSize={8}
            shineFade={45}
            thickness={1}
            speed={0.3}
            followMouse
            proximity={110}
            onClick={handleRefresh}
            disabled={isFetching}
            className="border border-surface-line"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </SpecularButton>
        </div>

        {/* Right: the cards, filling the remaining width */}
        <div className="min-w-0 flex-1">
          {discussions.length === 0 && isFetching && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Loading trending discussions">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[168px] animate-pulse rounded-2xl border border-surface-line bg-surface-raised/50"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          {discussions.length === 0 && !isFetching && (
            <p className="text-sm text-muted">No discussions yet — check back soon.</p>
          )}

          {discussions.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {discussions.map((d, i) => (
                <motion.article
                  key={d.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: (i % 4) * 0.05, duration: 0.5, ease: "easeOut" }}
                >
                  <SpotlightCard spotlightColor="rgba(255, 107, 107, 0.08)">
                    <p className="text-xs font-semibold uppercase tracking-wide text-coral">{d.movieTitle}</p>
                    <h3 className="mt-2 font-display text-lg leading-snug">{d.title}</h3>
                    <p className="mt-2 text-sm text-muted">{d.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-faint">
                      <a
                        href={d.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-coral hover:text-clay transition-colors"
                      >
                        {d.sourceName}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <span>{d.commentCount.toLocaleString()} comments</span>
                    </div>
                  </SpotlightCard>
                </motion.article>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-10 flex justify-center lg:justify-start">
              <SpecularButton
                size="md"
                radius={999}
                tint="#FFFFFF"
                tintOpacity={0.04}
                textColor="#FFFFFF"
                lineColor="#FF6B6B"
                baseColor="#3A3A3A"
                intensity={0.55}
                shineSize={8}
                shineFade={45}
                thickness={1}
                speed={0.3}
                followMouse
                proximity={120}
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                className="border border-surface-line"
              >
                Load More
                {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
              </SpecularButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
