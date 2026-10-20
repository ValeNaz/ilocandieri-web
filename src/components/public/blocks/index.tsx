import type { ReactNode } from "react";
import type { ParsedBlock } from "@/lib/content/blocks";
import type { ImageMap, PageContent } from "@/lib/content/queries";
import { ContactBlock } from "./Contact";
import { AbesBlock, EventsBlock, NewsBlock } from "./Dynamic";
import { HeroBlock } from "./Hero";
import { RichTextBlock } from "./RichText";
import { CtaBlock, FeatureBlock, SectionHeadingBlock, IntroBlock, PillarsBlock, PlacesBlock, ValuesBlock } from "./Sections";
import type { HeadingLevel } from "./shared";
import { SLOT_VIEWS } from "./slots";

/**
 * Render ONE block. `level` is the heading level of the block's main title (1 for the first block of a page, else 2).
 * `message` blocks are system microcopy and never render as sections.
 */
export function BlockView({ block, images, level = 2, pageKey, index = 0 }: { block: ParsedBlock; images: ImageMap; level?: HeadingLevel; pageKey?: string; index?: number }): ReactNode {
  const Custom = pageKey && block.data.slot ? SLOT_VIEWS[`${pageKey}:${block.data.slot}`] : undefined;
  if (Custom) return <Custom data={block.data as never} images={images} level={level} block={block} />;
  switch (block.type) {
    case "hero": return <HeroBlock data={block.data} images={images} level={level} pageKey={pageKey} />;
    case "intro": return <IntroBlock data={block.data} images={images} level={level} />;
    case "feature": return <FeatureBlock data={block.data} images={images} level={level} index={index} />;
    case "pillars": return <PillarsBlock data={block.data} level={level} />;
    case "values": return <ValuesBlock data={block.data} level={level} />;
    case "places": return <PlacesBlock data={block.data} images={images} level={level} />;
    case "abes_showcase": return <AbesBlock data={block.data} level={level} />;
    case "events_highlight": return <EventsBlock data={block.data} level={level} />;
    case "news_highlight": return <NewsBlock data={block.data} level={level} />;
    case "section_heading": return <SectionHeadingBlock data={block.data} level={level} />;
    case "cta": return <CtaBlock data={block.data} level={level} />;
    case "rich_text": return <RichTextBlock data={block.data} level={level} />;
    case "contact": return <ContactBlock data={block.data} level={level} />;
    case "message": return null;
  }
}

/**
 * Render all visible blocks of a page. The first renderable block gets the <h1>.
 * `only` / `except` filter by slot (so a module can render the hero itself and the rest elsewhere).
 */
export function PageBlocks({ content, only, except, firstIsH1 = true }: { content: Pick<PageContent, "blocks" | "images" | "page">; only?: string[]; except?: string[]; firstIsH1?: boolean }) {
  const blocks = content.blocks.filter((b) => b.type !== "message" && (!only || (b.data.slot && only.includes(b.data.slot))) && (!except || !(b.data.slot && except.includes(b.data.slot))));
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={b.id} block={b} images={content.images} level={firstIsH1 && i === 0 ? 1 : 2} pageKey={content.page?.key} index={i} />
      ))}
    </>
  );
}
