// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable (`tone` and `first` are optional additions).
import Image from "next/image";
import Link from "next/link";
import type { NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { cn, formatDate } from "@/lib/utils";
import "../liste/liste.css";

export type NewsTone = "yellow" | "orange" | "green" | "white";
const TONES: NewsTone[] = ["yellow", "orange", "green", "white"];
const hash = (key: string) => [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
/** Stable colour of a story, from its slug: the same article keeps the same colour everywhere. */
export const toneFor = (slug: string): NewsTone => TONES[hash(slug) % TONES.length]!;

/**
 * A story as a card: 16:9 cover photo when there is one, else text only (date small on top, no empty box, no drawing
 * standing in for a photo). White cards; the featured one (`first`) is yellow.
 */
export function NewsCard({ news, headingLevel = 3, wide = false, tone, first = false }: { news: NewsCardData; headingLevel?: 2 | 3; wide?: boolean; tone?: NewsTone; first?: boolean }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const t = tone ?? (first || wide ? "yellow" : "white");
  return (
    <article className={cn("nc", wide && news.coverUrl && "nc-wide", !news.coverUrl && "nc-text", first && "nc-first")} data-tone={t}>
      {news.coverUrl && (
        <div className="nc-media">
          <Image src={news.coverUrl} alt={news.coverAlt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" />
        </div>
      )}
      <div className="nc-body">
        <p className="nc-meta">
          {news.categoryName && <span className="nc-cat">{news.categoryName}</span>}
          <time dateTime={new Date(news.publishedAt).toISOString()}>{formatDate(news.publishedAt)}</time>
        </p>
        <H className="nc-title">
          <Link href={paths.newsItem(news.slug)}>{news.title}</Link>
        </H>
        {news.excerpt && <p className="nc-ex">{news.excerpt}</p>}
        <span aria-hidden="true" className="nc-more">Leggi la notizia <span className="arrow">→</span></span>
      </div>
    </article>
  );
}
