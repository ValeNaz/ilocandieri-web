import { Fragment } from "react";
import Image from "next/image";
import { Container } from "@/components/ui";
import { LogoMark } from "@/components/brand/Logo";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { AmbientVideo } from "../media/AmbientVideo";
import { PHOTOS, VIDEOS, type PhotoKey, type VideoKey } from "../media/stock";
import { BlockHeading, CtaLink, MediaImage, OptionalEyebrow, Paragraphs, pickImage, type HeadingLevel } from "./shared";

/** The title split into words so they can enter one after the other (journey.css .hero-word). */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((w, i) => (
        <Fragment key={i}>
          <span className="hero-word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export type Backdrop = { photo: PhotoKey } | { video: VideoKey };

/** Full-bleed media: the admin's image if chosen, else temporary stock (photo or ambient video). Decorative. */
export function Backdrop({ own, backdrop, priority, className = "absolute inset-0 size-full" }: { own?: ResolvedImage | null; backdrop: Backdrop; priority?: boolean; className?: string }) {
  if (own) return <MediaImage image={{ ...own, alt: "" }} priority={priority} className={className} />;
  if ("video" in backdrop) return <AmbientVideo video={VIDEOS[backdrop.video]} priority={priority} className={className} />;
  const p = PHOTOS[backdrop.photo];
  return <Image src={p.src} alt="" fill priority={priority} sizes="100vw" className={cn("object-cover", className !== "absolute inset-0 size-full" && className)} />;
}

/** Veil that keeps paper text legible on any photo or video (darker at the bottom and on the left, where the text sits). */
export function Veil() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />
    </>
  );
}

/**
 * Home opening: the Belice valley, Castelvetrano's land, under a slow camera move, the logo builds itself (two people raise a roof
 * around a third), the title enters word by word. Leaving it, the scene folds into a rounded window.
 */
function OpeningHero({ data, images, level }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="hero-shrink on-dark relative isolate -mt-[var(--header-h)] overflow-hidden bg-night text-paper">
      <Backdrop own={pickImage(images, data.imageId)} backdrop={{ photo: "belice" }} priority className="kenburns absolute inset-0 size-full" />
      <Veil />
      <Container className="relative flex min-h-[100svh] flex-col justify-end pb-14 pt-[calc(var(--header-h)+4rem)] sm:pb-20">
        <LogoMark build className="absolute right-8 top-[calc(var(--header-h)+3rem)] hidden h-40 w-auto md:block lg:h-52" />
        <OptionalEyebrow text={data.eyebrow} />
        <BlockHeading level={level} className="max-w-[16ch] text-[clamp(2.7rem,7vw,6.8rem)] leading-[0.98] tracking-[-0.032em]">
          <Words text={data.title} />
        </BlockHeading>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="reveal max-w-xl space-y-4 text-lg leading-relaxed text-paper/90 [animation-delay:600ms] sm:text-xl lg:col-span-6">
            <Paragraphs text={data.text} />
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div className="reveal flex flex-wrap gap-3 [animation-delay:750ms] lg:col-span-6 lg:justify-end">
              <CtaLink cta={data.primaryCta} size="lg" />
              <CtaLink cta={data.secondaryCta} kind="secondary" dark size="lg" />
            </div>
          )}
        </div>
        <div aria-hidden="true" className="mt-12 flex items-center gap-3 text-sm text-paper/75">
          <span className="relative block h-10 w-px overflow-hidden bg-paper/25"><span className="cue-line absolute inset-0 bg-citrus" /></span>
          Scorri la storia
        </div>
      </Container>
    </section>
  );
}

/** Inner pages: the scene that belongs to each page (temporary stock until real photos arrive). */
const PAGE_BACKDROP: Record<string, Backdrop> = {
  "chi-siamo": { video: "germoglio" },
  shop: { video: "granoSacco" },
  eventi: { photo: "corso" },
  news: { photo: "campagna" },
  "lavora-con-noi": { video: "semina" },
  contatti: { video: "olive" },
};

function PageHero({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  const own = pickImage(images, data.imageId);
  const backdrop = PAGE_BACKDROP[pageKey ?? ""];
  if (!own && !backdrop) {
    return (
      <section id={data.slot} className="bg-paper-deep">
        <Container className="py-14 sm:py-20 lg:py-24">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className="reveal max-w-[18ch] text-[clamp(2.4rem,5.8vw,5.4rem)] leading-[1] tracking-[-0.032em]">{data.title}</BlockHeading>
          <div className="reveal mt-8 max-w-xl space-y-4 text-lg leading-relaxed text-ink-soft sm:text-xl"><Paragraphs text={data.text} /></div>
        </Container>
      </section>
    );
  }
  return (
    <section id={data.slot} className="hero-shrink on-dark relative isolate -mt-[var(--header-h)] overflow-hidden bg-night text-paper">
      <Backdrop own={own} backdrop={backdrop ?? { photo: "belice" }} priority />
      <Veil />
      <Container className="relative flex min-h-[78svh] flex-col justify-end pb-14 pt-[calc(var(--header-h)+4rem)] sm:pb-20">
        <OptionalEyebrow text={data.eyebrow} />
        <BlockHeading level={level} className="max-w-[18ch] text-[clamp(2.5rem,6vw,5.6rem)] leading-[1] tracking-[-0.032em]">
          <Words text={data.title} />
        </BlockHeading>
        <div className="reveal mt-7 max-w-2xl space-y-4 text-lg leading-relaxed text-paper/90 [animation-delay:450ms] sm:text-xl">
          <Paragraphs text={data.text} />
        </div>
        {(data.primaryCta || data.secondaryCta) && (
          <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:600ms]">
            <CtaLink cta={data.primaryCta} size="lg" />
            <CtaLink cta={data.secondaryCta} kind="secondary" dark size="lg" />
          </div>
        )}
      </Container>
    </section>
  );
}

export function HeroBlock({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  return data.size === "large" ? <OpeningHero data={data} images={images} level={level} /> : <PageHero data={data} images={images} level={level} pageKey={pageKey} />;
}
