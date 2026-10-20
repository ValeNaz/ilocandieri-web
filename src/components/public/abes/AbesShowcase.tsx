// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props stay stable; new props are optional additions.
import Image from "next/image";
import type { CSSProperties } from "react";
import { C, Wheat } from "@/components/public/art/parts";
import { Jar, PastaPack } from "@/components/public/art/abes/parts";
import { Room, type RoomTone, Wrap } from "@/components/public/kit/Room";
import type { ShowcaseProduct } from "@/lib/abes/public";
import { paths } from "@/lib/paths";
import { PillLink } from "./PillLink";
import { TiltLink } from "./Tilt";
import "./abes-showcase.css";

export type AbesShowcaseProps = {
  products: ShowcaseProduct[];
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string; // global CTA -> https://abes.bio/collections/all (or `ctaHref`)
  cardCtaLabel: string; // "Scopri il prodotto"
  headingLevel?: 2 | 3;
  id?: string;
  tone?: RoomTone;
  ctaHref?: string;
  moreCta?: { label: string; href: string };
};

// Tile colour (logo colours only) + text colour, cycled; sizes follow a repeating rhythm.
const TILES = [
  { bg: "var(--c-yellow)", fg: "var(--c-ink)" },
  { bg: "var(--c-green)", fg: "var(--c-white)" },
  { bg: "var(--c-orange)", fg: "var(--c-ink)" },
  { bg: "var(--c-white)", fg: "var(--c-ink)", ring: true },
] as const;
const SIZE = ["shw-xl", "", "", "shw-l", "", "", ""] as const;

function Tile({ p, i, cta, H }: { p: ShowcaseProduct; i: number; cta: string; H: "h3" | "h4" }) {
  const t = TILES[(i * 3 + (i > 3 ? 1 : 0)) % 4]!;
  const size = SIZE[i % SIZE.length]!;
  const contain = /\.png/i.test(p.imageUrl ?? "");
  return (
    <li className={size}>
      <TiltLink
        href={p.url}
        data-abes-product
        className="shw-tile"
        style={{ "--tile": t.bg, "--tfg": t.fg, ...("ring" in t ? { boxShadow: "inset 0 0 0 3px var(--c-ink)" } : {}) } as CSSProperties}
      >
        <div className={`shw-photo shw-s${i % 4}`}>
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt={p.imageAlt} fill loading={i < 4 ? "eager" : "lazy"} sizes="(min-width:1100px) 22vw, (min-width:768px) 30vw, 46vw" className={contain ? "object-contain p-3" : "object-cover"} />
          ) : (
            <svg viewBox="0 0 100 100" className="size-full" style={{ background: "var(--c-yellow)" }} aria-hidden="true" focusable="false"><Jar x={50} y={92} s={0.55} label="green" content="orange" lid="orange" name={["ABES"]} /></svg>
          )}
        </div>
        <div className="shw-body">
          {p.category && <p className="shw-cat">{p.category}</p>}
          <H className="shw-name">{p.title}</H>
          {(p.priceText || p.available !== null) && (
            <p className="shw-meta">
              {p.priceText && <span>{p.priceText}</span>}
              {p.available === false && <span>Al momento esaurito</span>}
              {p.available === true && <span>Disponibile</span>}
            </p>
          )}
          <span className="shw-go"><span>{cta}</span><span aria-hidden="true">↗</span><span className="sr-only"> (si apre su abes.bio)</span></span>
        </div>
      </TiltLink>
    </li>
  );
}

/* Scena: scaffale vuoto ma non triste: un pacco di busiate, un vasetto e una spiga sul ripiano (sul giallo del riquadro:
   niente di giallo). Fermo. */
function EmptyShelf() {
  return (
    <svg viewBox="0 0 220 150" className="mx-auto w-full max-w-[14rem]" aria-hidden="true" focusable="false">
      <PastaPack x={66} y={140} s={0.72} label="orange" name={["Busiate"]} />
      <Jar x={146} y={140} s={0.75} label="white" content="orange" lid="green" name={["ABES"]} />
      <Wheat x={196} y={140} h={80} color="orange" />
      <path d="M5 144 H215" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * ABES showcase: real products, each tile is one link to THAT product on abes.bio (new tab). No cart, no "buy now".
 * Price/availability only when the data says so. Empty list = a plain pointer to the catalogue.
 */
export function AbesShowcase({ products, eyebrow, title, text, ctaLabel, cardCtaLabel, headingLevel = 2, id, tone = "white", ctaHref = paths.abesShop, moreCta }: AbesShowcaseProps) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const CardH = headingLevel === 2 ? "h3" : "h4";
  return (
    <Room tone={tone} id={id} aria-labelledby="abes-showcase-title" className="py-16 sm:py-28">
      <Wrap>
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {eyebrow && <p className="t-label mb-4">{eyebrow}</p>}
            <H id="abes-showcase-title" className="t-scene max-w-[22ch]">{title}</H>
          </div>
          {text && <p className="t-body lg:col-span-4">{text}</p>}
        </div>

        {products.length > 0 ? (
          <ul aria-label="Prodotti ABES" className="shw-grid mt-10 sm:mt-14">
            {products.map((p, i) => <Tile key={p.id} p={p} i={i} cta={cardCtaLabel} H={CardH} />)}
          </ul>
        ) : (
          <div className="shw-empty mt-10">
            <EmptyShelf />
            <div>
              <p className="t-head">Gli scaffali sono sul negozio.</p>
              <p className="t-body mt-3">Il catalogo completo, con schede, prezzi e disponibilità aggiornati, è su abes.bio.</p>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 sm:mt-14">
          <PillLink href={ctaHref}>{ctaLabel}</PillLink>
          {moreCta && <PillLink href={moreCta.href} kind="line">{moreCta.label}</PillLink>}
        </div>
        {products.length > 0 && <p className="t-body mt-6 max-w-xl text-[0.95rem]">Prezzi, disponibilità, ordini e spedizioni sono gestiti da ABES: ogni scheda porta alla pagina del prodotto sul loro negozio.</p>}
      </Wrap>
    </Room>
  );
}
