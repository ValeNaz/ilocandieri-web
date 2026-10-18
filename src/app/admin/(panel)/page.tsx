import Link from "next/link";
import { ButtonLink, Card, Badge } from "@/components/ui";
import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats, getIntegrations } from "@/lib/dashboard/stats";
import { adminPaths } from "@/lib/paths";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function StatCard({ href, value, label, hint, attention }: { href: string; value: number; label: string; hint: string; attention?: boolean }) {
  return (
    <Link href={href} className="group block h-full rounded-card focus-visible:outline-offset-4">
      <Card interactive className={cn("flex h-full flex-col p-6", attention && value > 0 && "border-terracotta/40 bg-terracotta-soft/50")}>
        <span className="font-display text-5xl font-medium leading-none tabular-nums">{value}</span>
        <span className="mt-3 text-lg font-semibold leading-snug">{label}</span>
        <span className="mt-1 text-sm text-ink-soft">{hint}</span>
        <span className="mt-auto pt-4 text-sm font-medium text-terracotta-deep">Apri <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireAdmin();
  const [s, integrations] = await Promise.all([getDashboardStats(), getIntegrations()]);
  const first = (user.name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Ciao${first ? `, ${first}` : ""}`}
        description="Ecco cosa succede sul sito. Le caselle evidenziate hanno qualcosa da guardare."
        actions={
          <>
            <ButtonLink href={adminPaths.events}>Nuovo evento</ButtonLink>
            <ButtonLink href={adminPaths.news} variant="secondary">Nuova news</ButtonLink>
          </>
        }
      />

      <section aria-labelledby="da-fare" className="mb-12">
        <h2 id="da-fare" className="mb-4 font-display text-2xl font-medium">Da guardare</h2>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <li><StatCard href={adminPaths.registrations} value={s.pendingRegistrations} label="Richieste di iscrizione in attesa" hint="Da approvare o rifiutare" attention /></li>
          <li><StatCard href={adminPaths.applications} value={s.newApplications} label="Candidature nuove" hint="Non ancora aperte" attention /></li>
          <li><StatCard href={adminPaths.messages} value={s.newMessages} label="Messaggi dai contatti" hint="Da leggere" attention /></li>
          <li><StatCard href={adminPaths.emailOutbox} value={s.emailProblems} label="Email non partite" hint={s.emailProblems ? `${s.emailFailed} non riuscite, ${s.emailNotConfigured} con email non configurata` : "Tutto regolare"} attention /></li>
        </ul>
      </section>

      <section aria-labelledby="sito" className="mb-12">
        <h2 id="sito" className="mb-4 font-display text-2xl font-medium">Sul sito adesso</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          <li><StatCard href={adminPaths.events} value={s.upcomingEvents} label="Eventi futuri pubblicati" hint="Visibili nel sito" /></li>
          <li><StatCard href={adminPaths.news} value={s.publishedNews} label="News pubblicate" hint="Visibili nel sito" /></li>
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="iscritti">
          <h2 id="iscritti" className="mb-4 font-display text-2xl font-medium">Iscritti per evento</h2>
          <Card className="p-2">
            {s.topEvents.length === 0 ? (
              <p className="px-4 py-6 text-ink-soft">Nessun evento futuro pubblicato. <Link href={adminPaths.events} className="font-medium text-terracotta-deep underline">Crea un evento</Link></p>
            ) : (
              <ul className="divide-y divide-line">
                {s.topEvents.map((e) => {
                  const pct = e.capacity ? Math.min(100, Math.round((e.confirmed / e.capacity) * 100)) : 0;
                  return (
                    <li key={e.id} className="px-4 py-4">
                      <Link href={`${adminPaths.events}/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                      <p className="text-sm text-ink-soft">{formatDate(e.startsAt)}</p>
                      <p className="mt-2 text-sm">
                        <strong className="tabular-nums">{e.confirmed}</strong> {e.capacity ? <>confermati su <strong className="tabular-nums">{e.capacity}</strong> posti</> : "posti confermati (capienza non limitata)"}
                      </p>
                      {e.capacity ? (
                        <div role="progressbar" aria-label={`Posti occupati: ${e.title}`} aria-valuemin={0} aria-valuemax={e.capacity} aria-valuenow={e.confirmed} className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep">
                          <div className="h-full rounded-full bg-olive" style={{ width: `${pct}%` }} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="integrazioni">
          <h2 id="integrazioni" className="mb-4 font-display text-2xl font-medium">Collegamenti</h2>
          <Card className="p-2">
            <ul className="divide-y divide-line">
              {integrations.map((i) => (
                <li key={i.key} className="flex items-start justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="font-medium">{i.label}</p>
                    <p className="text-sm text-ink-soft">{i.detail}</p>
                  </div>
                  <Badge tone={i.configured ? "success" : "warning"} className="shrink-0">{i.configured ? "Configurato" : "Da configurare"}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </>
  );
}
