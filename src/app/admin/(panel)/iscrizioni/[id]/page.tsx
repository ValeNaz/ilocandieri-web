import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin";
import { Button, ButtonLink, Card, ConfirmDialog, Textarea } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getRegistrationDetail } from "@/lib/events/admin";
import { formatAnswerValue } from "@/lib/events/forms";
import { seatsRemaining } from "@/lib/events/state";
import { adminPaths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { approveRegistrationAction, cancelRegistrationAction, deleteRegistrationAction, rejectRegistrationAction, saveRegistrationNoteAction } from "../actions";

export const metadata = { title: "Dettaglio iscrizione" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const d = await getRegistrationDetail(id);
  if (!d) notFound();
  const { registration: r, event: e } = d;
  const remaining = seatsRemaining(e);
  const f = { id: r.id };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={r.name}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={r.status} /> per <Link className="underline" href={adminPaths.event(e.id)}>{e.title}</Link></span>}
        actions={<ButtonLink href={`${adminPaths.registrations}?evento=${e.id}`} variant="secondary">Torna all&apos;elenco</ButtonLink>}
      />

      <div className="space-y-6">
        {r.status === "pending" && (
          <Card tone="terracotta" className="p-6">
            <h2 className="font-display text-xl font-medium">Questa richiesta aspetta la tua decisione</h2>
            <p className="mt-1 text-[0.97rem]">
              {e.capacity != null
                ? <>Posti confermati: <strong>{e.seatsConfirmed}</strong> su <strong>{e.capacity}</strong>{e.seatsHeld > 0 && <> ({e.seatsHeld} riservati in attesa)</>}. Questa richiesta ne chiede <strong>{r.seats}</strong>{e.pendingHoldsSeats ? " (già riservati)" : <>; ne restano <strong>{remaining}</strong></>}.</>
                : <>L&apos;evento non ha un limite di posti.</>}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ConfirmDialog triggerLabel="Approva" triggerVariant="olive" destructive={false} confirmLabel="Approva" title="Approvare la richiesta?" description="La partecipazione viene confermata e l'iscritto riceve una email. Se la capienza è superata, l'approvazione viene rifiutata." action={approveRegistrationAction} fields={f} />
              <ConfirmDialog triggerLabel="Rifiuta" title="Rifiutare la richiesta?" description="L'iscritto riceve una email con l'esito." confirmLabel="Rifiuta" action={rejectRegistrationAction} fields={f} />
            </div>
          </Card>
        )}

        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium">Dati dell&apos;iscritto</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Nome</dt><dd>{r.name}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Email</dt><dd><a className="underline" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Telefono</dt><dd>{r.phone ? <a className="underline" href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a> : "—"}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Posti</dt><dd>{r.seats}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Ricevuta il</dt><dd>{formatDateTime(r.createdAt)}</dd></div>
            {r.decidedAt && <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Ultima decisione</dt><dd>{formatDateTime(r.decidedAt)}</dd></div>}
          </dl>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium">Risposte al modulo</h2>
          <p className="mt-1 text-sm text-ink-soft">Versione {d.version} del modulo. Sono le domande e le risposte come erano al momento dell&apos;invio: non cambiano se il modulo viene modificato.</p>
          {r.answers && r.answers.length > 0 ? (
            <dl className="mt-5 divide-y divide-line">
              {r.answers.map((a) => (
                <div key={a.fieldId} className="py-3">
                  <dt className="text-sm font-medium text-ink-soft">{a.label}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words">{formatAnswerValue(a.value)}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="mt-4 text-ink-soft">Il modulo non conteneva altre domande.</p>}
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium">Nota interna</h2>
          <form action={saveRegistrationNoteAction} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={r.id} />
            <Textarea name="note" label="Nota (visibile solo a te)" rows={3} defaultValue={r.adminNote ?? ""} maxLength={1000} hint="Per esempio l'esito di una verifica. Non viene inviata all'iscritto." />
            <Button type="submit" variant="secondary">Salva nota</Button>
          </form>
        </Card>

        {(r.status === "pending" || r.status === "confirmed") && (
          <Card tone="deep" className="p-6">
            <h2 className="font-display text-xl font-medium">Annullare l&apos;iscrizione</h2>
            <p className="mt-1 text-sm text-ink-soft">I posti tornano disponibili e l&apos;iscritto riceve una email.</p>
            <div className="mt-4"><ConfirmDialog triggerLabel="Annulla iscrizione" triggerVariant="secondary" title="Annullare questa iscrizione?" description="I posti vengono liberati e l'iscritto riceve una email di annullamento." confirmLabel="Annulla iscrizione" cancelLabel="Indietro" action={cancelRegistrationAction} fields={f} /></div>
          </Card>
        )}

        <Card tone="deep" className="p-6">
          <h2 className="font-display text-xl font-medium">Eliminare i dati</h2>
          <p className="mt-1 text-sm text-ink-soft">Cancella definitivamente questa iscrizione e le email collegate (per esempio su richiesta dell&apos;interessato). Non si può annullare.</p>
          <div className="mt-4"><ConfirmDialog triggerLabel="Elimina definitivamente" triggerVariant="secondary" title="Eliminare definitivamente questa iscrizione?" description="I dati della persona vengono cancellati; se occupava posti, tornano disponibili. Nessuna email viene inviata." confirmLabel="Elimina" cancelLabel="Indietro" action={deleteRegistrationAction} fields={f} /></div>
        </Card>
      </div>
    </div>
  );
}
