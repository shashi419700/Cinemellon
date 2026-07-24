import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getRandomGreeting } from "@/utils/greetings";
import SearchBar from "@/components/SearchBar";
import MediaTypeToggle from "@/components/MediaTypeToggle";
import Aurora from "@/components/Aurora";
import BorderGlow from "@/components/BorderGlow";
import FilmStripEdge from "@/components/FilmStripEdge";
import { MediaType } from "@/types/movie";

export default function Hero() {
  const greeting = useMemo(getRandomGreeting, []);
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8 sm:pt-10 2xl:max-w-[1400px]">
      <BorderGlow
        backgroundColor="#191919"
        glowColor="0 100% 71%"
        colors={["#FF6B6B", "#FF8E72", "#FFFFFF"]}
        borderRadius={20}
        glowRadius={40}
        glowIntensity={0.5}
        coneSpread={30}
        edgeSensitivity={35}
      >
        <section className="relative rounded-xl2">
          <div className="absolute inset-0 overflow-hidden rounded-xl2">
            <div className="absolute inset-0 h-[520px]">
              <Aurora colorStops={["#121212", "#FF6B6B", "#FF8E72"]} amplitude={1.1} blend={0.55} speed={0.4} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface/10 via-surface/60 to-surface" />

            <FilmStripEdge side="left" />
            <FilmStripEdge side="right" />
          </div>

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-8 py-20 text-center sm:px-12 sm:py-28">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display text-5xl font-semibold tracking-tight sm:text-6xl"
            >
              CineMellon
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-coral"
            >
              A Parzival Product
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 font-display text-xl italic text-muted"
            >
              "{greeting}"
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8"
            >
              <MediaTypeToggle value={mediaType} onChange={setMediaType} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 w-full max-w-2xl"
            >
              <SearchBar mediaType={mediaType} />
            </motion.div>
          </div>
        </section>
      </BorderGlow>
    </div>
  );
}
