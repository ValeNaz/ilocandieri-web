import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { PageHeader } from "@/components/admin";
import { Icon, type IconName } from "@/components/admin/icons";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats, getIntegrations, getRecentActivity, type ActivityItem } from "@/lib/dashboard/stats";
import { adminPaths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const dayFmt = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Rome" });
const timeFmt = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
const rel = new Intl.RelativeTimeFormat("it-IT", { numeric: "auto" });

/** "5 minuti fa", "ieri", "3 giorni fa"; older than a week: the date. */
function ago(ms: number, now: number) {
  const s = Math.round((ms - now) / 1000);
  if (s > -60) return "adesso";
  if (s > -3600) return rel.format(Math.round(s / 60), "minute");
  if (s > -86400) return rel.format(Math.round(s / 3600), "hour");
  if (s > -7 * 86400) return rel.format(Math.round(s / 86400), "day");
  return formatDate(ms);
}

function greeting(now: number) {
  const h = Number(new Intl.DateTimeFormat("it-IT", { hour: "numeric", hour12: false, timeZone: "Europe/Rome" }).format(now));
  return h < 13 ? "Buongiorno" : h < 18 ? "Buon pomeriggio" : "Buonasera";
}

function Tile({ href, value, label, hint, icon, hot }: { href: string; value: number; label: string; hint: string; icon: IconName; hot?: boolean }) {
  return (
    <Link href={href} className="adm-tile group" data-hot={hot && value > 0 ? "" : undefined}>
      <div className="flex items-start justify-between gap-3">
        <span className="adm-tile-ic"><Icon name={icon} /></span>
        <Icon name="arrow" className="size-4 text-ink-soft opacity-0 transition-[opacity,translate] group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <span className="adm-num mt-5">{value}</span>
      <span className="mt-1.5 font-semibold leading-snug">{label}</span>
      <span className="mt-0.5 text-sm text-ink-soft">{hint}</span>
    </Link>
  );
}

const KIND: Record<ActivityItem["kind"], { icon: IconName; label: string; href: (id: string) => string }> = {
  registration: { icon: "ticket", label: "Iscrizione a", href: adminPaths.registration },
  application: { icon: "briefcase", label: "Candidatura:", href: adminPaths.application },
  message: { icon: "inbox", label: "Messaggio:", href: adminPaths.message },
};

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: adminPaths.eventNew, label: "Nuovo evento", icon: "calendar" },
  { href: "/admin/news/nuova", label: "Scrivi una news", icon: "news" },
  { href: adminPaths.home, label: "Modifica la home", icon: "home" },
  { href: adminPaths.media, label: "Carica immagini", icon: "media" },
];

const clock = () => Date.now();

