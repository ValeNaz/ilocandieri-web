import type { Metadata } from "next";
import Link from "next/link";
import { PageBlocks } from "@/components/public/blocks";
import { EventCard } from "@/components/public/events/EventCard";
import { ButtonLink, Container, EmptyState, Eyebrow, Heading, Section, buttonClasses } from "@/components/ui";
import { EVENTS_PAGE_COPY as COPY } from "@/lib/events/copy";
import { findBlock } from "@/lib/content/queries";
import { listPublicEvents } from "@/lib/events/public";
import { getEventTexts } from "@/lib/events/texts";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("eventi", "/eventi");
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [listing, { content }] = await Promise.all([listPublicEvents({ categorySlug: typeof categoria === "string" ? categoria : null }), getEventTexts()]);
  const { upcoming, past, categories, activeCategory, totalPublished } = listing;
  // Hero and section intros are editable in admin (Pagine > Eventi); dossier 05 copy is the fallback.
  const hasHero = !!findBlock(content, "hero", "hero");
  const upHead = findBlock(content, "upcoming", "section_heading")?.data ?? { title: COPY.upcomingTitle, text: COPY.upcomingText };
  const pastHead = findBlock(content, "past", "section_heading")?.data ?? { title: COPY.pastTitle, text: COPY.pastText };

  return (
    <>
      {hasHero ? (
        <PageBlocks content={content} only={["hero"]} />
      ) : (
        <Section className="pb-10 sm:pb-14">
          <Container>
            <Eyebrow className="text-terracotta-deep">Eventi</Eyebrow>
            <Heading as="h1" size="display" className="max-w-4xl">{COPY.heroTitle}</Heading>
            <p className="mt-6 max-w-2xl text-lg text-ink-soft">{COPY.heroText}</p>
          </Container>
        </Section>
      )}

      {totalPublished === 0 ? (
        <Section className="pt-0">
          <Container>
            <EmptyState
              title={COPY.emptyTitle}
              description={COPY.emptyText}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href={paths.contacts}>Scrivici</ButtonLink>
                  <ButtonLink href={paths.news} variant="secondary">Leggi le news</ButtonLink>
                </div>
              }
            />
          </Container>
        </Section>
      ) : (
        <>
          <Section tone="deep" className="py-14 sm:py-20" aria-labelledby="prossimi">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <Heading id="prossimi" size="lg">{upHead.title}</Heading>
                  {upHead.text && <p className="mt-3 text-ink-soft">{upHead.text}</p>}
                </div>
                {categories.length > 0 && (
                  <nav aria-label="Filtra per categoria" className="flex flex-wrap gap-2">
                    <Link href={paths.events} aria-current={!activeCategory ? "true" : undefined} className={cn(buttonClasses(!activeCategory ? "primary" : "secondary", "sm"))}>Tutti</Link>
                    {categories.map((c) => (
                      <Link key={c.slug} href={`${paths.events}?categoria=${encodeURIComponent(c.slug)}`} aria-current={activeCategory === c.slug ? "true" : undefined} className={cn(buttonClasses(activeCategory === c.slug ? "primary" : "secondary", "sm"))}>
                        {c.name}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>
              <div className="mt-10">
                {upcoming.length > 0 ? (
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((e) => <li key={e.id}><EventCard event={e} headingLevel={3} /></li>)}
                  </ul>
                ) : (
                  <EmptyState
                    title={activeCategory ? "Nessun appuntamento in questa categoria." : "Nessun appuntamento in programma."}
                    description={COPY.noUpcomingText}
                    action={<ButtonLink href={paths.contacts} variant="secondary">Scrivici</ButtonLink>}
                  />
                )}
              </div>
            </Container>
          </Section>

          {past.length > 0 && (
            <Section aria-labelledby="passati">
              <Container>
                <div className="max-w-2xl">
                  <Heading id="passati" size="lg">{pastHead.title}</Heading>
                  {pastHead.text && <p className="mt-3 text-ink-soft">{pastHead.text}</p>}
                </div>
                <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((e) => <li key={e.id}><EventCard event={e} headingLevel={3} /></li>)}
                </ul>
              </Container>
            </Section>
          )}
        </>
      )}
    </>
  );
}
