import { ButtonLink, Container, Section } from "@/components/ui";
import { AbesShowcase } from "@/components/public/abes/AbesShowcase";
import { EventCard } from "@/components/public/events/EventCard";
import { NewsCard } from "@/components/public/news/NewsCard";
import { getHomeProducts, getShopProducts } from "@/lib/abes/public";
import type { BlockDataOf } from "@/lib/content/blocks";
import { getHomeEvents } from "@/lib/events/public";
import { getHomeNews } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { BlockHeading, CtaLink, OptionalEyebrow, type HeadingLevel } from "./shared";

const H = "font-medium text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.08]";

function SectionHead({ eyebrow, title, text, level }: { eyebrow: string; title: string; text: string; level: HeadingLevel }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <OptionalEyebrow text={eyebrow} className="text-terracotta-deep" />
        <BlockHeading level={level} className={H}>{title}</BlockHeading>
      </div>
      {text && <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">{text}</p>}
    </div>
  );
}

/** ABES showcase. Falls back to an editorial block + link to the catalogue when there are no products (never fake cards). */
export async function AbesBlock({ data, level }: { data: BlockDataOf<"abes_showcase">; level: HeadingLevel }) {
  const products = (await (data.source === "shop" ? getShopProducts() : getHomeProducts(data.limit))).slice(0, data.source === "shop" ? undefined : data.limit);
  if (products.length > 0) {
    return (
      <div id={data.slot} className="bg-paper-deep">
        <AbesShowcase products={products} eyebrow={data.eyebrow} title={data.title} text={data.text} ctaLabel={data.ctaLabel} cardCtaLabel={data.cardCtaLabel} headingLevel={2} />
      </div>
    );
  }
  return (
    <Section id={data.slot} tone="deep">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        <div className="mt-10"><ButtonLink href={paths.abesShop} size="lg">{data.ctaLabel}</ButtonLink></div>
      </Container>
    </Section>
  );
}

export async function EventsBlock({ data, level }: { data: BlockDataOf<"events_highlight">; level: HeadingLevel }) {
  const events = await getHomeEvents(data.limit);
  if (events.length === 0 && !data.emptyMessage) return null;
  return (
    <Section id={data.slot}>
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        {events.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, data.limit).map((e) => <li key={e.id}><EventCard event={e} headingLevel={3} /></li>)}
          </ul>
        ) : (
          <p className="mt-10 rounded-card border border-dashed border-line-strong bg-card/60 px-6 py-8 text-ink-soft">{data.emptyMessage}</p>
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
    <Section id={data.slot} tone="deep">
      <Container>
        <SectionHead eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        {news.length > 0 ? (
          <ul className={news.length === 1 ? "mt-8 max-w-4xl sm:mt-12" : "mt-8 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3"}>
            {news.slice(0, data.limit).map((n) => <li key={n.id}><NewsCard news={n} headingLevel={3} wide={news.length === 1} /></li>)}
          </ul>
        ) : (
          <p className="mt-10 rounded-card border border-dashed border-line-strong bg-card/60 px-6 py-8 text-ink-soft">{data.emptyMessage}</p>
        )}
        {data.cta && <div className="mt-10"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Container>
    </Section>
  );
}
