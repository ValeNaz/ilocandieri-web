import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { PageHeader, StatusBadge } from "@/components/admin";
import { EventForm } from "@/components/admin/events/EventForm";
import { Badge, Button, ButtonLink, Card, ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaOptions } from "@/lib/content/media";
import { db, schema } from "@/lib/db";
import { getAdminEvent, registrationTotals } from "@/lib/events/admin";
import { DEFAULT_FIELDS, getLatestFormVersion } from "@/lib/events/forms";
import { nowMs } from "@/lib/events/format";
import { toFormInitial } from "@/lib/events/form-initial";
import { DEFAULT_MESSAGES } from "@/lib/events/messages";
import { listCategories } from "@/lib/events/service";
import { getRegistrationState } from "@/lib/events/state";
import { adminPaths, paths } from "@/lib/paths";
import { count } from "drizzle-orm";
import { deleteEventAction, duplicateEventAction, recountAction, setRegistrationsClosedAction } from "../actions";

export const metadata = { title: "Modifica evento" };

const STATE_LABEL = { not_applicable: "Nessuna iscrizione online", not_yet_open: "Iscrizioni non ancora aperte", open: "Iscrizioni aperte", closed: "Iscrizioni chiuse", full: "Posti esauriti", past: "Evento concluso" } as const;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event) notFound();
  const [media, categories, version, totals] = await Promise.all([listMediaOptions(), listCategories(), getLatestFormVersion(id), registrationTotals(id)]);
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
            {isReg && <ButtonLink href={`${adminPaths.registrations}?evento=${event.id}`} variant="secondary">Iscrizioni ({registrationsCount})</ButtonLink>}
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
            <Link href={`${adminPaths.registrations}?evento=${event.id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-terracotta-deep underline">Apri l&apos;elenco iscritti</Link>
          </div>
        </Card>
      )}

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
