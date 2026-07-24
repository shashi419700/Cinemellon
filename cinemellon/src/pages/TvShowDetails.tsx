import { useParams, Link } from "react-router-dom";
import { Clock, Star, Tv, Users } from "lucide-react";
import { useTvShow } from "@/hooks/useMovies";
import BorderGlow from "@/components/BorderGlow";
import FilmStripEdge from "@/components/FilmStripEdge";
import Reveal from "@/components/Reveal";

export default function TvShowDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: show, isLoading, isError } = useTvShow(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pt-16">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="h-80 w-56 shrink-0 animate-pulse rounded-xl2 bg-surface-raised/50" />
          <div className="flex-1 space-y-4">
            <div className="h-9 w-2/3 animate-pulse rounded bg-surface-raised/50" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-raised/50" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-raised/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-display text-2xl">
          {isError ? "Something went wrong loading this series." : "We couldn't find that series."}
        </p>
        {isError && (
          <p className="mt-2 text-sm text-muted">The backend request failed — check the browser console for details.</p>
        )}
        <Link to="/" className="mt-4 inline-block text-coral hover:text-clay">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <div className="mx-auto max-w-5xl px-6 pb-24 2xl:max-w-[1200px]">
        <Reveal>
          <BorderGlow
            backgroundColor="#191919"
            glowColor="0 100% 71%"
            colors={["#FF6B6B", "#FF8E72", "#FFFFFF"]}
            borderRadius={20}
            glowRadius={36}
            glowIntensity={0.5}
            coneSpread={30}
            edgeSensitivity={35}
          >
            <section className="relative flex flex-col gap-8 overflow-hidden rounded-xl2 p-6 pr-10 sm:flex-row sm:p-8 sm:pr-14">
              <FilmStripEdge side="right" />
              <img
                src={show.posterUrl}
                alt={`${show.title} poster`}
                className="w-full max-w-[220px] rounded-xl2 border border-surface-line shadow-card sm:w-56"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Series</p>
                <h1 className="mt-1 font-display text-4xl font-semibold leading-tight">{show.title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                  <span>{show.year || "—"}</span>
                  {show.runtimeMinutes > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {show.runtimeMinutes} min/ep
                    </span>
                  )}
                  {show.rating !== undefined && (
                    <span className="flex items-center gap-1 text-clay">
                      <Star className="h-4 w-4 fill-clay" /> {show.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tv className="h-4 w-4" /> {show.network}
                  </span>
                  <span>{show.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {show.genres.map((g) => (
                    <span key={g} className="rounded-full border border-surface-line px-3 py-1 text-xs text-muted">
                      {g}
                    </span>
                  ))}
                </div>
                {(show.seasons > 0 || show.episodes > 0) && (
                  <p className="mt-4 text-sm text-muted">
                    {show.seasons} season{show.seasons === 1 ? "" : "s"}
                    {show.episodes > 0 && ` · ${show.episodes} episodes`}
                  </p>
                )}
                {show.overview && <p className="mt-5 max-w-xl text-sm leading-relaxed text-bone/90">{show.overview}</p>}
              </div>
            </section>
          </BorderGlow>
        </Reveal>

        {show.cast.length > 0 && (
          <Reveal>
            <div className="mt-10">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">
                <Users className="h-5 w-5 text-coral" /> Cast
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {show.cast.map((name) => (
                  <span key={name} className="rounded-full border border-surface-line bg-surface-raised/50 px-4 py-1.5 text-sm text-bone/90">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <p className="mt-12 text-xs text-faint">
          Series data from TVmaze. Cinemellon's deeper AI-written insights (trivia, timeline, character analysis, and
          so on) are currently a movies-only feature.
        </p>
      </div>
    </div>
  );
}
