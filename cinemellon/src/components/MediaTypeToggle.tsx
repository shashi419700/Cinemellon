import { MediaType } from "@/types/movie";

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

export default function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-surface-line bg-surface-raised/60 p-1" role="tablist" aria-label="Search movies or series">
      {(["movie", "series"] as const).map((option) => (
        <button
          key={option}
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={`rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors ${
            value === option ? "bg-coral text-ink" : "text-muted hover:text-bone"
          }`}
        >
          {option === "movie" ? "Movie" : "Series"}
        </button>
      ))}
    </div>
  );
}
