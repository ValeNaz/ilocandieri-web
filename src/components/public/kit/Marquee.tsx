import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Endless horizontal band. `items` repeat; decorative (aria-hidden) unless `label` is given. Pauses on hover; still under reduced motion. */
export function Marquee({ items, className, t = 40, separator }: { items: ReactNode[]; className?: string; t?: number; separator?: ReactNode }) {
  const track = (hidden: boolean) => (
    <div className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-12 whitespace-nowrap">{it}{separator}</span>
      ))}
    </div>
  );
  return (
    <div className={cn("marquee", className)} style={{ "--t": `${t}s` } as React.CSSProperties}>
      {track(false)}
      {track(true)}
    </div>
  );
}
