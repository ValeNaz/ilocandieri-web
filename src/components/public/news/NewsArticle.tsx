import Image from "next/image";
import Link from "next/link";
import { NewsTile } from "@/components/public/art/liste/news-tiles";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { cleanNewsBody } from "@/lib/news/body";
import type { NewsArticleData, NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { cn, formatDate } from "@/lib/utils";
import "../liste/liste.css";
import { NewsCard, toneFor } from "./NewsCard";
import { ShareLinks } from "./ShareLinks";

/** Article layout shared by the public page and the admin draft preview (no `shareUrl` = preview: no floating header to slide under). */
export function NewsArticle({ article, related = [], shareUrl }: { article: NewsArticleData; related?: NewsCardData[]; shareUrl?: string }) {
  const preview = !shareUrl;
  const tone = toneFor(article.slug) === "orange" ? "orange" : "yellow";
  const variant = [...article.slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) >>> 3;
  return (
    <>
      <article>
        <Room tone={tone} className={cn("lh", preview && "lh-flat")}>
          <Wrap className="na-hero">
            <div className="lh-text">
              <Link href={paths.news} className="pill pill-line !min-h-11 !px-5"><span aria-hidden="true">←</span> Tutte le news</Link>
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-bold">
                {article.categoryName && (
                  <Link href={`${paths.news}?categoria=${article.categorySlug}`} className="bd !min-h-9 !px-4 !text-[0.85rem]">{article.categoryName}</Link>
                )}
                <time dateTime={new Date(article.publishedAt).toISOString()}>{formatDate(article.publishedAt)}</time>
              </p>
              <Kinetic as="h1" text={article.title} className="lh-title lh-title-s" />
              {article.excerpt && <p className="art-lead mt-6">{article.excerpt}</p>}
            </div>
            <figure className="art-fig na-cover">
              {article.coverUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image src={article.coverUrl} alt={article.coverAlt} fill priority sizes="(min-width:1024px) 40rem, 100vw" className="object-cover" />
                </div>
              ) : (
                <div className="relative aspect-[4/3]" style={{ background: tone === "orange" ? "var(--c-green)" : "var(--c-orange)" }}>
                  <NewsTile variant={variant} media={tone === "orange" ? "green" : "orange"} />
                </div>
              )}
            </figure>
          </Wrap>
        </Room>

        <Room tone="white" className="py-14 sm:py-20">
          <Wrap>
            <div className="mx-auto max-w-3xl">
              <div
                className="pub-prose prose-it article-body"
                // Sanitised on write AND here (defence in depth): only allow-listed tags survive.
                dangerouslySetInnerHTML={{ __html: cleanNewsBody(article.body) }}
              />

              {article.gallery.length > 0 && (
                <section aria-labelledby="galleria" className="mt-16">
                  <h2 id="galleria" className="t-scene mb-6">Galleria</h2>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {article.gallery.map((g, i) => (
                      <li key={g.id} className={i === 0 && article.gallery.length % 2 === 1 ? "sm:col-span-2" : ""}>
                        <figure>
                          <div className="art-fig relative aspect-[4/3]">
                            <Image src={g.url} alt={g.alt} fill sizes="(min-width:768px) 36rem, 100vw" className="object-cover" />
                          </div>
                          {(g.alt || g.credit) && <figcaption className="mt-2 text-sm">{g.alt}{g.credit ? ` · ${g.credit}` : ""}</figcaption>}
                        </figure>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </Wrap>
        </Room>

        {shareUrl && (
          <Room tone="orange" aria-labelledby="condividi" className="py-12 sm:py-16">
            <Wrap className="flex flex-wrap items-center justify-between gap-6">
              <h2 id="condividi" className="t-head max-w-[18ch]">Condividi questa storia</h2>
              <ShareLinks url={shareUrl} title={article.title} />
            </Wrap>
          </Room>
        )}
      </article>

      {related.length > 0 && (
        <Room tone="white" aria-labelledby="correlati" className="lr-pad">
          <Wrap>
            <p className="lh-kicker t-label">Continua a leggere</p>
            <h2 id="correlati" className="lr-title mb-10 mt-5">Altre storie</h2>
            <ul className="nc-grid">
              {related.map((r) => <li key={r.id}><NewsCard news={r} headingLevel={3} /></li>)}
            </ul>
          </Wrap>
        </Room>
      )}
    </>
  );
}
