import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow, Pattern, Section } from "@/components/ui";
import { cleanNewsBody } from "@/lib/news/body";
import type { NewsArticleData, NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import { NewsCard } from "./NewsCard";
import { ShareLinks } from "./ShareLinks";

/** Article layout shared by the public page and the admin draft preview. */
export function NewsArticle({ article, related = [], shareUrl }: { article: NewsArticleData; related?: NewsCardData[]; shareUrl?: string }) {
  return (
    <>
      <article>
        <header className="border-b border-line bg-paper-deep/50 pb-12 pt-10 sm:pb-16 sm:pt-14">
          <Container>
            <nav aria-label="Percorso" className="mb-8 text-sm">
              <Link href={paths.news} className="font-medium text-terracotta-deep underline">← Tutte le news</Link>
            </nav>
            <div className="max-w-3xl">
              <p className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {article.categoryName && (
                  <Link href={`${paths.news}?categoria=${article.categorySlug}`} className="font-semibold uppercase tracking-[0.16em] text-terracotta-deep hover:underline">{article.categoryName}</Link>
                )}
                <time dateTime={new Date(article.publishedAt).toISOString()} className="text-ink-soft">{formatDate(article.publishedAt)}</time>
              </p>
              <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] font-medium leading-[1.04]">{article.title}</h1>
              {article.excerpt && <p className="mt-6 font-display text-[clamp(1.2rem,2.2vw,1.55rem)] leading-snug text-ink-soft">{article.excerpt}</p>}
            </div>
          </Container>
        </header>

        <Container>
          <figure className="mx-auto mb-12 mt-10 max-w-5xl sm:mb-16 sm:mt-12">
            {article.coverUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-card shadow-card">
                <Image src={article.coverUrl} alt={article.coverAlt} fill priority sizes="(min-width:1024px) 64rem, 100vw" className="object-cover" />
              </div>
            ) : (
              <Pattern variant="agrumi" className="aspect-[16/6] w-full rounded-card" />
            )}
          </figure>

          <div className="mx-auto max-w-3xl pb-16">
            <div
              className="prose-it article-body text-[1.1875rem] leading-[1.75]"
              // Sanitised on write AND here (defence in depth): only allow-listed tags survive.
              dangerouslySetInnerHTML={{ __html: cleanNewsBody(article.body) }}
            />

            {article.gallery.length > 0 && (
              <section aria-labelledby="galleria" className="mt-14">
                <h2 id="galleria" className="mb-5 text-2xl">Galleria</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {article.gallery.map((g, i) => (
                    <li key={g.id} className={i === 0 && article.gallery.length % 2 === 1 ? "sm:col-span-2" : ""}>
                      <figure>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-paper-deep">
                          <Image src={g.url} alt={g.alt} fill sizes="(min-width:768px) 36rem, 100vw" className="object-cover" />
                        </div>
                        {(g.alt || g.credit) && (
                          <figcaption className="mt-2 text-sm text-ink-soft">{g.alt}{g.credit ? ` — ${g.credit}` : ""}</figcaption>
                        )}
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {shareUrl && (
              <section aria-labelledby="condividi" className="mt-14 border-t border-line pt-8">
                <h2 id="condividi" className="mb-4 font-sans text-base font-semibold tracking-normal">Condividi questa storia</h2>
                <ShareLinks url={shareUrl} title={article.title} />
              </section>
            )}
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <Section tone="deep" aria-labelledby="correlati">
          <Container>
            <Eyebrow className="text-terracotta-deep">Continua a leggere</Eyebrow>
            <h2 id="correlati" className="mb-10 text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium">Altre storie</h2>
            <ul className="grid gap-6 md:grid-cols-3">
              {related.map((r) => <li key={r.id}><NewsCard news={r} headingLevel={3} /></li>)}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
