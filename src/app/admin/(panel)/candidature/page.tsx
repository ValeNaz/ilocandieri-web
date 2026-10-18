import Link from "next/link";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { Button, ButtonLink, Card, ConfirmDialog, Input, Select } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { APPLICATION_AREAS } from "@/lib/careers/constants";
import { applicationCounts, countApplicationsOlderThan, countPastRegistrationsOlderThan, isRetentionSet, listApplications } from "@/lib/careers/admin";
import { adminPaths } from "@/lib/paths";
import { getSetting } from "@/lib/settings";
import { cn, formatDate } from "@/lib/utils";
import { purgeOldApplicationsAction, saveRetentionAction } from "./actions";

export const metadata = { title: "Candidature" };

const STATUS_TABS = [
  { value: "", label: "Tutte" },
  { value: "new", label: "Nuove" },
  { value: "reviewing", label: "In esame" },
  { value: "archived", label: "Archiviate" },
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ stato?: string; ambito?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filters = { status: sp.stato, area: sp.ambito, q: sp.q };
  const [rows, counts, retention] = await Promise.all([listApplications(filters), applicationCounts(), getSetting("retention")]);
  const purge = isRetentionSet(retention.applicationsDays)
    ? { days: retention.applicationsDays, count: await countApplicationsOlderThan(retention.applicationsDays) }
    : { days: null, count: 0 };
  const pastRegs = retention.pastRegistrationsDays > 0 ? await countPastRegistrationsOlderThan(retention.pastRegistrationsDays) : 0;
  const href = (stato: string) => {
    const p = new URLSearchParams();
    if (stato) p.set("stato", stato);
    if (sp.ambito) p.set("ambito", sp.ambito);
    if (sp.q) p.set("q", sp.q);
    const s = p.toString();
    return s ? `${adminPaths.applications}?${s}` : adminPaths.applications;
  };
  const filtering = Boolean(sp.stato || sp.ambito || sp.q);

  return (
    <>
      <PageHeader
        title="Candidature"
        description="Le candidature arrivate dal modulo «Lavora con noi». I CV sono visibili solo a chi accede al pannello."
        actions={<ButtonLink href={adminPaths.openings} variant="secondary">Posizioni aperte</ButtonLink>}
      />

      <nav aria-label="Filtra per stato" className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => {
          const active = (sp.stato ?? "") === t.value;
          const n = t.value === "" ? counts.total : counts[t.value];
          return (
            <Link key={t.value} href={href(t.value)} aria-current={active ? "page" : undefined}
              className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-terracotta bg-terracotta-soft text-terracotta-deep" : "border-line-strong bg-card hover:bg-paper-deep")}>
              {t.label}
              <span className="rounded-full bg-paper-deep px-2 text-xs text-ink-soft">{n}</span>
            </Link>
          );
        })}
      </nav>

      <form method="get" className="mb-6 grid gap-4 rounded-card border border-line bg-card p-4 shadow-card sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
        {sp.stato && <input type="hidden" name="stato" value={sp.stato} />}
        <Input name="q" label="Cerca" type="search" defaultValue={sp.q ?? ""} placeholder="Nome, email o testo del messaggio" />
        <Select name="ambito" label="Ambito" defaultValue={sp.ambito ?? ""}>
          <option value="">Tutti gli ambiti</option>
          {APPLICATION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <div className="flex gap-2">
          <Button type="submit">Filtra</Button>
          {filtering && <ButtonLink href={adminPaths.applications} variant="ghost">Azzera</ButtonLink>}
        </div>
      </form>

      <DataTable
        caption="Elenco delle candidature"
        rows={rows}
        rowKey={(r) => r.id}
        empty={
          filtering
            ? { title: "Nessuna candidatura corrisponde ai filtri", description: "Prova a cambiare o azzerare i filtri.", action: <ButtonLink href={adminPaths.applications} variant="secondary">Azzera i filtri</ButtonLink> }
            : { title: "Ancora nessuna candidatura", description: "Quando qualcuno compilerà il modulo nella pagina «Lavora con noi», la troverai qui." }
        }
        columns={[
          { header: "Candidato", cell: (r) => <Link href={adminPaths.application(r.id)} className="font-medium text-terracotta-deep underline">{r.firstName} {r.lastName}<span className="block text-sm font-normal text-ink-soft no-underline">{r.email}</span></Link> },
          { header: "Ambito", cell: (r) => r.area },
          { header: "CV", cell: (r) => (r.cvPath ? "Sì" : <span className="text-ink-soft">No</span>) },
          { header: "Ricevuta il", cell: (r) => formatDate(r.createdAt) },
          { header: "Stato", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      <section aria-labelledby="conservazione" className="mt-12">
        <Card className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 id="conservazione" className="font-display text-2xl font-medium">Conservazione dei dati</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">
              Le candidature contengono dati personali: conservale solo per il tempo necessario. Indica dopo quanti giorni vanno eliminate (0 = nessun limite impostato).
              L&rsquo;eliminazione automatica avviene solo se il server esegue lo script di pulizia (vedi <code className="rounded bg-paper-deep px-1.5 py-0.5 text-sm">docs/CAREERS.md</code>).
            </p>
          </div>
          <form action={saveRetentionAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Input name="applicationsDays" type="number" min={0} max={3650} label="Giorni di conservazione delle candidature" defaultValue={retention.applicationsDays} />
            <Input name="pastRegistrationsDays" type="number" min={0} max={3650} label="Giorni di conservazione delle iscrizioni a eventi già conclusi" defaultValue={retention.pastRegistrationsDays} />
            <Button type="submit">Salva</Button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-control border border-line bg-paper px-5 py-4">
            {purge.days === null ? (
              <p className="text-ink-soft">Nessun limite impostato: nessuna candidatura verrà eliminata.</p>
            ) : (
              <>
                <p>
                  <strong>{purge.count}</strong> {purge.count === 1 ? "candidatura è più vecchia" : "candidature sono più vecchie"} di {purge.days} giorni.
                </p>
                {purge.count > 0 && (
                  <ConfirmDialog
                    triggerLabel={`Elimina candidature più vecchie di ${purge.days} giorni`}
                    triggerVariant="danger"
                    title={`Eliminare ${purge.count} ${purge.count === 1 ? "candidatura" : "candidature"}?`}
                    description="Verranno cancellati i dati e i CV. L'operazione non si può annullare."
                    confirmLabel="Elimina definitivamente"
                    action={purgeOldApplicationsAction}
                  />
                )}
              </>
            )}
          </div>
          {retention.pastRegistrationsDays > 0 && (
            <p className="text-sm text-ink-soft">
              Iscrizioni a eventi conclusi da più di {retention.pastRegistrationsDays} giorni: <strong>{pastRegs}</strong>. Vengono eliminate dallo script di pulizia programmato, non da questa pagina.
            </p>
          )}
        </Card>
      </section>
    </>
  );
}
