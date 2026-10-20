"use client";

import { useRef, type ReactNode } from "react";

/**
 * Prima/dopo: due scene identiche, la seconda a colori. Si colora scorrendo (view timeline) oppure trascinando il cursore.
 * L'input range copre tutta la scena: funziona con mouse, dito e tastiera (frecce).
 */
export function BeforeAfter({ before, after, label }: { before: ReactNode; after: ReactNode; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const take = () => {
    const el = box.current;
    if (!el || el.dataset.user === "true") return;
    const cur = parseFloat(getComputedStyle(el).getPropertyValue("--x")) || 50;
    el.style.setProperty("--x", String(cur));
    if (input.current) input.current.value = String(Math.round(cur));
    el.dataset.user = "true";
  };
  return (
    <div ref={box} className="ba" data-user="false">
      <div className="ba-layer">{before}</div>
      <div className="ba-layer ba-after">{after}</div>
      <div className="ba-handle" aria-hidden="true"><span className="ba-grip" /></div>
      <span className="ba-tag ba-tag-l t-label" aria-hidden="true">Adesso</span>
      <span className="ba-tag ba-tag-r t-label" aria-hidden="true">Prima</span>
      <input
        ref={input}
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        aria-label={label}
        className="ba-range"
        onPointerDown={take}
        onKeyDown={take}
        onInput={(e) => box.current?.style.setProperty("--x", e.currentTarget.value)}
      />
    </div>
  );
}
