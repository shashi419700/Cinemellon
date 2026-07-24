import { AnimatePresence, motion } from "framer-motion";
import cinemellonLogo from "@/assets/cinemellon-logo.svg";

interface AppLoaderProps {
  visible: boolean;
}

/**
 * Full-screen branded splash shown while the app prefetches its initial
 * data (see App.tsx) — Trending Discussions' first page in particular can
 * involve a live TMDB + AI round trip on a cold cache, so this gives that a
 * place to happen before the person is looking at an empty section.
 */
export default function AppLoader({ visible }: AppLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-surface"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <img src={cinemellonLogo} alt="Cinemellon" className="h-10 w-auto sm:h-12" />
            <p className="font-display text-sm italic tracking-wide text-muted">One space to rule them all</p>
          </motion.div>
          <div className="h-[3px] w-40 overflow-hidden rounded-full bg-surface-line">
            <motion.div
              className="h-full w-1/3 rounded-full bg-coral"
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
