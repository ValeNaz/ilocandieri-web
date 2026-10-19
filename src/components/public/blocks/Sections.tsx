import { Container, Section } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { Plate } from "../art/plates";
import { BlockHeading, CtaLink, Foto, MediaImage, OptionalEyebrow, PHOTO, Paragraphs, TITLE, pickImage, type HeadingLevel } from "./shared";

/** ABES photos only illustrate sections about ABES/farming; elsewhere, without an admin image, the text stands alone. */
const ABOUT_ABES = /abes|agric|prodott|coltiv|terr[ae]\b|econom/i;
const num = (i: number) => String(i + 1).padStart(2, "0");

/** Heading row shared by the list sections: title on the left, optional intro on the right. */
function Head({ eyebrow, title, text, level }: { eyebrow: string; title: string; text?: string; level: HeadingLevel }) {
  return (
    <div className="rise grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-16">
      <div className="lg:col-span-7">
        <OptionalEyebrow text={eyebrow} />
        <BlockHeading level={level} className={TITLE.scene}>{title}</BlockHeading>
      </div>
      {text && <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">{text}</p>}
    </div>
  );
}

/** Numbered list (activities, values): number, title, text, separated by thin rules. */
function NumberedList({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="mt-12 grid gap-x-12 gap-y-10 sm:mt-16 md:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="rise border-t border-line pt-6">
          <p aria-hidden="true" className="text-sm font-semibold tabular-nums text-terracotta-deep">{num(i)}</p>
          <h3 className={cn("mt-3", TITLE.panel)}>{it.title}</h3>
          <p className="mt-3 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">{it.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Identity statement (home), on sand, next to a real photo. */
export function IntroBlock({ data, images, level }: { data: BlockDataOf<"intro">; images: ImageMap; level: HeadingLevel }) {
  return (
    <Section id={data.slot} tone="deep">
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Foto image={pickImage(images, data.imageId)} fallback="cassette" className={cn(PHOTO, "aspect-[4/3] lg:aspect-[4/5]")} />
        </div>
        <div className="rise lg:col-span-7">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={TITLE.scene}>{data.title}</BlockHeading>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft">
            <Paragraphs text={data.text} />
          </div>
          {data.cta && <div className="mt-8"><CtaLink cta={data.cta} kind="secondary" /></div>}
        </div>
      </Container>
    </Section>
  );
}

/** Text + photo section with optional "schede" (Chi siamo, Shop). */
export function FeatureBlock({ data, images, level }: { data: BlockDataOf<"feature">; images: ImageMap; level: HeadingLevel; index?: number }) {
  const left = data.imageSide === "left";
  const image = pickImage(images, data.imageId);
  const visual = image || ABOUT_ABES.test(`${data.slot ?? ""} ${data.title}`);
  return (
    <Section id={data.slot} tone={data.tone === "deep" ? "deep" : "paper"}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className={cn("rise", visual ? "lg:col-span-7" : "lg:col-span-9", visual && left && "lg:order-2")}>
            <OptionalEyebrow text={data.eyebrow} />
            <BlockHeading level={level} className={cn(TITLE.section, "max-w-3xl")}>{data.title}</BlockHeading>
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft">
              <Paragraphs text={data.text} />
            </div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
          </div>
          {visual && (
            <div className={cn("lg:col-span-5", left && "lg:order-1")}>
              <Foto image={image} fallback="pianta" className={cn(PHOTO, "aspect-[4/3] lg:aspect-square")} />
            </div>
          )}
        </div>
        {data.items.length > 0 && (
          <ul className={cn("mt-14 grid gap-x-12 gap-y-10 sm:mt-20", data.items.length > 1 && "md:grid-cols-2")}>
            {data.items.map((it, i) => {
              const img = pickImage(images, it.imageId);
              return (
                <li key={i} className="rise border-t border-line pt-6">
                  {img && <MediaImage image={img} className={cn(PHOTO, "mb-6 aspect-[16/10]")} />}
                  <p aria-hidden="true" className="text-sm font-semibold tabular-nums text-terracotta-deep">{num(i)}</p>
                  <h3 className={cn("mt-3", TITLE.panel)}>{it.title}</h3>
                  <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{it.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}

/** "Cosa facciamo": the activities as a numbered list. */
export function PillarsBlock({ data, level }: { data: BlockDataOf<"pillars">; level: HeadingLevel }) {
  return (
    <Section id={data.slot}>
      <Container>
        <Head eyebrow={data.eyebrow} title={data.title} text={data.intro} level={level} />
        <NumberedList items={data.items} />
      </Container>
    </Section>
  );
}

export function ValuesBlock({ data, level }: { data: BlockDataOf<"values">; level: HeadingLevel }) {
  return (
    <Section id={data.slot} tone="deep">
      <Container>
        <Head eyebrow={data.eyebrow} title={data.title} level={level} />
        <NumberedList items={data.items} />
      </Container>
    </Section>
  );
}

/** Places: one large image per place (an illustration until the admin uploads a real photo). */
export function PlacesBlock({ data, images, level }: { data: BlockDataOf<"places">; images: ImageMap; level: HeadingLevel }) {
  return (
    <Section id={data.slot}>
      <Container>
        <Head eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        <ul className="mt-12 grid gap-12 sm:mt-16 md:grid-cols-2 md:gap-10">
          {data.items.map((it, i) => {
            const img = pickImage(images, it.imageId);
            return (
              <li key={i} className="rise">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-paper-deep">
                  {img ? <MediaImage image={img} className="size-full" /> : <Plate index={i} className="size-full" />}
                </div>
                <h3 className={cn("mt-6", TITLE.panel)}>{it.title}</h3>
                <p className="mt-2 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">{it.text}</p>
              </li>
            );
          })}
        </ul>
        {data.cta && <div className="mt-12"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Container>
    </Section>
  );
}

/** Closing call to action: the one deep-colored band of the page. */
export function CtaBlock({ data, level }: { data: BlockDataOf<"cta">; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="px-3 py-3 sm:px-5 sm:py-5">
      <div className="on-dark mx-auto max-w-[88rem] rounded-[1.75rem] bg-olive-deep text-paper">
        <Container className="py-16 sm:py-24">
          <div className="rise max-w-3xl">
            <BlockHeading level={level} className={TITLE.scene}>{data.title}</BlockHeading>
            {data.text && <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">{data.text}</p>}
            {(data.primaryCta || data.secondaryCta) && (
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink cta={data.primaryCta} dark size="lg" />
                <CtaLink cta={data.secondaryCta} dark kind="secondary" size="lg" />
              </div>
            )}
          </div>
        </Container>
      </div>
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
