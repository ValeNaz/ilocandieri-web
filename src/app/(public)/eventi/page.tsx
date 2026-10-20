import type { Metadata } from "next";
import Link from "next/link";
import { PageBlocks } from "@/components/public/blocks";
import { EventCard } from "@/components/public/events/EventCard";
import { EventsHero } from "@/components/public/liste/PageHeroes";
import { Room, Wrap } from "@/components/public/kit/Room";
import { EVENTS_PAGE_COPY as COPY } from "@/lib/events/copy";
import { findBlock } from "@/lib/content/queries";
import { listPublicEvents } from "@/lib/events/public";
import { getEventTexts } from "@/lib/events/texts";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import "@/components/public/liste/liste.css";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("eventi", "/eventi");
}

function Head({ id, title, text, children }: { id: string; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="lr-head">
      <h2 id={id} className="lr-title">{title}</h2>
      {text && <p className="lr-text">{text}</p>}
      {children && <div className="lg:col-span-2">{children}</div>}
    </div>
  );
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [listing, { content }] = await Promise.all([listPublicEvents({ categorySlug: typeof categoria === "string" ? categoria : null }), getEventTexts()]);
  const { upcoming, past, categories, activeCategory, totalPublished } = listing;
  // Hero and section intros are editable in admin (Pagine > Eventi); the dossier copy is the fallback.
  const hasHero = !!findBlock(content, "hero", "hero");
  const upHead = findBlock(content, "upcoming", "section_heading")?.data ?? { title: COPY.upcomingTitle, text: COPY.upcomingText };
  const pastHead = findBlock(content, "past", "section_heading")?.data ?? { title: COPY.pastTitle, text: COPY.pastText };
  const cta = totalPublished > 0 ? <a href="#prossimi" className="pill pill-solid">Vedi il calendario <span className="arrow" aria-hidden="true">↓</span></a> : undefined;

  return (
    <>
      {hasHero ? <PageBlocks content={content} only={["hero"]} /> : <EventsHero title={COPY.heroTitle} text={COPY.heroText} eyebrow="Eventi" actions={cta} />}

      {totalPublished === 0 ? (
        <Room tone="white" className="lr-pad">
          <Wrap>
            <div className="cut cut-yellow max-w-3xl">
              <h2 className="t-scene">{COPY.emptyTitle}</h2>
              <p className="t-lead mt-4">{COPY.emptyText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={paths.contacts} className="pill pill-solid">Scrivici <span className="arrow" aria-hidden="true">→</span></Link>
                <Link href={paths.news} className="pill pill-line">Leggi le news</Link>
              </div>
            </div>
          </Wrap>
        </Room>
      ) : (
        <>
          <Room tone="white" className="lr-pad" aria-labelledby="prossimi" id="prossimi-sezione">
            <Wrap>
              <Head id="prossimi" title={upHead.title} text={upHead.text}>
                {categories.length > 0 && (
                  <nav aria-label="Filtra per categoria" className="chips mt-2">
                    <Link href={paths.events} className="chip" aria-current={!activeCategory ? "true" : undefined}>Tutti</Link>
                    {categories.map((c) => (
                      <Link key={c.slug} href={`${paths.events}?categoria=${encodeURIComponent(c.slug)}`} className="chip" aria-current={activeCategory === c.slug ? "true" : undefined}>{c.name}</Link>
                    ))}
                  </nav>
                )}
              </Head>
              {upcoming.length > 0 ? (
                <ul className="tk-grid">
                  {upcoming.map((e, i) => <li key={e.id} className={i === 0 && upcoming.length > 1 && !activeCategory ? "tk-wide" : undefined}><EventCard event={e} headingLevel={3} featured={i === 0 && upcoming.length > 1 && !activeCategory} /></li>)}
                </ul>
              ) : (
                <div className="cut cut-yellow max-w-3xl">
                  <h3 className="t-head">{activeCategory ? "Nessun appuntamento in questa categoria." : "Nessun appuntamento in programma."}</h3>
                  <p className="mt-3 text-lg">{COPY.noUpcomingText}</p>
                  <div className="mt-6"><Link href={paths.contacts} className="pill pill-solid">Scrivici <span className="arrow" aria-hidden="true">→</span></Link></div>
                </div>
              )}
            </Wrap>
          </Room>

          {past.length > 0 && (
            <Room tone="yellow" className="lr-pad" aria-labelledby="passati">
              <Wrap>
                <Head id="passati" title={pastHead.title} text={pastHead.text} />
                <ul className="tk-grid">
                  {past.map((e) => <li key={e.id}><EventCard event={e} headingLevel={3} /></li>)}
                </ul>
              </Wrap>
            </Room>
          )}
        </>
      )}

      <Room tone="orange" className="py-14 sm:py-20">
        <Wrap className="flex flex-wrap items-center justify-between gap-6">
          <p className="t-scene max-w-[22ch]">Vuoi sapere cosa stiamo organizzando?</p>
          <Link href={paths.contacts} className="pill pill-solid">Scrivici <span className="arrow" aria-hidden="true">→</span></Link>
        </Wrap>
      </Room>
    </>
  );
}
