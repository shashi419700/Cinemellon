import { useRef, useState, useCallback, useEffect } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import "./LineSidebar.css";

type Falloff = "linear" | "smooth" | "sharp";

const FALLOFF_CURVES: Record<Falloff, (p: number) => number> = {
  linear: (p) => p,
  smooth: (p) => p * p * (3 - 2 * p),
  sharp: (p) => p * p * p,
};

export interface LineSidebarGroupHeader {
  label: string;
  /** Insert this header immediately before the item at this index in `items`. */
  beforeIndex: number;
}

export interface LineSidebarProps {
  items: string[];
  /** Non-clickable section-group labels inserted between items. Purely visual — doesn't affect item indices, refs, or click handling. */
  groupHeaders?: LineSidebarGroupHeader[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: Falloff;
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  /** Optional controlled override — lets a scroll-spy drive which item is active. */
  activeIndex?: number | null;
  onItemClick?: (index: number, label: string) => void;
  className?: string;
}

export default function LineSidebar({
  items,
  groupHeaders = [],
  accentColor = "#FF6B6B",
  textColor = "#c4c4c4",
  markerColor = "#6c6c6c",
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = "smooth",
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = null,
  activeIndex: controlledActiveIndex,
  onItemClick,
  className = "",
}: LineSidebarProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const activeRef = useRef<number | null>(defaultActive);
  const smoothingRef = useRef(smoothing);
  const [activeIndex, setActiveIndex] = useState<number | null>(controlledActiveIndex ?? defaultActive);

  activeRef.current = controlledActiveIndex ?? activeIndex;
  smoothingRef.current = smoothing;

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const els = itemRefs.current;
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el) continue;
      const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty("--effect", value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const els = itemRefs.current;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string) => {
      setActiveIndex(index);
      onItemClick?.(index, label);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
    // Keep the sidebar's own scroll position following the active item. Without
    // this, the sidebar is just an independently-scrolling box that happens to
    // sit next to the page — as the page scroll drives activeIndex forward,
    // the newly-active item can end up below the sidebar's own clipped/visible
    // area, with no way to see it short of manually scrolling the sidebar too.
    // scrollIntoView({block:'nearest'}) is a no-op if it's already visible, so
    // this only moves anything when the sidebar has genuinely fallen behind.
    if (controlledActiveIndex != null) {
      itemRefs.current[controlledActiveIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, controlledActiveIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const effectiveActive = controlledActiveIndex ?? activeIndex;

  const style = {
    "--accent-color": accentColor,
    "--text-color": textColor,
    "--marker-color": markerColor,
    "--marker-length": `${markerLength}px`,
    "--marker-gap": `${markerGap}px`,
    "--tick-scale": tickScale,
    "--max-shift": `${maxShift}px`,
    "--item-gap": `${itemGap}px`,
    "--font-size": `${fontSize}rem`,
    "--smoothing": `${smoothing}ms`,
  } as CSSProperties;

  return (
    <nav
      className={`line-sidebar${showMarker ? " line-sidebar--markers" : ""}${
        scaleTick ? " line-sidebar--scale-tick" : ""
      }${className ? ` ${className}` : ""}`}
      style={style}
    >
      <ul ref={listRef} className="line-sidebar__list" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
        {items.map((label, index) => {
          const header = groupHeaders.find((h) => h.beforeIndex === index);
          return (
            <li key={`${label}-${index}`} className="line-sidebar__item-wrapper">
              {header && (
                <span className="line-sidebar__group-header" aria-hidden="true">
                  {header.label}
                </span>
              )}
              <div
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`line-sidebar__item${effectiveActive === index ? " line-sidebar__item--active" : ""}`}
                aria-current={effectiveActive === index ? "true" : undefined}
                onClick={() => handleClick(index, label)}
              >
                {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
                <span className="line-sidebar__label">
                  {showIndex && <span className="line-sidebar__index">{String(index + 1).padStart(2, "0")}</span>}
                  <span className="line-sidebar__text">{label}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
