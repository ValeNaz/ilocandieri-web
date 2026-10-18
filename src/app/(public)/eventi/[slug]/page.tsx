import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/JsonLd";
import { RegistrationForm } from "@/components/public/events/RegistrationForm";
import { Badge, ButtonLink, Card, Container, Eyebrow, Heading, Pattern, Section } from "@/components/ui";
import { buildCta } from "@/lib/events/cta";
import { REGISTRATION_SCOPE } from "@/lib/events/constants";
import { ensureFormVersion } from "@/lib/events/forms";
import { formatEventWhen, nowMs } from "@/lib/events/format";
import { HOLD_NOTICE, NO_HOLD_NOTICE, MODE_COPY, stateMessage } from "@/lib/events/messages";
import { getPublicEvent } from "@/lib/events/public";
import { holdsSeats } from "@/lib/events/state";
import { getEventTexts } from "@/lib/events/texts";
import { getSiteUrl } from "@/lib/env";
import { paths } from "@/lib/paths";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken, sanitizeHtml, stripHtml } from "@/lib/security";
import { getSetting } from "@/lib/settings";
import { noIndex } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicEvent(slug);
  if (!p) return { title: "Evento non trovato", ...noIndex };
  const seo = await getSetting("seo_defaults");
  const e = p.event;
  const title = (e.seoTitle || e.title).trim();
  const fullTitle = seo.titleTemplate.replace("%s", title);
  const description = e.seoDescription || e.summary || stripHtml(e.body).slice(0, 160) || seo.description || undefined;
  const url = `${getSiteUrl()}${paths.event(e.slug)}`;
  const image = p.coverUrl ? [{ url: `${getSiteUrl()}${p.coverUrl}`, alt: p.coverAlt, ...(p.coverWidth && p.coverHeight ? { width: p.coverWidth, height: p.coverHeight } : {}) }] : undefined;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: paths.event(e.slug) },
    openGraph: { title, description, url, siteName: seo.siteName, locale: "it_IT", type: "article", images: image },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image?.map((i) => i.url) },
  };
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-[1.02rem] font-medium text-ink">{children}</dd>
    </div>
  );
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const p = await getPublicEvent(slug);
  if (!p) notFound();
  const { event: e, state } = p;
  const texts = await getEventTexts();
  const cta = buildCta(e);
  const mode = e.registrationMode;
  const stateText = state === "open" || state === "not_applicable" ? null : stateMessage(e, state, texts.messages);
  const audience = e.audience || p.categoryName;
  const siteUrl = getSiteUrl();

  const showForm = e.ctaType === "registration" && state === "open" && mode;
  const version = showForm ? await ensureFormVersion(e.id, mode) : null;
  const modeCopy = mode ? texts.mode[mode] : null;
  const seatsNotice = mode === "approval" || mode === "reserved" ? (holdsSeats(e) ? HOLD_NOTICE : e.capacity != null ? NO_HOLD_NOTICE : null) : null;
  const privacyNote = e.privacyNote;
  const body = e.body ? sanitizeHtml(e.body) : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: new Date(e.startsAt).toISOString(),
    ...(e.endsAt ? { endDate: new Date(e.endsAt).toISOString() } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(e.location ? { location: { "@type": "Place", name: e.location } } : {}),
    ...(e.summary ? { description: e.summary } : {}),
    ...(p.coverUrl ? { image: [`${siteUrl}${p.coverUrl}`] } : {}),
    url: `${siteUrl}${paths.event(e.slug)}`,
    organizer: { "@type": "Organization", name: "I Locandieri", url: siteUrl },
  };

  return (
    <article>
      <JsonLd data={jsonLd} />
      <Section className="pb-8 sm:pb-12">
        <Container>
          <Link href={paths.events} className="mb-8 inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-terracotta-deep hover:underline">
            <span aria-hidden="true">←</span> Tutti gli eventi
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {p.categoryName && <Badge tone="terracotta">{p.categoryName}</Badge>}
            {p.isPast && <Badge>Concluso</Badge>}
            {state === "open" && <Badge tone="success">Iscrizioni aperte</Badge>}
            {state === "full" && <Badge tone="warning">Posti esauriti</Badge>}
            {state === "closed" && !p.isPast && <Badge>Iscrizioni terminate</Badge>}
          </div>
          <Heading as="h1" size="display" className="mt-5 max-w-4xl">{e.title}</Heading>
          {e.summary && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft">{e.summary}</p>}
        </Container>
      </Section>

      <Container className="pb-20 sm:pb-28">
        <div className="relative mb-10 aspect-[16/8] max-h-[30rem] w-full overflow-hidden rounded-card bg-paper-deep shadow-card">
          {p.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route
            <img src={p.coverUrl} alt={p.coverAlt} className={`absolute inset-0 size-full object-cover ${p.isPast ? "saturate-[.7]" : ""}`} />
          ) : (
            <Pattern variant="maiolica" className="absolute inset-0 size-full" />
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
          <aside className="lg:order-2" aria-label="Informazioni sull'evento">
            <div className="space-y-5 lg:sticky lg:top-28">
              <Card className="p-6 sm:p-7">
                <dl className="divide-y divide-line">
                  <InfoRow label="Quando">{formatEventWhen(e.startsAt, e.endsAt)}</InfoRow>
                  {e.location && <InfoRow label="Dove">{e.location}</InfoRow>}
                  {audience && <InfoRow label="A chi è rivolto">{audience}</InfoRow>}
                  {mode && e.ctaType === "registration" && (
                    <InfoRow label="Modalità di partecipazione">
                      {MODE_COPY[mode].label}
                      {mode === "reserved" && e.reservedCriteria && <span className="mt-1 block text-[0.95rem] font-normal text-ink-soft">Riservata a: {e.reservedCriteria}</span>}
                      {mode === "limited" && p.remaining != null && !p.isPast && <span className="mt-1 block text-[0.95rem] font-normal text-ink-soft" data-testid="remaining">Posti disponibili: {p.remaining}</span>}
                    </InfoRow>
                  )}
                </dl>

                {!p.isPast && cta.kind === "link" && (
                  <div className="mt-6">
                    <ButtonLink href={cta.href} size="lg" className="w-full" external={cta.external}>{cta.label}</ButtonLink>
                  </div>
                )}
                {cta.kind === "registration" && state === "open" && (
                  <div className="mt-6">
                    <ButtonLink href="#iscrizione" size="lg" className="w-full">{modeCopy?.button ?? cta.label}</ButtonLink>
                  </div>
                )}
                {e.ctaType === "registration" && stateText && (
                  <p className="mt-6 rounded-control bg-paper-deep px-4 py-3 text-[0.97rem]" role="status">{stateText}</p>
                )}
                {e.ctaType !== "registration" && p.isPast && (
                  <p className="mt-6 rounded-control bg-paper-deep px-4 py-3 text-[0.97rem]">{texts.messages.past}</p>
                )}
              </Card>
              {p.isPast && (
                <ButtonLink href={paths.events} variant="secondary" className="w-full">Vedi i prossimi eventi</ButtonLink>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:order-1">
            {body ? <div className="prose-it text-lg" dangerouslySetInnerHTML={{ __html: body }} /> : null}

            {e.ctaType === "registration" && (
              <section id="iscrizione" aria-labelledby="iscrizione-titolo" className={body ? "mt-14 scroll-mt-28" : "scroll-mt-28"}>
                <Eyebrow className="text-terracotta-deep">Partecipa</Eyebrow>
                <h2 id="iscrizione-titolo" className="mb-6 text-[clamp(1.6rem,3vw,2.25rem)] font-medium">Iscrizione</h2>
                {showForm && version && modeCopy && mode ? (
                  <Card className="p-6 sm:p-9">
                    <RegistrationForm
                      slug={e.slug}
                      eventId={e.id}
                      formVersionId={version.id}
                      fields={version.fields}
                      intro={modeCopy.intro}
                      button={modeCopy.button}
                      seatsNotice={seatsNotice}
                      criteria={mode === "reserved" ? e.reservedCriteria : null}
                      privacyNote={privacyNote}
                      privacyHref={paths.privacy}
                      token={issueFormToken(nowMs(), REGISTRATION_SCOPE)}
                      tokenField={FORM_TOKEN_FIELD}
                      honeypotField={HONEYPOT_FIELD}
                      remaining={mode === "limited" ? p.remaining : null}
                      maxSeats={Math.max(1, e.maxSeatsPerRequest)}
                      messages={{ confirmed: texts.messages.confirmed ?? "", pending: texts.messages.pending ?? "" }}
                    />
                  </Card>
                ) : (
                  <Card tone="deep" className="p-7 sm:p-9" role="status">
                    <p className="text-lg font-medium">{stateText ?? "Le iscrizioni non sono disponibili."}</p>
                    {state !== "not_yet_open" && <div className="mt-5"><ButtonLink href={paths.events} variant="secondary">Scopri gli altri eventi</ButtonLink></div>}
                  </Card>
                )}
              </section>
            )}
          </div>
        </div>
      </Container>
    </article>
  );
}
