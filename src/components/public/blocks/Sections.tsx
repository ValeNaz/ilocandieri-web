import { Card, Container, Section } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { BlockHeading, CtaLink, MediaImage, OptionalEyebrow, Paragraphs, pickImage, type HeadingLevel, type PatternVariant } from "./shared";

const H = "font-medium text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.08]";

/** Intro (home identity). Two columns: visual + text. */
export function IntroBlock({ data, images, level, variant = "maiolica" }: { data: BlockDataOf<"intro">; images: ImageMap; level: HeadingLevel; variant?: PatternVariant }) {
  const image = pickImage(images, data.imageId);
  return (
    <Section id={data.slot} tone={data.tone === "sage" ? "sage" : "paper"}>
      <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="relative lg:col-span-5">
          <MediaImage image={image} fallback={variant} className="aspect-[16/9] w-full rounded-card shadow-card sm:aspect-[5/4] lg:aspect-[4/5]" />
        </div>
        <div className="lg:col-span-7">
          <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
          <BlockHeading level={level} className={cn(H, "max-w-2xl")}>{data.title}</BlockHeading>
          <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft">
            <Paragraphs text={data.text} />
          </div>
          {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
        </div>
      </Container>
    </Section>
  );
}

/** Text + image section with optional cards (Chi siamo). */
export function FeatureBlock({ data, images, level, variant = "agrumi" }: { data: BlockDataOf<"feature">; images: ImageMap; level: HeadingLevel; variant?: PatternVariant }) {
  const image = pickImage(images, data.imageId);
  const left = data.imageSide === "left";
  return (
    <Section id={data.slot} tone={data.tone === "deep" ? "deep" : "paper"}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className={cn("lg:col-span-7", left && "lg:order-2")}>
            <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
            <BlockHeading level={level} className={cn(H, "max-w-2xl")}>{data.title}</BlockHeading>
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft">
              <Paragraphs text={data.text} />
            </div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
          </div>
          <div className={cn("lg:col-span-5", left && "lg:order-1")}>
            <MediaImage image={image} fallback={variant} className="aspect-[4/3] w-full rounded-card shadow-card lg:aspect-square" />
          </div>
        </div>
        {data.items.length > 0 && (
          <ul className={cn("mt-10 grid gap-6 sm:mt-14", data.items.length > 1 && "md:grid-cols-2")}>
            {data.items.map((it, i) => {
              const img = pickImage(images, it.imageId);
              return (
                <li key={i}>
                  <Card className="grid h-full overflow-hidden sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                    <MediaImage image={img} fallback={i % 2 === 0 ? "agrumi" : "maiolica"} className="aspect-[16/10] w-full sm:aspect-auto sm:min-h-full md:aspect-[16/10] lg:aspect-auto" />
                    <div className="p-7">
                      <h3 className="font-display text-2xl font-medium">{it.title}</h3>
                      <p className="mt-3 text-ink-soft">{it.text}</p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}

const ACCENTS = ["border-terracotta", "border-arancio", "border-olive", "border-sage"];

/** "Cosa facciamo": numbered cards. */
export function PillarsBlock({ data, level }: { data: BlockDataOf<"pillars">; level: HeadingLevel }) {
  return (
    <Section id={data.slot}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
            <BlockHeading level={level} className={H}>{data.title}</BlockHeading>
          </div>
          {data.intro && <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">{data.intro}</p>}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
          {data.items.map((it, i) => (
            <li key={i}>
              <Card className={cn("h-full border-t-4 p-4 sm:p-7", ACCENTS[i % ACCENTS.length])}>
                <p aria-hidden="true" className="font-display text-sm font-semibold tracking-widest text-terracotta-deep">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-[1.15rem] font-medium leading-tight sm:mt-3 sm:text-2xl">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:mt-3 sm:text-base">{it.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Values: large editorial list. */
export function ValuesBlock({ data, level }: { data: BlockDataOf<"values">; level: HeadingLevel }) {
  return (
    <Section id={data.slot} tone="sage">
      <Container>
        <OptionalEyebrow text={data.eyebrow} className="text-olive-deep" />
        <BlockHeading level={level} className={cn(H, "max-w-3xl")}>{data.title}</BlockHeading>
        <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {data.items.map((it, i) => (
            <li key={i} className="flex gap-5 border-t border-olive/30 pt-6">
              <span aria-hidden="true" className="mt-1.5 size-4 shrink-0 rounded-full bg-arancio ring-4 ring-arancio/25" />
              <div>
                <h3 className="font-display text-2xl font-medium">{it.title}</h3>
                <p className="mt-2 text-ink">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Places: dark olive section with image cards. */
export function PlacesBlock({ data, images, level }: { data: BlockDataOf<"places">; images: ImageMap; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="bg-olive-deep py-12 text-paper on-dark sm:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <OptionalEyebrow text={data.eyebrow} className="text-sage" />
            <BlockHeading level={level} className={cn(H, "text-paper")}>{data.title}</BlockHeading>
          </div>
          {data.text && <p className="text-lg leading-relaxed text-paper/85 lg:col-span-5">{data.text}</p>}
        </div>
        <ul className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-2">
          {data.items.map((it, i) => (
            <li key={i} className="overflow-hidden rounded-card bg-paper text-ink">
              <MediaImage image={pickImage(images, it.imageId)} fallback={i % 2 === 0 ? "agrumi" : "campi"} className="aspect-[16/10] w-full" />
              <div className="p-7">
                <h3 className="font-display text-2xl font-medium">{it.title}</h3>
                <p className="mt-3 text-ink-soft">{it.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {data.cta && <div className="mt-10"><CtaLink cta={data.cta} dark /></div>}
      </Container>
    </section>
  );
}

/** Closing call to action. */
export function CtaBlock({ data, level }: { data: BlockDataOf<"cta">; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="py-12 sm:py-24">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-7 py-14 text-paper on-dark sm:px-14 sm:py-20">
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-terracotta/80 sm:size-96" />
          <div aria-hidden="true" className="absolute -bottom-16 right-24 -z-10 size-40 rounded-full border-2 border-arancio/70" />
          <BlockHeading level={level} className="max-w-2xl text-[clamp(1.9rem,4.4vw,3.3rem)] font-medium leading-[1.08] text-paper">{data.title}</BlockHeading>
          {data.text && <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85">{data.text}</p>}
          {(data.primaryCta || data.secondaryCta) && (
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink cta={data.primaryCta} dark size="lg" />
              <CtaLink cta={data.secondaryCta} dark kind="secondary" size="lg" />
            </div>
          )}
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
        <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
        <BlockHeading level={level} className={cn(H, "max-w-3xl")}>{data.title}</BlockHeading>
        {data.text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{data.text}</p>}
      </Container>
    </section>
  );
}