export default async function DashboardPage() {
  const user = await requireAdmin();
  const now = clock();
  const [s, integrations, activity] = await Promise.all([getDashboardStats(), getIntegrations(), getRecentActivity()]);
  const first = (user.name || "").split(" ")[0];
  const waiting = s.pendingRegistrations + s.newApplications + s.newMessages + s.emailProblems;
  const configured = integrations.filter((i) => i.configured).length;

  return (
    <>
      <p className="mb-1 text-sm font-medium capitalize text-ink-soft">{dayFmt.format(now)}</p>
      <PageHeader
        title={`${greeting(now)}${first ? `, ${first}` : ""}`}
        description={waiting ? <>Ci sono <strong className="font-semibold text-ink">{waiting} {waiting === 1 ? "cosa" : "cose"} da guardare</strong>: le trovi evidenziate qui sotto.</> : "Tutto in ordine: nessuna richiesta in attesa."}
        actions={
          <>
            <ButtonLink href={adminPaths.eventNew} size="sm"><Icon name="plus" className="size-4" />Nuovo evento</ButtonLink>
            <ButtonLink href="/admin/news/nuova" size="sm" variant="secondary"><Icon name="plus" className="size-4" />Nuova news</ButtonLink>
          </>
        }
      />

      <section aria-labelledby="da-fare" className="mb-10">
        <h2 id="da-fare" className="sr-only">Da guardare</h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li><Tile href={adminPaths.registrations} value={s.pendingRegistrations} label="Iscrizioni in attesa" hint="Da approvare o rifiutare" icon="ticket" hot /></li>
          <li><Tile href={adminPaths.applications} value={s.newApplications} label="Candidature nuove" hint="Non ancora aperte" icon="briefcase" hot /></li>
          <li><Tile href={adminPaths.messages} value={s.newMessages} label="Messaggi da leggere" hint="Dal modulo contatti" icon="inbox" hot /></li>
          <li><Tile href={adminPaths.emailOutbox} value={s.emailProblems} label="Email non partite" hint={s.emailProblems ? `${s.emailFailed} non riuscite, ${s.emailNotConfigured} senza SMTP` : "Tutto regolare"} icon="mail" hot /></li>
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <section aria-labelledby="prossimi" className="rounded-card border border-line bg-card">
            <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5">
              <h2 id="prossimi" className="font-display text-lg font-semibold">Prossimi eventi</h2>
              <Link href={adminPaths.events} className="text-sm font-medium text-terracotta-deep hover:underline">Tutti gli eventi</Link>
            </div>
            {s.topEvents.length === 0 ? (
              <div className="flex flex-col items-start gap-3 px-5 pb-6 pt-1">
                <p className="text-ink-soft">Nessun evento futuro pubblicato.</p>
                <ButtonLink href={adminPaths.eventNew} size="sm" variant="secondary"><Icon name="plus" className="size-4" />Crea un evento</ButtonLink>
              </div>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {s.topEvents.map((e) => {
                  const pct = e.capacity ? Math.min(100, Math.round((e.confirmed / e.capacity) * 100)) : 0;
                  const d = new Date(e.startsAt);
                  return (
                    <li key={e.id}>
                      <Link href={adminPaths.event(e.id)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper">
                        <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-brand-yellow/25 py-1.5 text-center leading-none">
                          <span className="font-display text-xl font-semibold">{new Intl.DateTimeFormat("it-IT", { day: "numeric", timeZone: "Europe/Rome" }).format(d)}</span>
                          <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">{new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: "Europe/Rome" }).format(d)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{e.title}</span>
                          <span className="block text-sm text-ink-soft">
                            ore {timeFmt.format(d)} · <strong className="font-semibold text-ink tabular-nums">{e.confirmed}</strong>{e.capacity ? <> su {e.capacity} posti</> : " iscritti"}
                          </span>
                          {e.capacity ? (
                            <span role="progressbar" aria-label={`Posti occupati: ${e.title}`} aria-valuemin={0} aria-valuemax={e.capacity} aria-valuenow={e.confirmed} className="adm-meter mt-2 block max-w-xs">
                              <span style={{ width: `${pct}%` }} />
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="arrivi" className="rounded-card border border-line bg-card">
            <div className="px-5 pb-3 pt-5">
              <h2 id="arrivi" className="font-display text-lg font-semibold">Ultime arrivate</h2>
              <p className="text-sm text-ink-soft">Iscrizioni, candidature e messaggi, dal più recente.</p>
            </div>
            {activity.length === 0 ? (
              <p className="border-t border-line px-5 py-6 text-ink-soft">Ancora niente: appena qualcuno scrive o si iscrive dal sito, lo vedi qui.</p>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {activity.map((a) => {
                  const k = KIND[a.kind];
                  return (
                    <li key={`${a.kind}-${a.id}`}>
                      <Link href={k.href(a.id)} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-paper">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper-deep text-ink-soft"><Icon name={k.icon} className="size-[1.1rem]" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold">{a.who}</span>
                            {a.fresh && <span className="size-2 shrink-0 rounded-full bg-brand-orange" title="Da guardare"><span className="sr-only">(da guardare)</span></span>}
                          </span>
                          <span className="block truncate text-sm text-ink-soft">{k.label} {a.what}</span>
                        </span>
                        <span className="shrink-0 text-xs text-ink-soft">{ago(a.at, now)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="veloci" className="rounded-card border border-line bg-card p-5">
            <h2 id="veloci" className="font-display text-lg font-semibold">Scorciatoie</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2.5">
              {QUICK.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="flex h-full flex-col gap-2.5 rounded-xl border border-line p-3.5 text-[0.92rem] font-semibold transition-colors hover:border-transparent hover:bg-terracotta-soft hover:text-terracotta-deep">
                    <Icon name={q.icon} className="size-5" />{q.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-soft">Per tutto il resto: <kbd className="adm-kbd">⌘ K</kbd> o <kbd className="adm-kbd">Ctrl K</kbd>, scrivi cosa cerchi.</p>
          </section>

          <section aria-labelledby="sito" className="grid grid-cols-2 gap-4">
            <h2 id="sito" className="sr-only">Sul sito adesso</h2>
            <Tile href={adminPaths.events} value={s.upcomingEvents} label="Eventi in arrivo" hint="Pubblicati" icon="calendar" />
            <Tile href={adminPaths.news} value={s.publishedNews} label="News online" hint="Pubblicate" icon="news" />
          </section>

          <section aria-labelledby="integrazioni" className="rounded-card border border-line bg-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="integrazioni" className="font-display text-lg font-semibold">Collegamenti</h2>
              <span className="text-sm font-medium text-ink-soft tabular-nums">{configured} di {integrations.length} attivi</span>
            </div>
            <span className="adm-meter mt-3 block" aria-hidden="true"><span style={{ width: `${(configured / integrations.length) * 100}%` }} /></span>
            <ul className="mt-4 space-y-3.5">
              {integrations.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <span className={i.configured ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-green text-white" : "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-dashed border-line-strong/70"}>
                    {i.configured && <Icon name="check" className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.93rem] font-semibold">{i.label}<span className="sr-only">: {i.configured ? "configurato" : "da configurare"}</span></span>
                    <span className="block text-sm text-ink-soft">{i.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            {configured < integrations.length && <Link href={adminPaths.settings} className="mt-4 inline-block text-sm font-medium text-terracotta-deep hover:underline">Vai alle impostazioni</Link>}
          </section>
        </div>
      </div>
    </>
  );
}
