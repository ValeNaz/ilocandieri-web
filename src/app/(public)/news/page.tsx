import type { Metadata } from "next";
import Link from "next/link";
import { PageBlocks } from "@/components/public/blocks";
import { NewsCard } from "@/components/public/news/NewsCard";
import { Container, Eyebrow, Heading, Section } from "@/components/ui";
import { findBlock, getPageBlocks, messageText } from "@/lib/content/queries";
import { listPublicCategories, listPublishedNews } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

// Dossier 05 copy: used only if the editable blocks of the "news" page are missing or hidden.
const FALLBACK = {
  heroTitle: "Quello che facciamo merita di essere raccontato.",
  heroText: "Ogni progetto è fatto di persone, attività, piccoli traguardi e nuove sfide. Qui raccontiamo iniziative, novità e storie che attraversano il nostro territorio.",
  listTitle: "Le ultime dal nostro mondo.",
  listText: "Scopri le novità, gli aggiornamenti e le iniziative che portiamo avanti.",
  empty: "Nuove storie in arrivo. Stiamo preparando i prossimi aggiornamenti.",
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ pagina?: string; categoria?: string }> }): Promise<Metadata> {
  const base = await pageMetadata("news", paths.news);
  const { pagina, categoria } = await searchParams;
  // Filtered/paginated views are not separate canonical pages.
  return { ...base, alternates: { canonical: paths.news }, ...(categoria || (pagina && pagina !== "1") ? { robots: { index: false, follow: true } } : {}) };
}

function href(page: number, categoria?: string) {
  const q = new URLSearchParams();
  if (categoria) q.set("categoria", categoria);
  if (page > 1) q.set("pagina", String(page));
  const s = q.toString();
  return s ? `${paths.news}?${s}` : paths.news;
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ pagina?: string; categoria?: string }> }) {
  const sp = await searchParams;
  const content = await getPageBlocks("news");
  const categories = await listPublicCategories();
  const categoria = categories.find((c) => c.slug === sp.categoria)?.slug;
  const pageNo = Number.parseInt(sp.pagina ?? "1", 10) || 1;
  const list = await listPublishedNews({ page: pageNo, categorySlug: categoria ?? null });
  const items = list.items;
  const total = list.total;

  const hero = findBlock(content, "hero");
  const listBlock = findBlock(content, "list");
  const empty = messageText(content, "empty", FALLBACK.empty);
  const allLabel = messageText(content, "all_label", "Tutte le news");

  return (
    <>
      {hero ? (
        <PageBlocks content={content} only={["hero"]} />
      ) : (
        <Section className="border-b border-line bg-paper-deep/50 pb-12 sm:pb-16">
          <Container>
            <Eyebrow className="text-terracotta-deep">News</Eyebrow>
            <Heading as="h1" size="display" className="max-w-4xl">{FALLBACK.heroTitle}</Heading>
            <p className="mt-6 max-w-2xl text-lg text-ink-soft">{FALLBACK.heroText}</p>
          </Container>
        </Section>
      )}

      <Section className="pt-12 sm:pt-16">
        <Container>
          {total === 0 ? (
            <div className="rounded-card border border-dashed border-line-strong bg-card/60 px-6 py-16 text-center">
              <p className="mx-auto max-w-xl font-display text-2xl leading-snug">{empty}</p>
              {categoria && <p className="mt-6"><Link href={paths.news} className="font-medium text-terracotta-deep underline">{allLabel}</Link></p>}
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <h2 className="text-[clamp(1.6rem,3vw,2.3rem)] font-medium">{listBlock && "title" in listBlock.data ? listBlock.data.title : FALLBACK.listTitle}</h2>
                  <p className="mt-2 max-w-xl text-ink-soft">{listBlock && "text" in listBlock.data && listBlock.data.text ? listBlock.data.text : FALLBACK.listText}</p>
                </div>
              </div>

              {categories.length > 0 && (
                <nav aria-label="Filtra per categoria" className="mb-10">
                  <ul className="flex flex-wrap gap-2">
                    {[{ slug: "", name: allLabel }, ...categories].map((c) => {
                      const active = (c.slug || undefined) === categoria;
                      return (
                        <li key={c.slug || "all"}>
                          <Link href={href(1, c.slug || undefined)} aria-current={active ? "page" : undefined}
                            className={cn("inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-ink bg-ink text-paper" : "border-line-strong bg-card hover:bg-paper-deep")}>
                            {c.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((n) => <li key={n.id}><NewsCard news={n} headingLevel={2} /></li>)}
              </ul>

              {list.pages > 1 && (
                <nav aria-label="Pagine dell'elenco" className="mt-12 flex flex-wrap items-center justify-center gap-3">
                  {list.page > 1 && <Link href={href(list.page - 1, categoria)} rel="prev" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 font-medium hover:bg-paper-deep">← Più recenti</Link>}
                  <span className="px-2 text-sm text-ink-soft" aria-current="page">Pagina {list.page} di {list.pages}</span>
                  {list.page < list.pages && <Link href={href(list.page + 1, categoria)} rel="next" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 font-medium hover:bg-paper-deep">Meno recenti →</Link>}
                </nav>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
