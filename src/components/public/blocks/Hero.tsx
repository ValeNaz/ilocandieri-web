import { GatherScene } from "@/components/public/art/liste/generic";
import { ListHero } from "@/components/public/liste/ListHero";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { CtaLink, MediaImage, pickImage, type HeadingLevel } from "./shared";

/**
 * GENERIC hero: used only when a page has no dedicated view for its hero (see blocks/slots). It is the opening room of
 * the v3.1 system: one clear title (Kinetic, by word), one paragraph, pills, and a living scene beside the text.
 * The admin's image, when chosen, takes the scene's place in a rounded frame. Large = orange room, standard = yellow.
 */
export function HeroBlock({ data, images, level }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  const own = pickImage(images, data.imageId);
  const tone = data.size === "large" ? "orange" : "yellow";
  const actions = data.primaryCta || data.secondaryCta ? (
    <>
      <CtaLink cta={data.primaryCta} />
      <CtaLink cta={data.secondaryCta} kind="secondary" />
    </>
  ) : undefined;
  const scene = own ? (
    <div className="absolute inset-x-5 bottom-6 top-4 overflow-hidden rounded-[2rem] border-2 border-[var(--c-ink)] sm:inset-x-10 lg:inset-x-0">
      <MediaImage image={{ ...own, alt: "" }} priority className="size-full" />
    </div>
  ) : (
    <GatherScene room={tone} />
  );
  return <ListHero id={data.slot} tone={tone} eyebrow={data.eyebrow || undefined} title={data.title} text={data.text} actions={actions} scene={scene} level={level} />;
}
