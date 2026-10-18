import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The orange-slice mark: disc, rind ring and eight segments. Colors are inherited from CSS variables with sensible defaults. */
export function OrangeMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={cn("shrink-0", className)}>
      <circle cx="32" cy="32" r="30" fill="var(--mark-disc, var(--color-arancio))" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="var(--mark-line, var(--color-paper))" strokeWidth="2.6" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        return <line key={i} x1="32" y1="32" x2={32 + 24 * Math.cos(a)} y2={32 + 24 * Math.sin(a)} stroke="var(--mark-line, var(--color-paper))" strokeWidth="2.2" strokeLinecap="round" />;
      })}
      <circle cx="32" cy="32" r="3.2" fill="var(--mark-line, var(--color-paper))" />
    </svg>
  );
}

/** Rubber-stamp label in stencil lettering (chapter names, eyebrows). Rotation and entrance are in journey.css. */
export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("stamp", className)}>{children}</span>;
}

/**
 * Circular seal with text on a path, like the mark pressed on a crate. Decorative; rotates with scroll
 * where supported (journey.css `.seal`). `label` is only for readers who need the text, the ring itself is aria-hidden.
 */
export function Seal({ className, text = "I LOCANDIERI · COOPERATIVA SOCIALE · CASTELVETRANO · " }: { className?: string; text?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" viewBox="0 0 240 240" className={cn("seal", className)}>
      <defs>
        <path id={`${id}-p`} d="M120 120 m-93 0 a93 93 0 1 1 186 0 a93 93 0 1 1 -186 0" />
      </defs>
      <circle cx="120" cy="120" r="117" fill="var(--seal-bg, var(--color-paper))" />
      <circle cx="120" cy="120" r="108" fill="none" stroke="var(--seal-ink, var(--color-ink))" strokeWidth="3" />
      <circle cx="120" cy="120" r="66" fill="none" stroke="var(--seal-ink, var(--color-ink))" strokeWidth="2" />
      <text fontFamily="var(--font-stencil)" fontWeight="700" fontSize="17" fill="var(--seal-ink, var(--color-ink))">
        <textPath href={`#${id}-p`} textLength="578" lengthAdjust="spacing">{text}</textPath>
      </text>
      <g transform="translate(120 120)">
        <circle r="50" fill="var(--color-arancio)" />
        <circle r="41" fill="none" stroke="var(--seal-bg, var(--color-paper))" strokeWidth="3.5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          return <line key={i} x1="0" y1="0" x2={41 * Math.cos(a)} y2={41 * Math.sin(a)} stroke="var(--seal-bg, var(--color-paper))" strokeWidth="3" strokeLinecap="round" />;
        })}
        <circle r="5" fill="var(--seal-bg, var(--color-paper))" />
      </g>
    </svg>
  );
}
