"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./live.css";

/**
 * A living scene, animated like the Home hero (see live.css for the classes).
 * - Server render / no JS: no `data-live`, so the scene shows its final, still state.
 * - On mount: `data-live="wait"` arms the intro at its first frame, paused.
 * - In view: `data-live="on"`, the intro plays once and the life loops run.
 * - Out of view: `data-live="off"`, the loops pause (nothing runs off screen). Coming back resumes them.
 * Reduced motion: never armed, the final state stays still.
 * Inside the page's hero (the first block of #contenuto) the scene follows the WHOLE hero, not its own box: at the top
 * of the page it plays even when the drawing itself sits partly below the fold (short screens).
 */
export function Live({ children, className, style, threshold = 0.2 }: { children: ReactNode; className?: string; style?: CSSProperties; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.live = "wait";
    const main = document.getElementById("contenuto");
    const hero = main && [...main.children].find((c) => c instanceof HTMLElement && c.offsetHeight > 0);
    const target = hero?.contains(el) ? hero : el;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) el.dataset.live = "on";
      else if (el.dataset.live === "on") el.dataset.live = "off";
    }, { threshold: target === el ? threshold : 0 });
    io.observe(target);
    return () => io.disconnect();
  }, [threshold]);
  return <div ref={ref} className={cn("live", className)} style={style}>{children}</div>;
}
