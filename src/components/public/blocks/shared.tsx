import type { ReactNode } from "react";
import Link from "next/link";
import type { Cta } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";

export type PatternVariant = "agrumi" | "maiolica" | "campi";
export type HeadingLevel = 1 | 2;

/** Real image from the media library. Without one nothing is drawn here: the caller shows an illustration instead (never stock). */
export function MediaImage({ image, className, priority }: { image?: ResolvedImage | null; fallback?: PatternVariant; className?: string; priority?: boolean }) {
  if (!image) return null;
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

/** Photo for the title block of an inner page (only pages about the cooperative or ABES). */
export const PAGE_FOTO: Partial<Record<string, FotoKey>> = { "chi-siamo": "cassette", shop: "vasetti" };

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

/**
 * A validated CTA as a pill (kit.css): primary = solid, secondary = line. The pill adapts to its room (white pill on
 * green). `dark` / `ink` / `size` are kept for old call sites and no longer change the look.
 */
export function CtaLink({ cta, kind = "primary", className }: { cta: Cta | null | undefined; kind?: "primary" | "secondary"; dark?: boolean; ink?: boolean; size?: "md" | "lg"; className?: string }) {
  if (!cta) return null;
  const cls = cn("pill", kind === "primary" ? "pill-solid" : "pill-line", className);
  const label = <>{cta.label}{kind === "primary" && <> <span className="arrow" aria-hidden="true">→</span></>}</>;
  if (cta.href.startsWith("/")) return <Link href={cta.href} className={cls}>{label}</Link>;
  const external = /^https?:/i.test(cta.href);
  return (
    <a href={cta.href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {label}{external && <span className="sr-only"> (si apre in una nuova scheda)</span>}
    </a>
  );
}

/** Heading with the right level for the position of the block on the page. */
export function BlockHeading({ level, className, children, id }: { level: HeadingLevel; className?: string; children: ReactNode; id?: string }) {
  const Tag = level === 1 ? "h1" : "h2";
  return <Tag id={id} className={className}>{children}</Tag>;
}

/** Small label above a title (kit.css .t-label): only when it adds information. */
export function OptionalEyebrow({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return <p className={cn("t-label mb-4", className)}>{text}</p>;
}

/** Title sizes: the kit.css scale (Anybody 700, width 100%). */
export const TITLE = { hero: "t-giant", scene: "t-scene", section: "t-scene", panel: "t-head" } as const;

/** Rounded photo frame used across the site. */
export const PHOTO = "w-full rounded-[1.75rem]";
