"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PinScene } from "@/components/public/kit/PinScene";
import "./story.css";

/**
 * Client shell of the "Cosa facciamo" story: the pinned stage, plus the chip navigation (jump to a room).
 * The rooms themselves (children) are server-rendered. In reduced motion the PinScene is not pinned and the rooms
 * are stacked; chips then simply link to each room.
 */
export function StoryRig({ titles, children, label }: { titles: string[]; children: ReactNode; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = titles.length;
  const span = n - 0.5;

  useEffect(() => {
    const track = wrap.current?.firstElementChild as HTMLElement | null;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      setActive(Math.max(0, Math.min(n - 1, Math.floor(p * span + 0.5))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [n, span]);

  const jump = useCallback((e: React.MouseEvent, i: number) => {
    const track = wrap.current?.firstElementChild as HTMLElement | null;
    if (!track || track.dataset.still === "true") return; // stacked rooms: the plain anchor does the job
    e.preventDefault();
    const r = track.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + r.top + ((i + 0.38) / span) * total, behavior: "smooth" });
  }, [span]);

  return (
    <div ref={wrap} className="hs-wrap" style={{ "--span": span } as React.CSSProperties}>
      <PinScene steps={n + 0.5} label={label} stageClassName="hs-pin">
        <PinState active={active} />
        {children}
        <nav className="hs-nav" aria-label="Scegli un'attività">
          <ol>
            {titles.map((t, i) => (
              <li key={i}>
                <a href={`#cosa-${i}`} className="hs-chip" aria-current={active === i ? "step" : undefined} aria-label={`${String(i + 1).padStart(2, "0")} ${t}`} onClick={(e) => jump(e, i)}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t" aria-hidden="true">{t}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PinScene>
    </div>
  );
}

/** Writes the active room on the pin element so CSS can pause the rooms that are out of sight. */
function PinState({ active }: { active: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { ref.current?.parentElement?.setAttribute("data-active", String(active)); }, [active]);
  return <span ref={ref} hidden />;
}
