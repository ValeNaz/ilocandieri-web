import type { BlockDataOf } from "@/lib/content/blocks";
import { getHomeEvents } from "@/lib/events/public";
import { getHomeNews } from "@/lib/news/public";
import { AbesBlock } from "../Dynamic";
import { EventsNews } from "../dynamic/EventsNews";
import type { SlotProps, SlotMap } from "./types";

type D<T extends (a: never) => unknown> = Parameters<T>[0]["data"];
const Abes = ({ data, level }: SlotProps) => <AbesBlock data={data as D<typeof AbesBlock>} level={level} home />;

/** Home: the events block renders events AND the news block beside it (one section, two columns, max 3 + 3). */
async function Eventi({ data, level, siblings = [] }: SlotProps) {
  const ev = data as BlockDataOf<"events_highlight">;
  const nwBlock = siblings.find((b) => b.type === "news_highlight");
  const nw = nwBlock?.data as BlockDataOf<"news_highlight"> | undefined;
  const [events, news] = await Promise.all([getHomeEvents(Math.min(ev.limit, 3)), nw ? getHomeNews(Math.min(nw.limit, 3)) : Promise.resolve([])]);
  return (
    <EventsNews id={ev.slot} level={level}
      events={{ items: events, eyebrow: ev.eyebrow, title: ev.title, cta: ev.cta, emptyMessage: ev.emptyMessage }}
      news={nw ? { items: news, eyebrow: nw.eyebrow, title: nw.title, cta: nw.cta, emptyMessage: nw.emptyMessage } : { items: [], title: "" }} />
  );
}

/** Rendered inside the events section when there is one; alone otherwise. */
async function News({ data, level, siblings = [] }: SlotProps) {
  if (siblings.some((b) => b.type === "events_highlight")) return null;
  const nw = data as BlockDataOf<"news_highlight">;
  const news = await getHomeNews(Math.min(nw.limit, 3));
  return <EventsNews id={nw.slot} level={level} events={{ items: [], title: "" }} news={{ items: news, eyebrow: nw.eyebrow, title: nw.title, cta: nw.cta, emptyMessage: nw.emptyMessage }} />;
}

export const homecSlots: SlotMap = { "home:abes": Abes, "home:eventi": Eventi as never, "home:news": News as never };
