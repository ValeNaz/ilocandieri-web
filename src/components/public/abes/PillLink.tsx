import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pill CTA (kit.css .pill). Internal paths use next/link, https links open in a new tab and say so to screen readers. */
export function PillLink({ href, kind = "solid", children, className, arrow = true }: { href: string; kind?: "solid" | "line"; children: ReactNode; className?: string; arrow?: boolean }) {
  const cls = cn("pill", kind === "solid" ? "pill-solid" : "pill-line", className);
  const inner = (
    <>
      {children}
      {arrow && <span className="arrow" aria-hidden="true">→</span>}
    </>
  );
  if (/^https?:/.test(href)) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {inner}
        <span className="sr-only"> (si apre in una nuova scheda)</span>
      </a>
    );
  }
  return <Link href={href} className={cls}>{inner}</Link>;
}
