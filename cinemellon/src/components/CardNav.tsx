import { useLayoutEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import "./CardNav.css";

export interface CardNavProps {
  className?: string;
  ease?: string;
  /** Background of the popup panel. */
  baseColor?: string;
  /** Color of the hamburger/cross icon lines. */
  menuColor?: string;
  /** Background of the floating toggle button. */
  buttonBgColor?: string;
  /** Content rendered inside the popup. */
  children?: ReactNode;
}

export interface CardNavHandle {
  close: () => void;
}

const CardNav = forwardRef<CardNavHandle, CardNavProps>(function CardNav(
  { className = "", ease = "power3.out", baseColor = "#191919", menuColor = "#121212", buttonBgColor = "#FF6B6B", children },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const createTimeline = () => {
    const panelEl = panelRef.current;
    const backdropEl = backdropRef.current;
    if (!panelEl) return null;

    gsap.set(panelEl, { xPercent: 30, scale: 0.85, autoAlpha: 0, transformOrigin: "100% 50%" });
    if (backdropEl) gsap.set(backdropEl, { autoAlpha: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(panelEl, { xPercent: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease });
    if (backdropEl) {
      tl.to(backdropEl, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, "<");
    }
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease]);

  const closeDrawer = () => {
    const tl = tlRef.current;
    if (!tl || !isOpen) return;
    tl.eventCallback("onReverseComplete", () => setIsOpen(false));
    tl.reverse();
  };

  useImperativeHandle(ref, () => ({ close: closeDrawer }));

  const toggleDrawer = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isOpen) {
      setIsOpen(true);
      tl.play(0);
    } else {
      closeDrawer();
    }
  };

  return (
    <div className={className}>
      <div
        ref={backdropRef}
        className="card-nav-backdrop"
        onClick={closeDrawer}
        aria-hidden={!isOpen}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      <aside
        ref={panelRef}
        className="card-nav-drawer"
        style={{ backgroundColor: baseColor }}
        aria-hidden={!isOpen}
      >
        <div className="card-nav-content">{children}</div>
      </aside>

      {/* Rendered after the panel so it sits on top and always stays clickable — the
          hamburger/cross toggle is the only control that opens or closes this popup. */}
      <button
        type="button"
        className={`card-nav-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleDrawer}
        aria-label={isOpen ? "Close section menu" : "Open section menu"}
        aria-expanded={isOpen}
        style={{ backgroundColor: buttonBgColor, color: menuColor }}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>
    </div>
  );
});

export default CardNav;
