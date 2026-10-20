import { EventsHero, NewsHero } from "@/components/public/liste/PageHeroes";
import { RichTextBlock } from "../RichText";
import type { SlotMap } from "./types";

/**
 * Views of the list and functional pages. The generic hero is replaced by the page's own living scene; the legal texts
 * keep their rich_text renderer with a scene beside the title. Keys: `${pageKey}:${slot}`.
 */
type HeroData = { title: string; text?: string; eyebrow?: string };
const hero = (data: unknown) => data as HeroData;

export const pagesSlots: SlotMap = {
  "eventi:hero": ({ data, level }) => { const h = hero(data); return <EventsHero title={h.title} text={h.text} eyebrow={h.eyebrow} level={level} />; },
  "news:hero": ({ data, level }) => { const h = hero(data); return <NewsHero title={h.title} text={h.text} eyebrow={h.eyebrow} level={level} />; },
  "privacy:testo": ({ data, level }) => <RichTextBlock data={data} level={level} scene="privacy" />,
  "cookie:testo": ({ data, level }) => <RichTextBlock data={data} level={level} scene="cookie" />,
};
