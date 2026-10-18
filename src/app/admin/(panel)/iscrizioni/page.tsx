import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { Button, ButtonLink, Card, ConfirmDialog, Input, Select } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { REGISTRATION_STATUSES, listRegistrations, registrationTotals } from "@/lib/events/admin";
import { adminPaths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { approveRegistrationAction, cancelRegistrationAction, rejectRegistrationAction } from "./actions";

export const metadata = { title: "Iscrizioni" };
const PAGE = 50;

type SP = { evento?: string; stato?: string; q?: string; pagina?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const eventId = sp.evento && /^[a-z0-9]{10,40}$/.test(sp.evento) ? sp.evento : null;
  const status = (REGISTRATION_STATUSES as readonly string[]).includes(sp.stato ?? "") ? (sp.stato as (typeof REGISTRATION_STATUSES)[number]) : null;
  const q = (sp.q ?? "").trim().slice(0, 100) || null;
  const pageNo = Math.max(1, Number.parseInt(sp.pagina ?? "1", 10) || 1);

  const [events, list, totals] = await Promise.all([
    db.select({ id: schema.events.id, title: schema.events.title, startsAt: schema.events.startsAt }).from(schema.events).where(eq(schema.events.ctaType, "registration")).orderBy(desc(schema.events.startsAt)),
    listRegistrations({ eventId, status, q, limit: PAGE, offset: (pageNo - 1) * PAGE }),
    registrationTotals(eventId),
  ]);
  const [ev] = eventId ? await db.select().from(schema.events).where(eq(schema.events.id, eventId)) : [];
  const qs = (over: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string | null> = { evento: eventId, stato: status, q, pagina: null, ...over };
    for (const [k, v] of Object.entries(cur)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const back = `${adminPaths.registrations}${qs({ pagina: pageNo > 1 ? String(pageNo) : null })}`;
  const filtered = !!(eventId || status || q);
  const pages = Math.max(1, Math.ceil(list.total / PAGE));

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Iscrizioni"
        description="Le richieste di partecipazione agli eventi. Le richieste «in attesa» non sono confermate finché non le approvi."
        actions={<ButtonLink external href={`${adminPaths.registrationsExport}${qs({ pagina: null })}`} variant="secondary">Scarica CSV{filtered ? " (filtrato)" : ""}</ButtonLink>}
      />

      <section aria-label="Riepilogo" className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([["pending", "In attesa"], ["confirmed", "Confermate"], ["rejected", "Rifiutate"], ["cancelled", "Annullate"]] as const).map(([k, label]) => (
          <Card key={k} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
            <p className="font-display text-3xl">{totals[k].n}</p>
            <p className="text-sm text-ink-soft">{totals[k].seats} {totals[k].seats === 1 ? "posto" : "posti"}</p>
          </Card>
        ))}
      </section>
      {ev && (
        <p className="mb-6 rounded-control border border-line bg-card px-4 py-3 text-[0.97rem]">
          <strong>{ev.title}</strong>: {ev.seatsConfirmed} posti confermati{ev.capacity != null ? <> su {ev.capacity}</> : " (nessun limite)"}
          {ev.seatsHeld > 0 && <>, {ev.seatsHeld} riservati a richieste in attesa</>}
          {ev.capacity != null && <> — <strong>{Math.max(0, ev.capacity - ev.seatsConfirmed - ev.seatsHeld)} disponibili</strong></>}.{" "}
          <Link href={adminPaths.event(ev.id)} className="font-medium text-terracotta-deep underline">Modifica l&apos;evento</Link>
        </p>
      )}

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4 shadow-card" role="search" aria-label="Filtra le iscrizioni">
        <div className="min-w-[14rem] flex-1">
          <Select name="evento" label="Evento" defaultValue={eventId ?? ""}>
            <option value="">Tutti gli eventi</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </Select>
        </div>
        <div className="w-44">
          <Select name="stato" label="Stato" defaultValue={status ?? ""}>
            <option value="">Tutti</option><option value="pending">In attesa</option><option value="confirmed">Confermate</option><option value="rejected">Rifiutate</option><option value="cancelled">Annullate</option>
          </Select>
        </div>
        <div className="min-w-[12rem] flex-1"><Input name="q" label="Cerca nome o email" defaultValue={q ?? ""} /></div>
        <Button type="submit" variant="secondary">Filtra</Button>
        {filtered && <Link href={adminPaths.registrations} className="pb-3 text-sm underline">Azzera filtri</Link>}
      </form>

      <DataTable
        caption="Elenco delle iscrizioni"
        rows={list.rows}
        rowKey={(r) => r.registration.id}
        empty={filtered
          ? { title: "Nessuna iscrizione con questi filtri", action: <ButtonLink href={adminPaths.registrations} variant="secondary">Azzera filtri</ButtonLink> }
          : { title: "Nessuna iscrizione ricevuta", description: "Quando qualcuno si iscrive a un evento con iscrizione online, lo vedrai qui.", action: <ButtonLink href={adminPaths.events} variant="secondary">Vai agli eventi</ButtonLink> }}
        columns={[
          { header: "Iscritto", cell: (r) => (
            <div className="min-w-[13rem]">
              <Link href={adminPaths.registration(r.registration.id)} className="font-semibold hover:underline">{r.registration.name}</Link>
              <p className="text-sm text-ink-soft">{r.registration.email}</p>
            </div>) },
          { header: "Evento", cell: (r) => <Link href={`${adminPaths.registrations}?evento=${r.registration.eventId}`} className="hover:underline">{r.eventTitle}</Link> },
          { header: "Posti", cell: (r) => r.registration.seats },
          { header: "Stato", cell: (r) => <StatusBadge status={r.registration.status} /> },
          { header: "Ricevuta", cell: (r) => <span className="whitespace-nowrap text-sm">{formatDateTime(r.registration.createdAt)}</span> },
          { header: "Azioni", align: "right", cell: (r) => {
            const s = r.registration.status;
            const f = { id: r.registration.id, back };
            return (
              <div className="flex flex-wrap justify-end gap-2">
                <ButtonLink href={adminPaths.registration(r.registration.id)} size="sm" variant="ghost">Dettaglio<span className="sr-only"> di {r.registration.name}</span></ButtonLink>
                {s === "pending" && <ConfirmDialog triggerLabel="Approva" triggerVariant="olive" destructive={false} confirmLabel="Approva" title={`Approvare la richiesta di ${r.registration.name}?`} description={`Verrà confermata la partecipazione (${r.registration.seats} ${r.registration.seats === 1 ? "posto" : "posti"}) e l'iscritto riceverà una email. Se la capienza è superata l'approvazione viene rifiutata.`} action={approveRegistrationAction} fields={f} />}
                {s === "pending" && <ConfirmDialog triggerLabel="Rifiuta" title={`Rifiutare la richiesta di ${r.registration.name}?`} description="L'iscritto riceverà una email con l'esito." confirmLabel="Rifiuta" action={rejectRegistrationAction} fields={f} />}
                {(s === "pending" || s === "confirmed") && <ConfirmDialog triggerLabel="Annulla" title={`Annullare l'iscrizione di ${r.registration.name}?`} description="I posti tornano disponibili e l'iscritto riceve una email di annullamento." confirmLabel="Annulla iscrizione" cancelLabel="Indietro" action={cancelRegistrationAction} fields={f} />}
              </div>
            );
          } },
        ]}
      />
      {pages > 1 && (
        <nav aria-label="Pagine" className="mt-6 flex items-center justify-between text-sm">
          {pageNo > 1 ? <Link className="underline" href={`${adminPaths.registrations}${qs({ pagina: String(pageNo - 1) })}`}>← Precedenti</Link> : <span />}
          <span>Pagina {pageNo} di {pages} · {list.total} iscrizioni</span>
          {pageNo < pages ? <Link className="underline" href={`${adminPaths.registrations}${qs({ pagina: String(pageNo + 1) })}`}>Successive →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
