import { ButtonLink, Container, Section } from "@/components/ui";
import { AbesShowcase } from "@/components/public/abes/AbesShowcase";
import { EventCard } from "@/components/public/events/EventCard";
import { NewsCard } from "@/components/public/news/NewsCard";
import { getHomeProducts, getShopProducts } from "@/lib/abes/public";
import type { BlockDataOf } from "@/lib/content/blocks";
import { getHomeEvents } from "@/lib/events/public";
import { getHomeNews } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { BlockHeading, CtaLink, OptionalEyebrow, TITLE, type HeadingLevel } from "./shared";

function SectionHead({ eyebrow, title, text, level, tint = "text-terracotta-deep" }: { eyebrow: string; title: string; text: string; level: HeadingLevel; tint?: string }) {
  return (
    <div className="rise grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <OptionalEyebrow text={eyebrow} className={tint} />
        <BlockHeading level={level} className={TITLE.scene}>{title}</BlockHeading>
      </div>
      {text && <p className="text-lg leading-relaxed lg:col-span-4">{text}</p>}
    </div>
  );
}

const EMPTY = "mt-10 rounded-[1.5rem] border-[3px] border-dashed border-ink/60 bg-card px-6 py-8 text-ink";

/** ABES showcase. Falls back to an editorial block + link to the catalogue when there are no products (never fake cards). */
export async function AbesBlock({ data, level }: { data: BlockDataOf<"abes_showcase">; level: HeadingLevel }) {
  const products = (await (data.source === "shop" ? getShopProducts() : getHomeProducts(data.limit))).slice(0, data.source === "shop" ? undefined : data.limit);
  if (products.length > 0) {
    return (
      <AbesShowcase id={data.slot} products={products} eyebrow={data.eyebrow} title={data.title} text={data.text} ctaLabel={data.ctaLabel} cardCtaLabel={data.cardCtaLabel} headingLevel={2} />
    );
  }
  return (
    <Section id={data.slot} className="bg-limone text-ink">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} tint="text-ink" />
        <div className="mt-10"><ButtonLink href={paths.abesShop} size="lg">{data.ctaLabel}</ButtonLink></div>
      </Container>
    </Section>
  );
}

export async function EventsBlock({ data, level }: { data: BlockDataOf<"events_highlight">; level: HeadingLevel }) {
  const events = await getHomeEvents(data.limit);
  if (events.length === 0 && !data.emptyMessage) return null;
  return (
    <Section id={data.slot} className="py-20 sm:py-32">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        {events.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:mt-16 lg:grid-cols-2 lg:gap-6">
            {events.slice(0, data.limit).map((e) => <li key={e.id} className="rise"><EventCard event={e} headingLevel={3} /></li>)}
          </ul>
        ) : (
          <p className={EMPTY}>{data.emptyMessage}</p>
        )}
        {data.cta && <div className="mt-10"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Container>
    </Section>
  );
}

export async function NewsBlock({ data, level }: { data: BlockDataOf<"news_highlight">; level: HeadingLevel }) {
  const news = await getHomeNews(data.limit);
  if (news.length === 0 && !data.emptyMessage) return null;
  return (
    <Section id={data.slot} className="bg-kraft py-20 text-ink sm:py-32">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} tint="text-ink" />
        {news.length > 0 ? (
          <ul className={news.length === 1 ? "mt-10 max-w-4xl sm:mt-16" : "mt-10 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3"}>
            {news.slice(0, data.limit).map((n) => <li key={n.id} className="rise"><NewsCard news={n} headingLevel={3} wide={news.length === 1} /></li>)}
          </ul>
        ) : (
          <p className={EMPTY}>{data.emptyMessage}</p>
        )}
        {data.cta && <div className="mt-10"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Container>
    </Section>
  );
}
