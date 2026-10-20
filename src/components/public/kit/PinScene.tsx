"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tall scroll track with a sticky viewport-sized stage. Sets --p (0..1) on the track as it scrolls through, so SVG/CSS
 * inside can derive anything from it with calc(). `steps` = how many screens of scroll the story takes.
 * Reduced motion: --p stays 1 and the stage is not sticky (children should still make sense at p=1).
 */
export function PinScene({ children, steps = 4, className, stageClassName, label }: { children: ReactNode; steps?: number; className?: string; stageClassName?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.style.setProperty("--p", "1"); el.dataset.still = "true"; return; }
    // --p eases toward the real scroll progress every frame (critically damped), so wheel/trackpad steps never jump.
    let raf = 0;
    let target = 0;
    let cur = -1;
    const read = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const tick = () => {
      cur = cur < 0 ? target : cur + (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      el.style.setProperty("--p", cur.toFixed(4));
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => { read(); if (!raf) raf = requestAnimationFrame(tick); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <div ref={ref} role={label ? "group" : undefined} aria-label={label} className={cn("pin-wrap data-[still=true]:!h-auto", className)} style={{ height: `${steps * 100}svh`, "--p": 1 } as CSSProperties}>
      <div className={cn("pin", stageClassName)}>{children}</div>
    </div>
  );
}
