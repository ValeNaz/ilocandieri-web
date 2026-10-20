"use client";

import { useRef, type ReactNode } from "react";

/**
 * "Com'era / com'è": the drawing (`before`) lies over the photo (`children`) and a range input moves the cut.
 * Keyboard: arrows / Home / End on the input. Only clip-path changes (photo.css .pf-compare). No JS = half and half.
 */
export function CompareSlider({ before, children, label, left, right, className }: { before: ReactNode; children: ReactNode; label: string; left: string; right: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={`pf-compare ${className ?? ""}`}>
      {children}
      <div className="pf-before" aria-hidden="true">{before}</div>
      <span className="pf-tag pf-tag--l" aria-hidden="true">{left}</span>
      <span className="pf-tag pf-tag--r" aria-hidden="true">{right}</span>
      <input type="range" min={0} max={100} defaultValue={50} aria-label={label}
        onInput={(e) => ref.current?.style.setProperty("--cut", `${(e.target as HTMLInputElement).value}%`)} />
      <span className="pf-handle" aria-hidden="true" />
    </div>
  );
}
