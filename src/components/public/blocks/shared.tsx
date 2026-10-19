import type { ReactNode } from "react";
import { ButtonLink, Pattern } from "@/components/ui";
import type { Cta } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";

export type PatternVariant = "agrumi" | "maiolica" | "campi";
export type HeadingLevel = 1 | 2;

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

/** A validated CTA rendered as a button. `dark` = on the olive closing band. */
export function CtaLink({ cta, kind = "primary", dark, size = "md" }: { cta: Cta | null | undefined; kind?: "primary" | "secondary"; dark?: boolean; size?: "md" | "lg" }) {
  if (!cta) return null;
  if (dark) {
    return kind === "primary" ? (
      <ButtonLink href={cta.href} variant="light" size={size}>{cta.label}</ButtonLink>
    ) : (
      <ButtonLink href={cta.href} variant="secondary" size={size} className="border-paper/50 text-paper hover:border-paper hover:bg-paper/10">{cta.label}</ButtonLink>
    );
  }
  return <ButtonLink href={cta.href} variant={kind === "primary" ? "primary" : "secondary"} size={size}>{cta.label}</ButtonLink>;
}

/** Heading with the right level for the position of the block on the page. */
export function BlockHeading({ level, className, children, id }: { level: HeadingLevel; className?: string; children: ReactNode; id?: string }) {
  const Tag = level === 1 ? "h1" : "h2";
  return <Tag id={id} className={className}>{children}</Tag>;
}

/** Small label above a title. */
export function OptionalEyebrow({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return <p className={cn("stamp mb-4", className)}>{text}</p>;
}

/** Title sizes: medium-large, semibold, tight. */
export const TITLE = {
  hero: "font-semibold text-[clamp(2.3rem,5.2vw,4.1rem)] leading-[1.04] tracking-[-0.032em]",
  scene: "font-semibold text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-[-0.026em]",
  section: "font-semibold text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.1] tracking-[-0.024em]",
  panel: "font-semibold text-[clamp(1.3rem,2vw,1.6rem)] leading-[1.18] tracking-[-0.018em]",
} as const;

/** Rounded photo frame used across the site. */
export const PHOTO = "w-full rounded-[1.25rem]";
