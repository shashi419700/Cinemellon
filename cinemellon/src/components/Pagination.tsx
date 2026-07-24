import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // Show a small window of page numbers around the current page, plus
  // first/last with an ellipsis for large gaps — avoids rendering hundreds
  // of buttons for a query with many results.
  const pages = useMemo(() => {
    const spread = 1;
    const set = new Set<number>([1, totalPages]);
    for (let i = page - spread; i <= page + spread; i++) {
      if (i >= 1 && i <= totalPages) set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Search results pages">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full p-2 text-muted transition-colors hover:text-bone disabled:opacity-30 disabled:hover:text-muted"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="px-1 text-sm text-muted">…</span>}
            <button
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                p === page ? "bg-coral text-ink" : "text-muted hover:text-bone"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full p-2 text-muted transition-colors hover:text-bone disabled:opacity-30 disabled:hover:text-muted"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
