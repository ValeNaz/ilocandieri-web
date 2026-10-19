import { Container } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { BlockHeading, CtaLink, Foto, OptionalEyebrow, PAGE_FOTO, PHOTO, Paragraphs, TITLE, pickImage, type FotoKey, type HeadingLevel } from "./shared";

/**
 * Hero: text on one side, a real photo on the other. The Home hero ("large") is bigger and sits on white;
 * inner pages sit on sand with a smaller title.
 */
export function HeroBlock({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  const large = data.size === "large";
  const fallback: FotoKey = large ? "ceci" : (PAGE_FOTO[pageKey ?? ""] ?? "cassette");
  return (
    <section id={data.slot} className={large ? "bg-paper" : "bg-paper-deep"}>
      <Container className={cn("grid items-center gap-10 lg:grid-cols-12 lg:gap-16", large ? "py-12 sm:py-20 lg:py-24" : "py-12 sm:py-16 lg:py-20")}>
        <div className="lg:col-span-6">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn("reveal", large ? TITLE.hero : TITLE.scene)}>{data.title}</BlockHeading>
          <div className="reveal mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-ink-soft [animation-delay:100ms]">
            <Paragraphs text={data.text} />
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:180ms]">
              <CtaLink cta={data.primaryCta} size="lg" />
              <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
            </div>
          )}
        </div>
        <div className="lg:col-span-6">
          <Foto image={pickImage(images, data.imageId)} fallback={fallback} priority className={cn(PHOTO, large ? "aspect-[4/3] lg:aspect-[5/4]" : "aspect-[16/10]")} />
        </div>
      </Container>
    </section>
  );
}
