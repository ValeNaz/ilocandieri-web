import type { ReactNode } from "react";
import { ButtonLink, Pattern } from "@/components/ui";
import type { Cta } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { Stamp } from "../art/primitives";

export type PosterTone = "terracotta" | "cobalto" | "limone" | "olive" | "kraft";
export type PatternVariant = "agrumi" | "maiolica" | "campi";
export type HeadingLevel = 1 | 2;

/** Color fields ("carte") a scene can be printed on, with the text color that is verified for each (contrast.test.ts). */
export const FIELD: Record<PosterTone, string> = {
  terracotta: "bg-terracotta text-paper on-dark",
  cobalto: "bg-cobalto text-paper on-dark",
  limone: "bg-limone text-ink",
  olive: "bg-olive-deep text-paper on-dark",
  kraft: "bg-kraft text-ink",
};

/** Inner pages take their color from the page they belong to (stable, so a page always has the same identity). */
const PAGE_TONE: Record<string, PosterTone> = { "chi-siamo": "terracotta", shop: "limone", eventi: "cobalto", news: "kraft", "lavora-con-noi": "olive", contatti: "cobalto" };
const TONES: PosterTone[] = ["terracotta", "cobalto", "limone", "olive", "kraft"];
export function toneForPage(pageKey: string | undefined, seed = ""): PosterTone {
  if (pageKey && PAGE_TONE[pageKey]) return PAGE_TONE[pageKey]!;
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return TONES[h % TONES.length]!;
}

/** Real image from the media library, or the decorative <Pattern> when none was chosen (never a stock/grey placeholder). */
export function MediaImage({ image, fallback = "campi", className, priority }: { image?: ResolvedImage | null; fallback?: PatternVariant; className?: string; priority?: boolean }) {
  if (!image) return <Pattern variant={fallback} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local /media files, sized by CSS
    <img src={image.url} alt={image.alt} width={image.width ?? undefined} height={image.height ?? undefined} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("object-cover", className)} />
  );
}

/** Real photos from abes.bio (the cooperative's own product shots), used when the admin has not chosen an image. */
export const FOTO = {
  ceci: { src: "/foto/ceci-juta.jpg", w: 1600, h: 900, alt: "Ceci in un sacco di juta" },
  cassette: { src: "/foto/cassette-verdure.jpg", w: 1000, h: 1000, alt: "Cassette di verdure davanti al muro ABES" },
  vasetti: { src: "/foto/vasetti-abes.jpg", w: 1000, h: 1333, alt: "Vasetti ABES di patè di melanzane, peperonata e caponata siciliana" },
  banco: { src: "/foto/abbracci-banco.jpg", w: 1000, h: 1000, alt: "Confezione di pasta Abbracci ABES su un tavolo di legno" },
  pianta: { src: "/foto/abbracci-pianta.jpg", w: 900, h: 1200, alt: "Confezione di pasta Abbracci ABES tra le foglie" },
} as const;
export type FotoKey = keyof typeof FOTO;

/** A photo from FOTO, or the admin's image when one was chosen. */
export function Foto({ image, fallback, className, priority }: { image?: ResolvedImage | null; fallback: FotoKey; className?: string; priority?: boolean }) {
  if (image) return <MediaImage image={image} className={className} priority={priority} />;
  const f = FOTO[fallback];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static files in /public/foto
    <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={cn("object-cover", className)} />
  );
}

/** Photo for the title block of an inner page. */
export const PAGE_FOTO: Record<string, FotoKey> = { "chi-siamo": "cassette", shop: "vasetti", eventi: "ceci", news: "banco", "lavora-con-noi": "pianta", contatti: "cassette" };

export const pickImage = (images: ImageMap, id: string | null | undefined) => (id ? (images[id] ?? null) : null);

/** Plain text with blank-line separated paragraphs. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={className}>{p}</p>
      ))}
    </>
  );
}

const darkOutline =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-paper px-6 text-[0.95rem] font-semibold leading-none whitespace-nowrap text-paper transition-colors duration-200 hover:bg-paper hover:text-ink";

/** A validated CTA rendered as a button. `dark` = on a saturated or ink field. */
export function CtaLink({ cta, kind = "primary", dark, size = "md" }: { cta: Cta | null | undefined; kind?: "primary" | "secondary"; dark?: boolean; size?: "md" | "lg" }) {
  if (!cta) return null;
  if (dark) {
    return kind === "primary" ? (
      <ButtonLink href={cta.href} variant="light" size={size}>{cta.label}</ButtonLink>
    ) : (
      <ExternalAware href={cta.href} className={darkOutline}>{cta.label}</ExternalAware>
    );
  }
  return <ButtonLink href={cta.href} variant={kind === "primary" ? "primary" : "secondary"} size={size}>{cta.label}</ButtonLink>;
}

function ExternalAware({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const http = /^https?:/.test(href);
  return (
    <a href={href} className={className} {...(http ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
      {http && <span className="sr-only"> (si apre in una nuova scheda)</span>}
    </a>
  );
}

/** Heading with the right level for the position of the block on the page. */
export function BlockHeading({ level, className, children, id }: { level: HeadingLevel; className?: string; children: ReactNode; id?: string }) {
  const Tag = level === 1 ? "h1" : "h2";
  return <Tag id={id} className={className}>{children}</Tag>;
}

/** The small stamped label above a title. Color follows the field it sits on (inherits currentColor). */
export function OptionalEyebrow({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn("mb-5", className)}>
      <Stamp className=" ">{text}</Stamp>
    </p>
  );
}

/** Title sizes for scenes: very large, heavy slab, tight. */
export const TITLE = {
  hero: "font-extrabold text-[clamp(2.4rem,6.2vw,5.3rem)] leading-[0.99] tracking-[-0.03em]",
  scene: "font-extrabold text-[clamp(2.1rem,4.9vw,4.2rem)] leading-[1.01] tracking-[-0.025em]",
  section: "font-extrabold text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.04] tracking-[-0.02em]",
  panel: "font-extrabold text-[clamp(1.9rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.02em]",
} as const;
