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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-paper/70 px-6 text-[0.95rem] font-medium leading-none whitespace-nowrap text-paper transition-colors duration-200 hover:bg-paper hover:text-ink";

/** A validated CTA rendered as a button. `dark` = on ink/olive backgrounds. */
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

export function OptionalEyebrow({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn("mb-4 inline-flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-[0.18em]", className)}>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      {text}
    </p>
  );
}
