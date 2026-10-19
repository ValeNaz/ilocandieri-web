import { Fragment } from "react";
import { Container } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { BlockHeading, CtaLink, FOTO, Foto, OptionalEyebrow, PAGE_FOTO, PHOTO, Paragraphs, TITLE, pickImage, type FotoKey, type HeadingLevel } from "./shared";

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

const STRIP: FotoKey[] = ["cassette", "ceci", "vasetti", "pianta", "banco"];

/** Home opening: a very large title, the text and actions offset to the right, then a slow strip of real ABES photos. */
function OpeningHero({ data, images, level }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel }) {
  const own = pickImage(images, data.imageId);
  const strip = (decorative: boolean) =>
    STRIP.map((k, i) => {
      const f = FOTO[k];
      return (
        <li key={`${k}-${decorative}`} aria-hidden={decorative || undefined} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- static files in /public/foto */}
          <img src={f.src} alt={decorative ? "" : f.alt} width={f.w} height={f.h} loading={i < 2 ? "eager" : "lazy"} decoding="async"
            className="h-[clamp(13rem,28vw,23rem)] w-auto rounded-[1.25rem] object-cover" style={{ aspectRatio: f.w > f.h ? "4 / 3" : "4 / 5" }} />
        </li>
      );
    });
  return (
    <section id={data.slot} className="overflow-hidden bg-paper pb-14 sm:pb-20">
      <Container className="pt-10 sm:pt-16 lg:pt-20">
        <OptionalEyebrow text={data.eyebrow} />
        <BlockHeading level={level} className="max-w-[17ch] text-[clamp(2.6rem,6.6vw,6.4rem)] font-[680] leading-[0.98] tracking-[-0.032em]">
          <Words text={data.title} />
        </BlockHeading>
        <div className="mt-8 grid gap-8 sm:mt-12 lg:grid-cols-12">
          <div className="reveal space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:500ms] lg:col-span-5 lg:col-start-7 sm:text-xl">
            <Paragraphs text={data.text} />
            {(data.primaryCta || data.secondaryCta) && (
              <div className="flex flex-wrap gap-3 pt-4">
                <CtaLink cta={data.primaryCta} size="lg" />
                <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
              </div>
            )}
          </div>
        </div>
      </Container>
      <div className="mt-12 sm:mt-16">
        {own ? (
          <Container><Foto image={own} fallback="ceci" priority className={cn(PHOTO, "aspect-[21/9]")} /></Container>
        ) : (
          <div className="film" role="region" tabIndex={0} aria-label="Foto dei prodotti ABES">
            <ul className="film-track px-5 sm:px-8">
              {strip(false)}
              {strip(true)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Title block of an inner page, on sand. Pages about the cooperative or ABES (Chi siamo, Shop) carry a real photo;
 * the others (events, news, careers, contacts) are typographic, so no unrelated product shot stands in for them.
 */
function PageHero({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  const image = pickImage(images, data.imageId);
  const fallback = PAGE_FOTO[pageKey ?? ""];
  const body = (
    <>
      <div className="reveal space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:100ms] sm:text-xl">
        <Paragraphs text={data.text} />
      </div>
      {(data.primaryCta || data.secondaryCta) && (
        <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:180ms]">
          <CtaLink cta={data.primaryCta} size="lg" />
          <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
        </div>
      )}
    </>
  );
  if (!image && !fallback) {
    return (
      <section id={data.slot} className="bg-paper-deep">
        <Container className="py-14 sm:py-20 lg:py-24">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className="reveal max-w-[18ch] text-[clamp(2.4rem,5.8vw,5.4rem)] leading-[1] tracking-[-0.032em]">{data.title}</BlockHeading>
          <div className="mt-8 grid lg:grid-cols-12"><div className="lg:col-span-6 lg:col-start-7">{body}</div></div>
        </Container>
      </section>
    );
  }
  return (
    <section id={data.slot} className="bg-paper-deep">
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="lg:col-span-7">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn("reveal", TITLE.hero)}>{data.title}</BlockHeading>
          <div className="mt-6 max-w-xl">{body}</div>
        </div>
        <div className="lg:col-span-5">
          <Foto image={image} fallback={fallback ?? "cassette"} priority className={cn(PHOTO, "aspect-[4/3] lg:aspect-[5/4]")} />
        </div>
      </Container>
    </section>
  );
}

export function HeroBlock({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  return data.size === "large" ? <OpeningHero data={data} images={images} level={level} /> : <PageHero data={data} images={images} level={level} pageKey={pageKey} />;
}
