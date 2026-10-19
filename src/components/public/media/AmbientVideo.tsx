"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import type { StockVideo } from "./stock";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => true);

/**
 * Silent looping background video. It loads nothing until it is near the viewport, plays only while visible,
 * stays on its poster when the visitor prefers reduced motion, and always offers a pause button (WCAG 2.2.2).
 * Decorative: the surrounding text carries the meaning, the video only sets the scene. `hold` keeps it paused
 * (e.g. a scene that is not the active one in a stack).
 */
export function AmbientVideo({ video, className, priority, controlClassName, hold, hideControl }: { video: StockVideo; className?: string; priority?: boolean; controlClassName?: string; hold?: boolean; hideControl?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const userPaused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || hold) { el.pause(); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry || userPaused.current) return;
        if (entry.isIntersecting) {
          if (el.preload !== "auto") el.preload = "auto";
          el.play().then(() => setPaused(false)).catch(() => setPaused(true));
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, hold]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) { userPaused.current = false; el.play().then(() => setPaused(false)).catch(() => {}); }
    else { userPaused.current = true; el.pause(); setPaused(true); }
  };

  return (
    <>
      <video
        ref={ref}
        className={cn("object-cover", className)}
        poster={video.poster}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "none"}
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={video.src} type="video/mp4" />
      </video>
      {!reduced && !hideControl && (
        <button
          type="button"
          onClick={toggle}
          className={cn("absolute bottom-4 right-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-ink/45 text-paper backdrop-blur-sm transition-colors hover:bg-ink/70", controlClassName)}
          aria-label={paused ? "Riproduci il video di sfondo" : "Metti in pausa il video di sfondo"}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
            {paused ? <path d="M6 4.5v11l9-5.5z" /> : <path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" />}
          </svg>
        </button>
      )}
    </>
  );
}
