import type { Metadata } from "next";
import Link from "next/link";
import { PageBlocks } from "@/components/public/blocks";
import { NewsCard } from "@/components/public/news/NewsCard";
import { NewsHero } from "@/components/public/liste/PageHeroes";
import { Room, Wrap } from "@/components/public/kit/Room";
import "@/components/public/liste/liste.css";
import { findBlock, getPageBlocks, messageText } from "@/lib/content/queries";
import { listPublicCategories, listPublishedNews } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

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
      {hero ? <PageBlocks content={content} only={["hero"]} /> : <NewsHero title={FALLBACK.heroTitle} text={FALLBACK.heroText} eyebrow="News" />}

      <Room tone="white" className="lr-pad" aria-labelledby="elenco">
        <Wrap>
          {total === 0 ? (
            <div className="cut cut-yellow max-w-3xl">
              <h2 id="elenco" className="t-scene">{empty}</h2>
              {categoria && <p className="mt-6"><Link href={paths.news} className="pill pill-solid">{allLabel}</Link></p>}
            </div>
          ) : (
            <>
              <div className="lr-head">
                <h2 id="elenco" className="lr-title">{listBlock && "title" in listBlock.data ? listBlock.data.title : FALLBACK.listTitle}</h2>
                <p className="lr-text">{listBlock && "text" in listBlock.data && listBlock.data.text ? listBlock.data.text : FALLBACK.listText}</p>
                {categories.length > 0 && (
                  <nav aria-label="Filtra per categoria" className="lg:col-span-2">
                    <ul className="chips">
                      {[{ slug: "", name: allLabel }, ...categories].map((c) => {
                        const active = (c.slug || undefined) === categoria;
                        return (
                          <li key={c.slug || "all"}>
                            <Link href={href(1, c.slug || undefined)} aria-current={active ? "page" : undefined} className="chip">{c.name}</Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                )}
              </div>

              <ul className="nc-grid">
                {items.map((n, i) => <li key={n.id} className={i === 0 && list.page === 1 && items.length > 1 ? "nc-first" : undefined}><NewsCard news={n} headingLevel={2} wide={i === 0 && list.page === 1 && items.length > 1} /></li>)}
              </ul>

              {list.pages > 1 && (
                <nav aria-label="Pagine dell'elenco" className="pager">
                  {list.page > 1 && <Link href={href(list.page - 1, categoria)} rel="prev" className="pill pill-line">← Più recenti</Link>}
                  <span className="px-2 font-bold" aria-current="page">Pagina {list.page} di {list.pages}</span>
                  {list.page < list.pages && <Link href={href(list.page + 1, categoria)} rel="next" className="pill pill-line">Meno recenti →</Link>}
                </nav>
              )}
            </>
          )}
        </Wrap>
      </Room>
    </>
  );
}
