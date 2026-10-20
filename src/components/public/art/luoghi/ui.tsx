import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Room, Wrap, type RoomTone } from "@/components/public/kit/Room";
import { cn } from "@/lib/utils";
import "./luoghi.css";

/** Link a pillola (voce CTA di DESIGN.md). Interno via next/link. */
export function Pill({ href, children, solid = true, className }: { href: string; children: ReactNode; solid?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("pill", solid ? "pill-solid" : "pill-line", className)}>
      {children}
      <span className="arrow" aria-hidden="true">→</span>
    </Link>
  );
}

/** Scena con nome accessibile: i livelli SVG dentro sono decorativi. */
export function SceneFrame({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      {children}
    </div>
  );
}

/** Stanza di chiusura: (opzionale) un video reale a tutta colonna, poi il logo si compone in un pannello bianco, a fianco l'invito. */
export function ClosingRoom({ tone, title, text, links, media }: { tone: Exclude<RoomTone, "white">; title: string; text: string; links: { href: string; label: string }[]; media?: ReactNode }) {
  return (
    <Room tone={tone} className="py-20 sm:py-28">
      {/* il media porta da sé il suo margine: se in produzione non c'è, non resta nessun vuoto */}
      {media && <Wrap>{media}</Wrap>}
      <Wrap className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <div className="lw-panel lw-white flex items-center justify-center px-8 py-14 sm:py-20" aria-hidden="true">
          <LogoMark build="view" className="h-44 w-auto sm:h-60" />
        </div>
        <div>
          <h2 className="t-giant">{title}</h2>
          <p className="t-lead mt-6">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((l, i) => (
              <Pill key={l.href} href={l.href} solid={i === 0}>{l.label}</Pill>
            ))}
          </div>
        </div>
      </Wrap>
    </Room>
  );
}
