// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable.
import Image from "next/image";
import Link from "next/link";
import type { NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { cn, formatDate } from "@/lib/utils";
import { Foto, type FotoKey } from "../blocks/shared";

const FOTOS: FotoKey[] = ["cassette", "vasetti", "banco", "pianta"];
const fotoFor = (key: string): FotoKey => FOTOS[[...key].reduce((a, c) => a + c.charCodeAt(0), 0) % FOTOS.length]!;

export function NewsCard({ news, headingLevel = 3, wide = false }: { news: NewsCardData; headingLevel?: 2 | 3; wide?: boolean }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-paper text-ink transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0.5rem_0.5rem_0_0_var(--color-ink)] has-[a:focus-visible]:outline-4 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-cobalto", wide && "md:flex-row")}>
      <div className={cn("relative aspect-[16/10] overflow-hidden border-b-[3px] border-ink", wide && "md:aspect-auto md:min-h-72 md:w-1/2 md:shrink-0 md:border-b-0 md:border-r-[3px]")}>
        {news.coverUrl ? (
          <Image src={news.coverUrl} alt={news.coverAlt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]" />
        ) : (
          <Foto image={null} fallback={fotoFor(news.slug)} className="absolute inset-0 size-full transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {news.categoryName && <span className="font-stencil font-bold uppercase tracking-[0.16em] text-terracotta-deep">{news.categoryName}</span>}
          <time dateTime={new Date(news.publishedAt).toISOString()} className="text-ink-soft">{formatDate(news.publishedAt)}</time>
        </p>
        <H className="text-[1.45rem] font-extrabold leading-snug sm:text-[1.65rem]">
          <Link href={paths.newsItem(news.slug)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{news.title}</Link>
        </H>
        {news.excerpt && <p className="line-clamp-3 text-ink-soft">{news.excerpt}</p>}
        <span aria-hidden="true" className="mt-auto pt-2 text-[0.95rem] font-bold text-cobalto"><span className="marker group-hover:[background-size:100%_44%]">Leggi la notizia</span> →</span>
      </div>
    </article>
  );
}
