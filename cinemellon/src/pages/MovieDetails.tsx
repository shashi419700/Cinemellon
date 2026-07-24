import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Clock, Star, Quote, RefreshCw, ChevronDown, AlertTriangle } from "lucide-react";
import { useMovie } from "@/hooks/useMovies";
import SimilarMovies from "@/components/SimilarMovies";
import { getAIInsight } from "@/services/aiService";
import { MovieDetails as MovieDetailsType, EndingExplained } from "@/types/movie";
import BorderGlow from "@/components/BorderGlow";
import LineSidebar from "@/components/LineSidebar";
import CardNav, { type CardNavHandle } from "@/components/CardNav";
import Reveal from "@/components/Reveal";
import FilmStripEdge from "@/components/FilmStripEdge";

const SECTION_IDS = [
  "basic-info",
  "trivia",
  "cast-crew",
  "timeline",
  "hidden-details",
  "easter-eggs",
  "character-analysis",
  "ending-explained",
  "cinematography",
  "sound-music",
  "iconic-quotes",
  "awards",
  "reception",
  "legacy",
  "similar-movies",
];

const SIDEBAR_LABELS = [
  "Basic Info",
  "Trivia",
  "Cast & Crew",
  "Timeline",
  "Hidden Details",
  "Easter Eggs",
  "Characters",
  "Ending",
  "Cinematography",
  "Sound & Music",
  "Quotes",
  "Awards",
  "Reception",
  "Legacy",
  "Similar",
];

// Non-clickable group labels for the LineSidebar, mapped onto the existing
// item order above (which stays exactly as-is — this only inserts headers,
// it doesn't reorder or rename anything). Group sizes (3/5/3/4) are unchanged
// by swapping Trivia and Cast & Crew above, so these positions still hold.
const SIDEBAR_GROUP_HEADERS = [
  { label: "OVERVIEW", beforeIndex: 0 },
  { label: "STORY", beforeIndex: 3 },
  { label: "CRAFT", beforeIndex: 8 },
  { label: "IMPACT", beforeIndex: 11 },
];

