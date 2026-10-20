import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/JsonLd";
import { RegistrationForm } from "@/components/public/events/RegistrationForm";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import "@/components/public/liste/liste.css";
import { buildCta } from "@/lib/events/cta";
import { REGISTRATION_SCOPE } from "@/lib/events/constants";
import { ensureFormVersion } from "@/lib/events/forms";
import { eventDayBadge, formatEventTime, formatEventWhen, nowMs } from "@/lib/events/format";
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
    twitter: { card: "summary_large_image", title, description, images: image?.map((i) => i.url) },
  };
}

const weekday = new Intl.DateTimeFormat("it-IT", { weekday: "long", timeZone: "Europe/Rome" });
const MODE_BADGE = { open: "bd bd-green", limited: "bd bd-yellow", reserved: "bd bd-orange", approval: "bd" } as const;

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-dashed border-ink py-4 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="t-label">{label}</dt>
      <dd className="info-v mt-1.5">{children}</dd>
    </div>
  );
}

/** The big date ticket of the hero: weekday and month on a coloured stub, the day enormous. */
function BigTicket({ startsAt, tone, place }: { startsAt: number; tone: "green" | "yellow" | "orange" | "white"; place: string | null }) {
  const { day, month } = eventDayBadge(startsAt);
  return (
    <div aria-hidden="true" className="bt" data-tone={tone}>
      <div className="bt-top"><span>{weekday.format(startsAt)}</span><span>{month}</span></div>
      <div className="bt-day">{day}</div>
      <div className="bt-foot"><span>Ore {formatEventTime(startsAt)}</span>{place && <span>{place}</span>}</div>
      <i className="tk-n bt-n1" /><i className="tk-n bt-n2" />
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
  const tone = p.isPast ? "white" : state === "open" ? "green" : state === "full" ? "orange" : state === "not_applicable" ? "yellow" : "white";

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
      <Room tone="yellow" className="lh">
        <Wrap className="ev-hero">
          <div className="lh-text">
            <Link href={paths.events} className="pill pill-line !min-h-11 !px-5"><span aria-hidden="true">←</span> Tutti gli eventi</Link>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {p.categoryName && <span className="bd">{p.categoryName}</span>}
              {p.isPast && <span className="bd bd-line">Concluso</span>}
              {state === "open" && <span className="bd bd-green">Iscrizioni aperte</span>}
              {state === "full" && <span className="bd bd-orange">Posti esauriti</span>}
              {state === "closed" && !p.isPast && <span className="bd">Iscrizioni terminate</span>}
            </div>
            <Kinetic as="h1" text={e.title} className="lh-title lh-title-s" />
            {e.summary && <p className="lh-lead">{e.summary}</p>}
          </div>
          <div className="ev-ticket"><BigTicket startsAt={e.startsAt} tone={tone} place={e.location} /></div>
        </Wrap>
      </Room>

      <Room tone="white" className="lr-pad">
        <Wrap className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <div className="min-w-0 lg:order-1">
            {p.coverUrl && (
              <figure className="art-fig mb-10 aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route */}
                <img src={p.coverUrl} alt={p.coverAlt} className={p.isPast ? "saturate-[.7]" : undefined} />
              </figure>
            )}
            {body ? <div className="pub-prose prose-it" dangerouslySetInnerHTML={{ __html: body }} /> : <p className="t-lead">I dettagli arrivano a ridosso dell&apos;evento. Scrivici se vuoi saperne di più.</p>}
          </div>

          <aside className="lg:order-2" aria-label="Informazioni sull'evento">
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="cut cut-white !p-6 sm:!p-7">
                <dl>
                  <InfoRow label="Quando">{formatEventWhen(e.startsAt, e.endsAt)}</InfoRow>
                  {e.location && <InfoRow label="Dove">{e.location}</InfoRow>}
                  {audience && <InfoRow label="A chi è rivolto">{audience}</InfoRow>}
                  {mode && e.ctaType === "registration" && (
                    <InfoRow label="Modalità di partecipazione">
                      <span className={MODE_BADGE[mode]}>{MODE_COPY[mode].label}</span>
                      {mode === "reserved" && e.reservedCriteria && <span className="mt-2 block text-[0.97rem] font-normal">Riservata a: {e.reservedCriteria}</span>}
                      {mode === "limited" && p.remaining != null && !p.isPast && <span className="mt-2 block text-[0.97rem] font-bold" data-testid="remaining">Posti disponibili: {p.remaining}</span>}
                    </InfoRow>
                  )}
                </dl>

                {!p.isPast && cta.kind === "link" && (
                  <div className="mt-6">
                    {cta.href.startsWith("/") ? (
                      <Link href={cta.href} className="pill pill-solid">{cta.label} <span className="arrow" aria-hidden="true">→</span></Link>
                    ) : (
                      <a href={cta.href} className="pill pill-solid" {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {cta.label} <span className="arrow" aria-hidden="true">→</span>{cta.external && <span className="sr-only"> (si apre in una nuova scheda)</span>}
                      </a>
                    )}
                  </div>
                )}
                {cta.kind === "registration" && state === "open" && (
                  <div className="mt-6">
                    <a href="#iscrizione" className="pill pill-solid w-full">{modeCopy?.button ?? cta.label} <span className="arrow" aria-hidden="true">↓</span></a>
                  </div>
                )}
                {e.ctaType === "registration" && stateText && (
                  <p className="pf-note mt-6 bg-[var(--c-yellow)]" role="status">{stateText}</p>
                )}
                {e.ctaType !== "registration" && p.isPast && (
                  <p className="pf-note mt-6 bg-[var(--c-yellow)]">{texts.messages.past}</p>
                )}
              </div>
              {p.isPast && (
                <Link href={paths.events} className="pill pill-line w-full">Vedi i prossimi eventi</Link>
              )}
            </div>
          </aside>
        </Wrap>
      </Room>

      {e.ctaType === "registration" && (
        <Room tone="orange" id="iscrizione" aria-labelledby="iscrizione-titolo" className="lr-pad scroll-mt-24">
          <Wrap className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <p className="lh-kicker t-label">Partecipa</p>
              <h2 id="iscrizione-titolo" className="lr-title mt-5">Iscrizione</h2>
              <p className="lr-text mt-5 font-bold">{e.title}</p>
              <p className="lr-text mt-1">{formatEventWhen(e.startsAt, e.endsAt)}</p>
              {e.location && <p className="lr-text">{e.location}</p>}
            </div>
            <div>
              {showForm && version && modeCopy && mode ? (
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
              ) : (
                <div className="cut cut-white" role="status">
                  <p className="text-lg font-bold">{stateText ?? "Le iscrizioni non sono disponibili."}</p>
                  {state !== "not_yet_open" && <div className="mt-5"><Link href={paths.events} className="pill pill-solid">Scopri gli altri eventi</Link></div>}
                </div>
              )}
            </div>
          </Wrap>
        </Room>
      )}
    </article>
  );
}
