// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable.
import Image from "next/image";
import Link from "next/link";
import { Pattern } from "@/components/ui";
import type { NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";

const VARIANTS = ["agrumi", "maiolica", "campi"] as const;
const variantFor = (key: string) => VARIANTS[[...key].reduce((a, c) => a + c.charCodeAt(0), 0) % VARIANTS.length]!;

export function NewsCard({ news, headingLevel = 3 }: { news: NewsCardData; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-card shadow-card transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-pop has-[a:focus-visible]:outline-4 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-terracotta">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
        {news.coverUrl ? (
          <Image src={news.coverUrl} alt={news.coverAlt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]" />
        ) : (
          <Pattern variant={variantFor(news.slug)} className="size-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          {news.categoryName && <span className="font-semibold uppercase tracking-[0.14em] text-terracotta-deep">{news.categoryName}</span>}
          <time dateTime={new Date(news.publishedAt).toISOString()}>{formatDate(news.publishedAt)}</time>
        </p>
        <H className="font-display text-[1.45rem] font-medium leading-snug">
          <Link href={paths.newsItem(news.slug)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{news.title}</Link>
        </H>
        {news.excerpt && <p className="line-clamp-3 text-ink-soft">{news.excerpt}</p>}
        <span aria-hidden="true" className="mt-auto pt-2 text-[0.95rem] font-semibold text-terracotta-deep">Leggi la notizia →</span>
      </div>
    </article>
  );
}
