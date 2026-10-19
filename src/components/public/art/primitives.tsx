import type { ReactNode } from "react";
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
