import { Container } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { BlockHeading, CtaLink, MediaImage, OptionalEyebrow, Paragraphs, pickImage, type HeadingLevel, type PatternVariant } from "./shared";

export function HeroBlock({ data, images, level, variant = "agrumi" }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; variant?: PatternVariant }) {
  const image = pickImage(images, data.imageId);
  const large = data.size === "large";

  if (large) {
    return (
      <section id={data.slot} className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-paper-deep" />
        <Container className="relative grid items-center gap-12 pb-16 pt-10 sm:pb-24 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20">
          <div className="lg:col-span-7">
            <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
            <BlockHeading level={level} className="reveal text-[clamp(2.4rem,6.4vw,4.9rem)] font-medium leading-[1.03]">{data.title}</BlockHeading>
            <div className="reveal mt-7 max-w-xl space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:120ms]">
              <Paragraphs text={data.text} />
            </div>
            <div className="reveal mt-9 flex flex-wrap gap-3 [animation-delay:220ms]">
              <CtaLink cta={data.primaryCta} size="lg" />
              <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
            </div>
          </div>
          <div className="reveal relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none [animation-delay:160ms]">
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 size-28 rounded-full border-2 border-arancio sm:size-36" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[999px_999px_2rem_2rem] shadow-pop">
              <MediaImage image={image} fallback={variant} priority className="absolute inset-0 size-full" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id={data.slot} className="relative overflow-hidden border-b border-line bg-paper-deep/50">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.35fr_1fr] lg:py-24">
        <div>
          <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
          <BlockHeading level={level} className="reveal max-w-3xl text-[clamp(2.1rem,5.2vw,4rem)] font-medium leading-[1.05]">{data.title}</BlockHeading>
          <div className="reveal mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:120ms]">
            <Paragraphs text={data.text} />
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
              <CtaLink cta={data.primaryCta} size="lg" />
              <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
            </div>
          )}
        </div>
        <div className={image ? "reveal relative aspect-[4/3] overflow-hidden rounded-card shadow-card [animation-delay:160ms]" : "reveal relative hidden aspect-[4/3] overflow-hidden rounded-[999px_999px_1.5rem_1.5rem] lg:block [animation-delay:160ms]"}>
          <MediaImage image={image} fallback={variant} priority className="absolute inset-0 size-full" />
        </div>
      </Container>
    </section>
  );
}
