import { Fragment } from "react";
import { Container, Section } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { Plate } from "../art/plates";
import { BlockHeading, CtaLink, Foto, MediaImage, OptionalEyebrow, PHOTO, Paragraphs, TITLE, pickImage, type HeadingLevel } from "./shared";

/** ABES photos only illustrate sections about ABES/farming; elsewhere, without an admin image, the text stands alone. */
const ABOUT_ABES = /abes|agric|prodott|coltiv|terr[ae]\b|econom/i;
const num = (i: number) => String(i + 1).padStart(2, "0");

/** A sentence whose words light up one after the other as it scrolls past (journey.css .lit-word). */
function LitText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((w, i) => (
        <Fragment key={i}>
          <span className="lit-word">{w}</span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/** Heading row shared by the list sections: title on the left, optional intro on the right. */
function Head({ eyebrow, title, text, level, dark }: { eyebrow: string; title: string; text?: string; level: HeadingLevel; dark?: boolean }) {
  return (
    <div className="rise grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-7">
        <OptionalEyebrow text={eyebrow} />
        <BlockHeading level={level} className={TITLE.scene}>{title}</BlockHeading>
      </div>
      {text && <p className={cn("text-lg leading-relaxed lg:col-span-4 lg:col-start-9", dark ? "text-night-soft" : "text-ink-soft")}>{text}</p>}
    </div>
  );
}

/** Identity manifesto (home): the statement lights up word by word, then the story sits beside a real photo. */
export function IntroBlock({ data, images, level }: { data: BlockDataOf<"intro">; images: ImageMap; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="bg-paper py-20 sm:py-32">
      <Container>
        <OptionalEyebrow text={data.eyebrow} />
        <BlockHeading level={level} className="max-w-[22ch] text-[clamp(2.1rem,5vw,4.6rem)] leading-[1.02] tracking-[-0.032em]">
          <LitText text={data.title} />
        </BlockHeading>
        <div className="mt-14 grid items-end gap-10 sm:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Foto image={pickImage(images, data.imageId)} fallback="cassette" className={cn(PHOTO, "aspect-[4/3] lg:aspect-[4/5]")} />
          </div>
          <div className="rise lg:col-span-5 lg:col-start-8">
            <div className="space-y-4 text-lg leading-relaxed text-ink-soft"><Paragraphs text={data.text} /></div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} kind="secondary" /></div>}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItems({ items, images }: { items: BlockDataOf<"feature">["items"]; images: ImageMap }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("mt-12 grid gap-x-12 gap-y-10 sm:mt-16", items.length > 1 && "md:grid-cols-2")}>
      {items.map((it, i) => {
        const img = pickImage(images, it.imageId);
        return (
          <li key={i} className="rise border-t border-ink/15 pt-6">
            {img && <MediaImage image={img} className="mb-6 aspect-[16/10] w-full rounded-[1.5rem]" />}
            <p aria-hidden="true" className="text-sm font-semibold tabular-nums text-terracotta-deep">{num(i)}</p>
            <h3 className={cn("mt-3", TITLE.panel)}>{it.title}</h3>
            <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{it.text}</p>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Text section (Chi siamo, Shop). With a photo: text and photo side by side. Without one (sections not about ABES):
 * a reading layout, the title held on the left while the text runs on the right.
 */
export function FeatureBlock({ data, images, level }: { data: BlockDataOf<"feature">; images: ImageMap; level: HeadingLevel; index?: number }) {
  const left = data.imageSide === "left";
  const image = pickImage(images, data.imageId);
  const visual = image || ABOUT_ABES.test(`${data.slot ?? ""} ${data.title}`);
  const tone = data.tone === "deep" ? "deep" : "paper";
  if (!visual) {
    return (
      <Section id={data.slot} tone={tone}>
        <Container className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <OptionalEyebrow text={data.eyebrow} />
              <BlockHeading level={level} className={cn(TITLE.section, "max-w-[16ch]")}>{data.title}</BlockHeading>
            </div>
          </div>
          <div className="rise lg:col-span-6 lg:col-start-7">
            <div className="space-y-5 text-lg leading-relaxed text-ink-soft sm:text-xl sm:leading-relaxed"><Paragraphs text={data.text} /></div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
            <FeatureItems items={data.items} images={images} />
          </div>
        </Container>
      </Section>
    );
  }
  return (
    <Section id={data.slot} tone={tone}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className={cn("rise lg:col-span-6", left && "lg:order-2 lg:col-start-7")}>
            <OptionalEyebrow text={data.eyebrow} />
            <BlockHeading level={level} className={cn(TITLE.section, "max-w-[20ch]")}>{data.title}</BlockHeading>
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft"><Paragraphs text={data.text} /></div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
          </div>
          <div className={cn("lg:col-span-5", left ? "lg:order-1" : "lg:col-start-8")}>
            <Foto image={image} fallback="pianta" className={cn(PHOTO, "aspect-[4/3] lg:aspect-[4/5]")} />
          </div>
        </div>
        <FeatureItems items={data.items} images={images} />
      </Container>
    </Section>
  );
}

/** The immersive dark field: each item is a full-width row with a very large title (activities, values). */
function NightRows({ id, eyebrow, title, intro, items, level }: { id?: string; eyebrow: string; title: string; intro?: string; items: { title: string; text: string }[]; level: HeadingLevel }) {
  return (
    <section id={id} className="on-dark bg-night py-20 text-paper sm:py-32">
      <Container>
        <Head eyebrow={eyebrow} title={title} text={intro} level={level} dark />
        <ol className="mt-14 border-b border-paper/15 sm:mt-20">
          {items.map((it, i) => (
            <li key={i} className="rise group grid gap-3 border-t border-paper/15 py-8 sm:py-10 lg:grid-cols-12 lg:items-baseline lg:gap-12">
              <p aria-hidden="true" className="text-sm font-semibold tabular-nums text-citrus lg:col-span-1">{num(i)}</p>
              <h3 className="text-[clamp(1.9rem,4.4vw,3.6rem)] leading-[1.02] tracking-[-0.03em] transition-colors duration-300 group-hover:text-citrus lg:col-span-6">{it.title}</h3>
              <p className="max-w-md text-lg leading-relaxed text-night-soft lg:col-span-4 lg:col-start-9">{it.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** "Cosa facciamo" (home). */
export function PillarsBlock({ data, level }: { data: BlockDataOf<"pillars">; level: HeadingLevel }) {
  return <NightRows id={data.slot} eyebrow={data.eyebrow} title={data.title} intro={data.intro} items={data.items} level={level} />;
}

/** Values (Chi siamo): the page's one night section. */
export function ValuesBlock({ data, level }: { data: BlockDataOf<"values">; level: HeadingLevel }) {
  return <NightRows id={data.slot} eyebrow={data.eyebrow} title={data.title} items={data.items} level={level} />;
}

/** Places: large images that open up as they enter, offset against each other. */
export function PlacesBlock({ data, images, level }: { data: BlockDataOf<"places">; images: ImageMap; level: HeadingLevel }) {
  return (
    <Section id={data.slot} className="py-20 sm:py-32">
      <Container>
        <Head eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        <ul className="mt-14 grid gap-14 sm:mt-20 md:grid-cols-12 md:gap-10">
          {data.items.map((it, i) => {
            const img = pickImage(images, it.imageId);
            return (
              <li key={i} className={cn("md:col-span-6", i % 2 === 1 && "md:mt-24")}>
                <div className="unveil aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-paper-deep sm:aspect-[5/4] md:aspect-[4/5]">
                  {img ? <MediaImage image={img} className="size-full" /> : <Plate index={i} className="size-full" />}
                </div>
                <h3 className={cn("mt-6", TITLE.panel)}>{it.title}</h3>
                <p className="mt-2 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">{it.text}</p>
              </li>
            );
          })}
        </ul>
        {data.cta && <div className="mt-14"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Container>
    </Section>
  );
}

/** Closing call to action: a full citrus band with a very large line. */
export function CtaBlock({ data, level }: { data: BlockDataOf<"cta">; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="bg-citrus text-ink">
      <Container className="py-20 sm:py-32">
        <div className="rise grid gap-10 lg:grid-cols-12 lg:items-end">
          <BlockHeading level={level} className="max-w-[16ch] text-[clamp(2.4rem,6vw,5.6rem)] leading-[0.98] tracking-[-0.036em] lg:col-span-8">{data.title}</BlockHeading>
          <div className="lg:col-span-4">
            {data.text && <p className="text-lg leading-relaxed">{data.text}</p>}
            {(data.primaryCta || data.secondaryCta) && (
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink cta={data.primaryCta} size="lg" ink />
                <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" ink />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Compact heading for list pages (events/news/careers sections). */
export function SectionHeadingBlock({ data, level }: { data: BlockDataOf<"section_heading">; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="pb-2 pt-14 sm:pt-20">
      <Container>
        <div className="rise">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn(TITLE.section, "max-w-3xl")}>{data.title}</BlockHeading>
          {data.text && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{data.text}</p>}
        </div>
      </Container>
    </section>
  );
}
