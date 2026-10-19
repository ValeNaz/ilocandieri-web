import { Container } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import type { PosterTone } from "./shared";
import { Stamp } from "../art/primitives";
import { BlockHeading, CtaLink, FIELD, Foto, PAGE_FOTO, OptionalEyebrow, Paragraphs, TITLE, pickImage, toneForPage, type HeadingLevel } from "./shared";

/** Home hero: text on one side, a real ABES photo on the other. */
function SplitHero({ data, images, level }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel }) {
  const image = pickImage(images, data.imageId);
  return (
    <section id={data.slot} className="bg-paper">
      <Container className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24">
        <div className="lg:col-span-7">
          {data.eyebrow && <p className="mb-5"><Stamp className="text-terracotta-deep">{data.eyebrow}</Stamp></p>}
          <BlockHeading level={level} className={cn("reveal", TITLE.scene)}>{data.title}</BlockHeading>
          <div className="reveal mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:120ms] sm:text-xl">
            <Paragraphs text={data.text} />
          </div>
          <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:220ms]">
            <CtaLink cta={data.primaryCta} size="lg" />
            <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <Foto image={image} fallback="ceci" priority className="aspect-[4/3] w-full rounded-[1.5rem] border-[3px] border-ink shadow-[0.6rem_0.6rem_0_0_var(--color-terracotta)] lg:aspect-[4/5]" />
        </div>
      </Container>
    </section>
  );
}

/** Title block of an inner page: a field of color from the page's identity, huge heading, large ornament drifting at the edge. */
function PosterHero({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  const tone: PosterTone = toneForPage(pageKey, data.title);
  const dark = tone === "limone" || tone === "kraft";
  return (
    <section id={data.slot} className={cn("relative isolate overflow-hidden", FIELD[tone])}>
      <Container className="relative grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn("reveal", TITLE.scene)}>{data.title}</BlockHeading>
          <div className={cn("reveal mt-7 max-w-2xl space-y-4 text-lg leading-relaxed sm:text-xl [animation-delay:120ms]", dark ? "text-ink" : "text-paper")}>
            <Paragraphs text={data.text} />
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div className="reveal mt-9 flex flex-wrap gap-3 [animation-delay:220ms]">
              <CtaLink cta={data.primaryCta} size="lg" dark={!dark} />
              <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" dark={!dark} />
            </div>
          )}
        </div>
        <div className="lg:col-span-5">
          <Foto image={pickImage(images, data.imageId)} fallback={PAGE_FOTO[pageKey ?? ""] ?? "cassette"} priority className="aspect-[4/3] w-full rounded-[1.5rem] border-[3px] border-ink shadow-[0.6rem_0.6rem_0_0_var(--color-ink)]" />
        </div>
      </Container>
    </section>
  );
}

export function HeroBlock({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  return data.size === "large" ? <SplitHero data={data} images={images} level={level} /> : <PosterHero data={data} images={images} level={level} pageKey={pageKey} />;
}
