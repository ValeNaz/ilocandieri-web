"use client";

import { useEffect, useState } from "react";

type Chapter = { id: string; label: string };

/** Short names for the home chapters (by block slot); other slots fall back to the section's own title. */
const LABELS: Record<string, string> = {
  hero: "Il cancello",
  identita: "Chi siamo",
  "cosa-facciamo": "Cosa facciamo",
  luoghi: "I luoghi",
  abes: "ABES",
  eventi: "Eventi",
  news: "News",
  contatti: "Partecipa",
};

/**
 * "Where am I in the journey": a small rail of dots (desktop only) listing the scenes of the page marked with
 * `data-chapter`. Discovered from the DOM after mount, so scenes that are hidden (e.g. no events) never get a dot.
 * Every dot is a plain in-page link, so it also works without any scripting beyond the highlight.
 */
export function JourneyRail() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-chapter][id]")];
    // Deferred one frame: the list comes from the DOM, which is only available after the first paint.
    const raf = requestAnimationFrame(() =>
      setChapters(
        els.map((el) => ({
          id: el.id,
          label: LABELS[el.id] ?? (el.querySelector("h1, h2")?.textContent ?? el.id).trim().slice(0, 26),
        })),
      ),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  if (chapters.length < 2) return null;
  return (
    <nav className="rail" aria-label="Capitoli della pagina">
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a href={`#${c.id}`} aria-current={active === c.id ? "true" : undefined}>
              <span aria-hidden="true" className="dot" />
              <span aria-hidden="true" className="tip">{String(i + 1).padStart(2, "0")} · {c.label}</span>
              <span className="sr-only">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
