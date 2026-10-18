import type { ReactNode } from "react";
import { ButtonLink, Pattern } from "@/components/ui";
import type { Cta } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { Stamp } from "../art/primitives";
import type { PosterTone } from "../art/poster";

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
      <Stamp className="stamp-in">{text}</Stamp>
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
