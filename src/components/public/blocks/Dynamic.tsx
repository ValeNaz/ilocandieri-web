import { AbesShowcase } from "@/components/public/abes/AbesShowcase";
import { PillLink } from "@/components/public/abes/PillLink";
import { Room, Wrap } from "@/components/public/kit/Room";
import { getHomeProducts, getShopProducts } from "@/lib/abes/public";
import type { BlockDataOf } from "@/lib/content/blocks";
import { getHomeEvents } from "@/lib/events/public";
import { getHomeNews } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { EventTickets } from "./dynamic/EventTickets";
import { NewsMosaic } from "./dynamic/NewsMosaic";
import type { HeadingLevel } from "./shared";

/** ABES showcase. Without products: pointer to the catalogue (never fake cards). `home` adds the link to /abes. */
export async function AbesBlock({ data, level, home }: { data: BlockDataOf<"abes_showcase">; level: HeadingLevel; home?: boolean }) {
  const products = (await (data.source === "shop" ? getShopProducts() : getHomeProducts(data.limit))).slice(0, data.source === "shop" ? undefined : data.limit);
  const props = home ? { ctaHref: paths.shop, moreCta: { label: "Dal seme al barattolo", href: paths.abes } } : {};
  if (products.length === 0 && level === 1) {
    return <Room tone="white" className="py-20"><Wrap><h1 className="t-giant">{data.title}</h1><div className="mt-8"><PillLink href={paths.abesShop}>{data.ctaLabel}</PillLink></div></Wrap></Room>;
  }
  return <AbesShowcase id={data.slot} products={products} eyebrow={data.eyebrow} title={data.title} text={data.text} ctaLabel={data.ctaLabel} cardCtaLabel={data.cardCtaLabel} headingLevel={level === 1 ? 2 : 2} {...props} />;
}

export async function EventsBlock({ data, level }: { data: BlockDataOf<"events_highlight">; level: HeadingLevel }) {
  const events = (await getHomeEvents(data.limit)).slice(0, data.limit);
  if (events.length === 0 && !data.emptyMessage) return null;
  return <EventTickets events={events} eyebrow={data.eyebrow} title={data.title} text={data.text} cta={data.cta} emptyMessage={data.emptyMessage} level={level} id={data.slot} />;
}

export async function NewsBlock({ data, level }: { data: BlockDataOf<"news_highlight">; level: HeadingLevel }) {
  const news = (await getHomeNews(data.limit)).slice(0, data.limit);
  if (news.length === 0 && !data.emptyMessage) return null;
  return <NewsMosaic news={news} eyebrow={data.eyebrow} title={data.title} text={data.text} cta={data.cta} emptyMessage={data.emptyMessage} level={level} id={data.slot} />;
}
