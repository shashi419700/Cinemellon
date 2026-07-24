import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import cinemellonLogo from "@/assets/cinemellon-logo.svg";

export default function Navbar() {
  const [cardOpen, setCardOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setCardOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-bone" : "text-muted hover:text-bone"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 2xl:max-w-[1400px]">
        <Link to="/" className="flex shrink-0 items-center">
          <img src={cinemellonLogo} alt="Cinemellon" className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center gap-8">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/trending" className={linkClass}>
            Trending
          </NavLink>

          <div className="relative" ref={wrapperRef}>
            <button
              onClick={() => setCardOpen((v) => !v)}
              className="text-sm font-semibold uppercase tracking-widest text-coral hover:text-clay transition-colors"
              aria-expanded={cardOpen}
              aria-haspopup="true"
            >
              Parzival
            </button>

            <AnimatePresence>
              {cardOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 rounded-xl2 border border-surface-line bg-surface-raised p-4 shadow-card"
                  role="menu"
                >
                  <p className="font-display text-base">Parzival</p>
                  <p className="mt-1 text-xs text-muted">The studio behind Cinemellon.</p>
                  <a
                    href="mailto:pranavbardiyar@gmail.com"
                    className="mt-3 flex items-center gap-2 text-sm text-coral hover:text-clay transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    pranavbardiyar@gmail.com
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}