// Which collapsible sections start open vs. collapsed. Lifted up here (rather
// than each SectionBlock owning its own state) so that clicking a section in
// the sidebar can force it open even if it's currently collapsed.
const INITIAL_OPEN_SECTIONS: Record<string, boolean> = {
  "cast-crew": true,
  "character-analysis": false,
  cinematography: false,
  "sound-music": false,
  awards: false,
  reception: false,
  legacy: false,
};

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: movie, isLoading, isError } = useMovie(id);
  const [trivia, setTrivia] = useState<string[] | null>(null);
  const [triviaError, setTriviaError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(INITIAL_OPEN_SECTIONS);
  const cardNavRef = useRef<CardNavHandle>(null);

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  // Scroll-spy: on every scroll tick, find the last section whose top has
  // scrolled past a fixed reference line just under the sticky navbar.
  // (A thin IntersectionObserver band was tried first, but it's unreliable
  // against sections of very different heights — several are collapsed by
  // default and only a couple lines tall — so this walks the list directly.)
  useEffect(() => {
    if (!movie) return;
    const elements = SECTION_IDS.map((sectionId) => document.getElementById(sectionId));
    if (elements.every((el) => !el)) return;

    const REFERENCE_OFFSET = 140; // px below viewport top — clears the sticky navbar

    function updateActiveSection() {
      // Special-case the bottom of the page: the last section can be short
      // enough that its top never actually reaches the reference line before
      // the page runs out of room to scroll further — the walk below would
      // then never select it, leaving the second-to-last section highlighted
      // even once you've scrolled all the way down. Treat "at the bottom" as
      // "last section active," full stop.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveSection(elements.length - 1);
        return;
      }

      let current = 0;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top - REFERENCE_OFFSET <= 0) {
          current = i;
        } else {
          break;
        }
      }
      setActiveSection(current);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
    }

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [movie]);

  if (isLoading) {
    return <MovieDetailsSkeleton />;
  }

  if (!movie) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-display text-2xl">
          {isError ? "Something went wrong loading this movie." : "We couldn't find that movie."}
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

  const similarMovies = movie.similarMovies;

  async function regenerateTrivia() {
    setRegenerating(true);
    setTriviaError(null);
    try {
      const res = await getAIInsight({ movieTitle: movie!.title, section: "trivia" });
      setTrivia(res.content);
    } catch (err) {
      console.error("Failed to regenerate trivia:", err);
      setTriviaError("Couldn't reach the AI backend — check the console for details.");
    } finally {
      setRegenerating(false);
    }
  }

  function handleSidebarClick(index: number) {
    const targetId = SECTION_IDS[index];
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(index);
    // If the section being navigated to is collapsible, force it open — landing on a
    // closed accordion via the sidebar would otherwise show nothing but its header.
    setOpenSections((prev) => (targetId in prev ? { ...prev, [targetId]: true } : prev));
    cardNavRef.current?.close();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16 2xl:max-w-[1400px]">
      {/* Section nav — mobile/tablet only: floating toggle + right-side drawer */}
      <div className="lg:hidden">
        <CardNav ref={cardNavRef} baseColor="#191919" menuColor="#121212" buttonBgColor="#FF6B6B">
          <LineSidebar
            items={SIDEBAR_LABELS}
            groupHeaders={SIDEBAR_GROUP_HEADERS}
            activeIndex={activeSection}
            onItemClick={handleSidebarClick}
            accentColor="#FF6B6B"
            textColor="#A6A6AA"
            markerColor="#6E6E73"
            showIndex
            showMarker
            proximityRadius={60}
            maxShift={3}
            markerLength={20}
            itemGap={12}
            fontSize={0.9}
            smoothing={120}
          />
        </CardNav>
      </div>

      <div className="lg:grid lg:grid-cols-[160px_1fr] lg:gap-16">
        {/* Section nav — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto overflow-x-hidden pr-1 line-sidebar-scroll">
            <LineSidebar
              items={SIDEBAR_LABELS}
              groupHeaders={SIDEBAR_GROUP_HEADERS}
              activeIndex={activeSection}
              onItemClick={handleSidebarClick}
              accentColor="#FF6B6B"
              textColor="#A6A6AA"
              markerColor="#6E6E73"
              showIndex
              showMarker
              proximityRadius={80}
              maxShift={5}
              markerLength={24}
              itemGap={14}
              fontSize={0.78}
              smoothing={120}
            />
          </div>
        </aside>

        <div className="max-w-5xl">
          {/* Basic Information */}
          <div id="basic-info" className="scroll-mt-28">
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
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  className="w-full max-w-[220px] rounded-xl2 border border-surface-line shadow-card sm:w-56"
                />
                <div>
                  <h1 className="font-display text-4xl font-semibold leading-tight">{movie.title}</h1>
                  {movie.tagline && <p className="mt-2 italic text-muted">"{movie.tagline}"</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                    <span>{movie.year}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {movie.runtimeMinutes} min
                    </span>
                    <span className="flex items-center gap-1 text-clay">
                      <Star className="h-4 w-4 fill-clay" /> {movie.rating.toFixed(1)}
                    </span>
                    <span>Dir. {movie.director}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <span key={g} className="rounded-full border border-surface-line px-3 py-1 text-xs text-muted">
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 max-w-xl text-sm leading-relaxed text-bone/90">{movie.spoilerFreeSummary}</p>
                </div>
              </section>
            </BorderGlow>
            </Reveal>
          </div>

          {/* Trivia */}
          <SectionBlock
            id="trivia"
            title="Trivia"
            icon={<Sparkles className="h-5 w-5 text-coral" />}
            action={
              <button
                onClick={regenerateTrivia}
                disabled={regenerating}
                className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-coral disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                Regenerate with AI
              </button>
            }
          >
            {triviaError && <p className="mb-3 text-xs text-coral">{triviaError}</p>}
            <ul className="space-y-3">
              {(trivia ?? movie.trivia).map((t, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-bone/90">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {t}
                </li>
              ))}
            </ul>
          </SectionBlock>

          {/* Cast & Crew */}
          <SectionBlock
            id="cast-crew"
            title="Cast & Crew"
            collapsible
            open={openSections["cast-crew"]}
            onToggle={() => toggleSection("cast-crew")}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Main Cast</p>
                <ul className="space-y-1.5 text-sm text-bone/90">
                  {movie.castAndCrew.mainCast.map((c) => (
                    <li key={c.character}>
                      <span className="text-clay">{c.character}</span> — {c.actor}
                    </li>
                  ))}
                </ul>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Supporting Cast</p>
                <p className="text-sm text-bone/90">{movie.castAndCrew.supportingCast.join(", ")}</p>
              </div>
              <div className="space-y-2 text-sm text-bone/90">
                <p>
                  <span className="text-muted">Director — </span>
                  {movie.director}
                </p>
                <p>
                  <span className="text-muted">Cinematographer — </span>
                  {movie.castAndCrew.cinematographer}
                </p>
                <p>
                  <span className="text-muted">Music Composer — </span>
                  {movie.castAndCrew.musicComposer}
                </p>
                <p>
                  <span className="text-muted">Editor — </span>
                  {movie.castAndCrew.editor}
                </p>
                <p>
                  <span className="text-muted">Costume Designer — </span>
                  {movie.castAndCrew.costumeDesigner}
                </p>
                <p>
                  <span className="text-muted">VFX Supervisor — </span>
                  {movie.castAndCrew.vfxSupervisor}
                </p>
              </div>
            </div>
          </SectionBlock>

          {/* Timeline */}
          <SectionBlock id="timeline" title="Timeline">
            <ol className="border-l border-surface-line pl-6">
              {movie.timeline.map((event, i) => (
                <li key={i} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-coral-cta" />
                  <p className="font-display text-base text-clay">{event.label}</p>
                  <p className="mt-1 text-sm text-bone/90">{event.detail}</p>
                </li>
              ))}
            </ol>
          </SectionBlock>

          {/* Hidden Details */}
          <SectionBlock id="hidden-details" title="Hidden Details">
            <ul className="space-y-3">
              {movie.hiddenDetails.map((d, i) => (
                <li key={i} className="text-sm leading-relaxed text-bone/90">
                  {d}
                </li>
              ))}
            </ul>
          </SectionBlock>

          {/* Easter Eggs */}
          <SectionBlock id="easter-eggs" title="Easter Eggs">
            <ul className="space-y-3">
              {movie.easterEggs.map((d, i) => (
                <li key={i} className="text-sm leading-relaxed text-bone/90">
                  {d}
                </li>
              ))}
            </ul>
          </SectionBlock>

          {/* Character Analysis */}
          <SectionBlock
            id="character-analysis"
            title="Character Analysis"
            collapsible
            open={openSections["character-analysis"]}
            onToggle={() => toggleSection("character-analysis")}
          >
            <div className="space-y-6">
              {movie.characterAnalysis.map((c) => (
                <div key={c.name} className="rounded-xl2 border border-surface-line bg-surface-raised p-5">
                  <p className="font-display text-lg text-clay">{c.name}</p>
                  <dl className="mt-3 grid gap-3 text-sm text-bone/90 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Motivation</dt>
                      <dd className="mt-0.5">{c.motivation}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Arc</dt>
                      <dd className="mt-0.5">{c.arc}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Relationships</dt>
                      <dd className="mt-0.5">{c.relationships}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Psychological Profile</dt>
                      <dd className="mt-0.5">{c.psychologicalProfile}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wide text-muted">Symbolic Meaning</dt>
                      <dd className="mt-0.5">{c.symbolicMeaning}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Ending Explained — spoiler gated, deliberately untouched by the sidebar auto-open behavior above */}
          <EndingExplainedSection ending={movie.endingExplained} />

          {/* Cinematography */}
          <SectionBlock
            id="cinematography"
            title="Cinematography"
            collapsible
            open={openSections["cinematography"]}
            onToggle={() => toggleSection("cinematography")}
          >
            <div className="grid gap-3 text-sm text-bone/90 sm:grid-cols-2">
              <p>
                <span className="text-muted">Camera Style — </span>
                {movie.cinematography.cameraStyle}
              </p>
              <p>
                <span className="text-muted">Color Palette — </span>
                {movie.cinematography.colorPalette}
              </p>
              <p>
                <span className="text-muted">Lighting — </span>
                {movie.cinematography.lighting}
              </p>
              <p>
                <span className="text-muted">Aspect Ratio — </span>
                {movie.cinematography.aspectRatio}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Notable Shots</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-bone/90">
                {movie.cinematography.notableShots.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm text-bone/90">{movie.cinematography.visualStorytelling}</p>
          </SectionBlock>

          {/* Sound & Music */}
          <SectionBlock
            id="sound-music"
            title="Sound & Music"
            collapsible
            open={openSections["sound-music"]}
            onToggle={() => toggleSection("sound-music")}
          >
            <div className="grid gap-3 text-sm text-bone/90 sm:grid-cols-2">
              <p>
                <span className="text-muted">Composer — </span>
                {movie.soundAndMusic.composer}
              </p>
              <p>
                <span className="text-muted">Signature Soundtrack — </span>
                {movie.soundAndMusic.signatureSoundtrack}
              </p>
              <p>
                <span className="text-muted">Score Style — </span>
                {movie.soundAndMusic.backgroundScoreStyle}
              </p>
              <p>
                <span className="text-muted">Sound Design — </span>
                {movie.soundAndMusic.soundDesign}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Memorable Songs</p>
              <p className="mt-1 text-sm text-bone/90">{movie.soundAndMusic.memorableSongs.join(", ")}</p>
            </div>
          </SectionBlock>

          {/* Iconic Quotes */}
          <SectionBlock id="iconic-quotes" title="Iconic Quotes" icon={<Quote className="h-5 w-5 text-coral" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              {movie.iconicQuotes.map((q, i) => (
                <blockquote key={i} className="rounded-xl2 border border-surface-line bg-surface-raised p-5">
                  <p className="font-display text-lg italic leading-snug">"{q.quote}"</p>
                  <footer className="mt-3 text-xs uppercase tracking-wide text-muted">— {q.character}</footer>
                </blockquote>
              ))}
            </div>
          </SectionBlock>

          {/* Awards & Recognition */}
          <SectionBlock
            id="awards"
            title="Awards & Recognition"
            collapsible
            open={openSections["awards"]}
            onToggle={() => toggleSection("awards")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Oscars", movie.awards.oscars],
                  ["BAFTA", movie.awards.bafta],
                  ["Cannes", movie.awards.cannes],
                  ["Golden Globes", movie.awards.goldenGlobes],
                  ["Festival Awards", movie.awards.festivalAwards],
                  ["Major Nominations", movie.awards.majorNominations],
                ] as [string, string[]][]
              ).map(([label, list]) =>
                list.length > 0 ? (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                    <ul className="mt-1 space-y-1 text-sm text-bone/90">
                      {list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          </SectionBlock>

          {/* Reception */}
          <SectionBlock
            id="reception"
            title="Reception"
            collapsible
            open={openSections["reception"]}
            onToggle={() => toggleSection("reception")}
          >
            <div className="space-y-3 text-sm text-bone/90">
              <p>
                <span className="font-semibold text-clay">Critical Reviews — </span>
                {movie.reception.criticalReviews}
              </p>
              <p>
                <span className="font-semibold text-clay">Audience Response — </span>
                {movie.reception.audienceResponse}
              </p>
              <p>
                <span className="font-semibold text-clay">Box Office — </span>
                {movie.reception.boxOffice}
              </p>
              <p>
                <span className="font-semibold text-clay">Cult Status — </span>
                {movie.reception.cultStatus}
              </p>
            </div>
          </SectionBlock>

          {/* Legacy */}
          <SectionBlock
            id="legacy"
            title="Legacy"
            collapsible
            open={openSections["legacy"]}
            onToggle={() => toggleSection("legacy")}
          >
            <div className="space-y-3 text-sm text-bone/90">
              <p>
                <span className="font-semibold text-clay">Cultural Impact — </span>
                {movie.legacy.culturalImpact}
              </p>
              <p>
                <span className="font-semibold text-clay">Influence on Later Films — </span>
                {movie.legacy.influenceOnLaterFilms}
              </p>
              <p>
                <span className="font-semibold text-clay">Internet Memes — </span>
                {movie.legacy.internetMemes}
              </p>
              <p>
                <span className="font-semibold text-clay">Fan Theories — </span>
                {movie.legacy.fanTheories}
              </p>
              <p>
                <span className="font-semibold text-clay">Sequels / Spin-offs — </span>
                {movie.legacy.sequelsSpinoffs}
              </p>
            </div>
          </SectionBlock>

          {/* Similar Movies */}
          <div id="similar-movies" className="mt-14 scroll-mt-28">
            <Reveal>
              <SimilarMovies movies={similarMovies} />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  id,
  title,
  icon,
  action,
  collapsible = false,
  open = true,
  onToggle,
  children,
}: {
  id?: string;
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="mt-12 scroll-mt-28 border-t border-surface-line/60 pt-10">
        <div className="mb-5 flex items-center justify-between">
          {collapsible ? (
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center gap-2 font-display text-2xl font-semibold"
              aria-expanded={open}
            >
              {icon}
              {title}
              <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
              {icon}
              {title}
            </h2>
          )}
          {action}
        </div>

        <AnimatePresence initial={false}>
          {(!collapsible || open) && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Reveal>
  );
}

function EndingExplainedSection({ ending }: { ending: EndingExplained }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Reveal>
      <section id="ending-explained" className="mt-12 scroll-mt-28 border-t border-surface-line/60 pt-10">
      <div className="mb-5 flex items-center gap-2.5">
        <h2 className="font-display text-2xl font-semibold">Ending Explained</h2>
        <span className="flex items-center gap-1 rounded-full border border-coral/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-coral">
          <AlertTriangle className="h-3 w-3" />
          Spoiler Warning
        </span>
      </div>

      {!revealed ? (
        <div className="rounded-xl2 border border-dashed border-surface-line bg-surface-raised p-6 text-center">
          <p className="text-sm text-muted">
            This section fully explains the ending, including major plot twists and reveals.
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-full bg-coral-cta px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Reveal Spoilers
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4 text-sm leading-relaxed text-bone/90"
        >
          <p>
            <span className="font-semibold text-clay">Breakdown — </span>
            {ending.breakdown}
          </p>
          <p>
            <span className="font-semibold text-clay">Symbolism — </span>
            {ending.symbolism}
          </p>
          <p>
            <span className="font-semibold text-clay">What Happened — </span>
            {ending.whatHappened}
          </p>
          <div>
            <p className="font-semibold text-clay">Alternate Interpretations</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {ending.alternateInterpretations.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </section>
    </Reveal>
  );
}

function MovieDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-12 sm:py-16 2xl:max-w-[1400px]">
      <div className="lg:grid lg:grid-cols-[160px_1fr] lg:gap-16">
        <div className="hidden lg:block" />
        <div className="max-w-5xl">
          <div className="rounded-xl2 border border-surface-line bg-surface-raised p-6 sm:p-8">
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="h-[330px] w-full max-w-[220px] shrink-0 rounded-xl2 bg-surface-line/60 sm:w-56" />
              <div className="flex-1 space-y-4">
                <div className="h-9 w-2/3 rounded bg-surface-line/60" />
                <div className="h-4 w-1/3 rounded bg-surface-line/40" />
                <div className="flex gap-4">
                  <div className="h-4 w-16 rounded bg-surface-line/40" />
                  <div className="h-4 w-20 rounded bg-surface-line/40" />
                  <div className="h-4 w-12 rounded bg-surface-line/40" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-surface-line/40" />
                  <div className="h-6 w-20 rounded-full bg-surface-line/40" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full rounded bg-surface-line/40" />
                  <div className="h-3.5 w-full rounded bg-surface-line/40" />
                  <div className="h-3.5 w-2/3 rounded bg-surface-line/40" />
                </div>
              </div>
            </div>
          </div>

          {[1, 2].map((i) => (
            <div key={i} className="mt-12 border-t border-surface-line/60 pt-10">
              <div className="mb-5 h-7 w-40 rounded bg-surface-line/50" />
              <div className="space-y-3">
                <div className="h-3.5 w-full rounded bg-surface-line/30" />
                <div className="h-3.5 w-5/6 rounded bg-surface-line/30" />
                <div className="h-3.5 w-2/3 rounded bg-surface-line/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
