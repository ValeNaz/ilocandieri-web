import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { PageHeader, StatusBadge } from "@/components/admin";
import { EventForm } from "@/components/admin/events/EventForm";
import { Badge, Button, ButtonLink, Card, ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaOptions } from "@/lib/content/media";
import { db, schema } from "@/lib/db";
import { getAdminEvent, listRegistrations, registrationTotals, type AdminRegistrationRow } from "@/lib/events/admin";
import { DEFAULT_FIELDS, getLatestFormVersion } from "@/lib/events/forms";
import { nowMs } from "@/lib/events/format";
import { toFormInitial } from "@/lib/events/form-initial";
import { DEFAULT_MESSAGES } from "@/lib/events/messages";
import { listCategories } from "@/lib/events/service";
import { getRegistrationState } from "@/lib/events/state";
import { adminPaths, paths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { approveRegistrationAction, cancelRegistrationAction, rejectRegistrationAction } from "../../iscrizioni/actions";
import { count } from "drizzle-orm";
import { deleteEventAction, duplicateEventAction, recountAction, setRegistrationsClosedAction } from "../actions";

export const metadata = { title: "Modifica evento" };

const STATE_LABEL = { not_applicable: "Nessuna iscrizione online", not_yet_open: "Iscrizioni non ancora aperte", open: "Iscrizioni aperte", closed: "Iscrizioni chiuse", full: "Posti esauriti", past: "Evento concluso" } as const;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event) notFound();
  const [media, categories, version, totals, regs] = await Promise.all([listMediaOptions(), listCategories(), getLatestFormVersion(id), registrationTotals(id), listRegistrations({ eventId: id, limit: 1000 })]);
  const [{ n: pendingCount }] = await db.select({ n: count() }).from(schema.registrations).where(and(eq(schema.registrations.eventId, id), eq(schema.registrations.status, "pending")));
  const state = getRegistrationState(event, nowMs());
  const registrationsCount = totals.pending.n + totals.confirmed.n + totals.rejected.n + totals.cancelled.n;
  const isReg = event.ctaType === "registration";

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={event.title}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={event.status} /><Badge>{STATE_LABEL[state]}</Badge></span>}
        actions={
          <>
            {event.status === "published" && <ButtonLink href={paths.event(event.slug)} variant="secondary">Vedi sul sito</ButtonLink>}
            {isReg && <ButtonLink href="#partecipanti" variant="secondary">Partecipanti ({registrationsCount})</ButtonLink>}
            <form action={duplicateEventAction}><input type="hidden" name="id" value={event.id} /><Button type="submit" variant="secondary">Duplica</Button></form>
            <ConfirmDialog triggerLabel="Elimina" triggerVariant="danger" title={`Eliminare «${event.title}»?`} confirmLabel="Elimina evento"
              description={registrationsCount > 0 ? `Ci sono ${registrationsCount} iscrizioni collegate. Se ce ne sono di attive (in attesa o confermate) l'eliminazione viene bloccata: in quel caso nascondi l'evento.` : "L'evento sparisce per sempre. Se vuoi solo toglierlo dal sito, impostalo su «Nascosto»."}
              action={deleteEventAction} fields={{ id: event.id }} />
          </>
        }
      />

      {isReg && (
        <Card className="mb-8 p-6" aria-label="Situazione posti">
          <h2 className="font-display text-xl font-medium">Situazione iscrizioni</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Posti confermati</dt><dd className="font-display text-3xl">{event.seatsConfirmed}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Richieste in attesa</dt><dd className="font-display text-3xl">{totals.pending.n}<span className="ml-1 text-base text-ink-soft">({totals.pending.seats} posti)</span></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Riservati in attesa</dt><dd className="font-display text-3xl">{event.seatsHeld}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Capienza</dt><dd className="font-display text-3xl">{event.capacity ?? "—"}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <form action={setRegistrationsClosedAction}>
              <input type="hidden" name="id" value={event.id} /><input type="hidden" name="back" value="edit" /><input type="hidden" name="closed" value={event.registrationManuallyClosed ? "0" : "1"} />
              <Button type="submit" variant="secondary">{event.registrationManuallyClosed ? "Riapri le iscrizioni" : "Chiudi le iscrizioni"}</Button>
            </form>
            <form action={recountAction}><input type="hidden" name="id" value={event.id} /><Button type="submit" variant="ghost">Riallinea i contatori</Button></form>
            <Link href="#partecipanti" className="inline-flex min-h-11 items-center text-sm font-medium text-terracotta-deep underline">Vai ai partecipanti</Link>
          </div>
        </Card>
      )}

      {(isReg || regs.total > 0) && <Participants eventId={event.id} rows={regs.rows} total={regs.total} />}

      <EventForm
        initial={toFormInitial(event)}
        meta={{
          fields: version?.fields ?? DEFAULT_FIELDS,
          formVersion: version?.version ?? null,
          registrationsCount,
          pendingCount,
          categories,
          media,
          defaults: { ...DEFAULT_MESSAGES },
        }}
      />
    </div>
  );
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/** Who signed up for THIS event, grouped by status: confirmed and waiting in view, rejected/cancelled folded away. */
function Participants({ eventId, rows, total }: { eventId: string; rows: AdminRegistrationRow[]; total: number }) {
  const back = `${adminPaths.event(eventId)}#partecipanti`;
  const by = (st: string) => rows.filter((r) => r.registration.status === st);
  const confirmed = by("confirmed"), pending = by("pending"), other = [...by("rejected"), ...by("cancelled")];
  const seats = (list: AdminRegistrationRow[]) => list.reduce((n, r) => n + r.registration.seats, 0);

  const row = (r: AdminRegistrationRow) => {
    const g = r.registration;
    const f = { id: g.id, back };
    return (
      <li key={g.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-deep text-xs font-bold text-ink-soft">{initials(g.name)}</span>
        <div className="min-w-[12rem] flex-1">
          <Link href={adminPaths.registration(g.id)} className="font-semibold hover:underline">{g.name}</Link>
          <p className="text-sm text-ink-soft">
            <a href={`mailto:${g.email}`} className="hover:underline">{g.email}</a>
            {g.phone && <> · <a href={`tel:${g.phone.replace(/\s/g, "")}`} className="whitespace-nowrap hover:underline">{g.phone}</a></>}
          </p>
        </div>
        <span className="w-20 text-sm tabular-nums"><strong>{g.seats}</strong> {g.seats === 1 ? "posto" : "posti"}</span>
        <span className="hidden w-44 text-sm text-ink-soft md:block">{formatDateTime(g.createdAt)}</span>
        <StatusBadge status={g.status} />
        <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
          {g.status === "pending" && <ConfirmDialog triggerLabel="Approva" triggerVariant="olive" destructive={false} confirmLabel="Approva" title={`Approvare la richiesta di ${g.name}?`} description={`Verrà confermata la partecipazione (${g.seats} ${g.seats === 1 ? "posto" : "posti"}) e l'iscritto riceverà una email. Se la capienza è superata l'approvazione viene rifiutata.`} action={approveRegistrationAction} fields={f} />}
          {g.status === "pending" && <ConfirmDialog triggerLabel="Rifiuta" title={`Rifiutare la richiesta di ${g.name}?`} description="L'iscritto riceverà una email con l'esito." confirmLabel="Rifiuta" action={rejectRegistrationAction} fields={f} />}
          {g.status === "confirmed" && <ConfirmDialog triggerLabel="Annulla" title={`Annullare l'iscrizione di ${g.name}?`} description="I posti tornano disponibili e l'iscritto riceve una email di annullamento." confirmLabel="Annulla iscrizione" cancelLabel="Indietro" action={cancelRegistrationAction} fields={f} />}
        </div>
      </li>
    );
  };

  const group = (title: string, list: AdminRegistrationRow[], empty: string) => (
    <div>
      <h3 className="flex items-baseline gap-2 border-y border-line bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {title} <span className="font-normal normal-case tracking-normal">· {list.length} {list.length === 1 ? "persona" : "persone"}, {seats(list)} {seats(list) === 1 ? "posto" : "posti"}</span>
      </h3>
      {list.length ? <ul className="divide-y divide-line">{list.map(row)}</ul> : <p className="px-5 py-4 text-sm text-ink-soft">{empty}</p>}
    </div>
  );

  return (
    <section id="partecipanti" aria-labelledby="partecipanti-h" className="mb-8 scroll-mt-6 overflow-hidden rounded-card border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 id="partecipanti-h" className="font-display text-xl font-semibold">Partecipanti</h2>
          <p className="text-sm text-ink-soft">{total === 0 ? "Ancora nessuna iscrizione." : `${total} ${total === 1 ? "iscrizione ricevuta" : "iscrizioni ricevute"} per questo evento.`}</p>
        </div>
        {total > 0 && (
          <div className="flex flex-wrap gap-2">
            <ButtonLink external href={`${adminPaths.registrationsExport}?evento=${eventId}`} size="sm" variant="secondary">Scarica CSV</ButtonLink>
            <ButtonLink href={`${adminPaths.registrations}?evento=${eventId}`} size="sm" variant="ghost">Filtra e cerca</ButtonLink>
          </div>
        )}
      </div>
      {total > 0 && (
        <>
          {pending.length > 0 && group("In attesa di conferma", pending, "")}
          {group("Confermati", confirmed, "Nessun partecipante confermato.")}
          {other.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none border-t border-line px-5 py-3 text-sm font-medium text-ink-soft hover:text-ink">
                <span className="group-open:hidden">Mostra</span><span className="hidden group-open:inline">Nascondi</span> rifiutati e annullati ({other.length})
              </summary>
              <ul className="divide-y divide-line border-t border-line">{other.map(row)}</ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
