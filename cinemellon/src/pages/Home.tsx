import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import TrendingDiscussion from "@/components/TrendingDiscussion";
import SpecularButton from "@/components/SpecularButton";
import Reveal from "@/components/Reveal";
import { useQuickAccessMovies } from "@/hooks/useMovies";

export default function Home() {
  const { data: suggestions = [], isLoading } = useQuickAccessMovies();

  return (
    <>
      <Hero />

      {isLoading && (
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-2">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-faint">
            You may be looking for
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full border border-surface-line bg-surface-line/30" />
            ))}
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 pb-10 pt-2">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-faint">
              You may be looking for
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((movie) => (
                <QuickAccessPill key={movie.id} id={movie.id} title={movie.title} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <TrendingDiscussion />
    </>
  );
}

function QuickAccessPill({ id, title }: { id: string; title: string }) {
  const navigate = useNavigate();

  return (
    <SpecularButton
      size="sm"
      radius={999}
      tint="#FFFFFF"
      tintOpacity={0.03}
      textColor="#A6A6AA"
      lineColor="#FF6B6B"
      baseColor="#3A3A3A"
      intensity={0.5}
      shineSize={9}
      shineFade={50}
      thickness={1}
      speed={0.25}
      followMouse
      proximity={100}
      onClick={() => navigate(`/movie/${id}`)}
      className="border border-surface-line"
    >
      {title}
    </SpecularButton>
  );
}
