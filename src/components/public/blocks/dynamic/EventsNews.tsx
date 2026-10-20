import Image from "next/image";
import Link from "next/link";
import { PillLink } from "@/components/public/abes/PillLink";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { Cta } from "@/lib/content/blocks";
import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import type { NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import "./dynamic.css";

type Col<T> = { items: T[]; eyebrow?: string; title: string; cta?: Cta | null; emptyMessage?: string };

/**
 * Home "Eventi + News" as ONE white section in two columns: up to 3 upcoming events (yellow tickets, the date on a
 * horizontal strip on top) and up to 3 news (16:9 cover when there is one, else text only, the date small on top).
 * A column with nothing to show and no empty message disappears; the other takes the full width.
 */
export function EventsNews({ events, news, level = 2, id }: { events: Col<EventCardData>; news: Col<NewsCardData>; level?: 1 | 2; id?: string }) {
  const H = level === 1 ? "h1" : "h2";
  const showE = events.items.length > 0 || !!events.emptyMessage;
  const showN = news.items.length > 0 || !!news.emptyMessage;
  if (!showE && !showN) return null;
  return (
    <Room tone="white" id={id} className="py-16 sm:py-24">
      <Wrap className={`en ${showE && showN ? "en-2" : ""}`}>
        {showE && (
          <section aria-labelledby="en-ev">
            {events.eyebrow && <p className="t-label mb-3 text-[var(--pop-text)]">{events.eyebrow}</p>}
            <H id="en-ev" className="t-scene">{events.title}</H>
            {events.items.length > 0 ? (
              <ul className="en-list mt-8">
                {events.items.slice(0, 3).map((e) => {
                  const { day, month } = eventDayBadge(e.startsAt);
                  return (
                    <li key={e.id}>
                      <article className="en-tk">
                        <p className="en-strip"><time dateTime={new Date(e.startsAt).toISOString()}>{`${day} ${month}`.toUpperCase()} · {formatEventTime(e.startsAt)}</time>{e.categoryName && <span>{e.categoryName}</span>}</p>
                        <div className="en-tk-body">
                          <h3 className="en-title"><Link href={paths.event(e.slug)}>{e.title}</Link></h3>
                          {e.location && <p className="en-sub"><span className="sr-only">Luogo: </span>{e.location}</p>}
                          {e.registrationLabel && <p className="etk-tag">{e.registrationLabel}</p>}
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="t-body mt-8">{events.emptyMessage}</p>}
            {events.cta && <div className="mt-8"><PillLink href={events.cta.href}>{events.cta.label}</PillLink></div>}
          </section>
        )}
        {showN && (
          <section aria-labelledby="en-nw">
            {news.eyebrow && <p className="t-label mb-3 text-[var(--pop-text)]">{news.eyebrow}</p>}
            <H id="en-nw" className="t-scene">{news.title}</H>
            {news.items.length > 0 ? (
              <ul className="en-list mt-8">
                {news.items.slice(0, 3).map((n) => (
                  <li key={n.id}>
                    <article className={`en-nw ${n.coverUrl ? "en-nw-pic" : ""}`}>
                      {n.coverUrl && <div className="en-cover"><Image src={n.coverUrl} alt={n.coverAlt} fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover" /></div>}
                      <p className="en-date">{n.categoryName && <span>{n.categoryName} · </span>}<time dateTime={new Date(n.publishedAt).toISOString()}>{formatDate(n.publishedAt)}</time></p>
                      <h3 className="en-title"><Link href={paths.newsItem(n.slug)}>{n.title}</Link></h3>
                      {n.excerpt && <p className="en-sub en-ex">{n.excerpt}</p>}
                    </article>
                  </li>
                ))}
              </ul>
            ) : <p className="t-body mt-8">{news.emptyMessage}</p>}
            {news.cta && <div className="mt-8"><PillLink href={news.cta.href} kind="line">{news.cta.label}</PillLink></div>}
          </section>
        )}
      </Wrap>
    </Room>
  );
}
