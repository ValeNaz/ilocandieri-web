"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted looping video for a real-media slot. Loads nothing until near the viewport (preload="none"), plays only while
 * visible, stays on the poster with prefers-reduced-motion. The pause/play button is always there (WCAG 2.2.2).
 */
export function RealVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tryPlay = () => { if (!userPaused.current && !reduce.matches) v.play().catch(() => setPlaying(false)); };
    const nearIo = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setNear(true); nearIo.disconnect(); } }, { rootMargin: "300px 0px" });
    const seenIo = new IntersectionObserver(([e]) => { if (e?.isIntersecting) tryPlay(); else v.pause(); }, { threshold: 0.35 });
    const onReduce = () => { if (reduce.matches) v.pause(); };
    nearIo.observe(v);
    seenIo.observe(v);
    reduce.addEventListener("change", onReduce);
    return () => { nearIo.disconnect(); seenIo.disconnect(); reduce.removeEventListener("change", onReduce); };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { userPaused.current = false; setNear(true); v.play().catch(() => setPlaying(false)); }
    else { userPaused.current = true; v.pause(); }
  };

  return (
    <>
      <video ref={ref} className="absolute inset-0 size-full object-cover" src={src} poster={poster} muted loop playsInline preload={near ? "metadata" : "none"}
        aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button type="button" onClick={toggle} aria-label={playing ? "Metti in pausa il video" : "Riproduci il video"}
        className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white text-ink ring-2 ring-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
        </svg>
      </button>
    </>
  );
}
