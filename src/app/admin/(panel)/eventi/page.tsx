import Link from "next/link";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { Badge, Button, ButtonLink, Select } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminEvents } from "@/lib/events/admin";
import { formatEventWhen } from "@/lib/events/format";
import { adminPaths, paths } from "@/lib/paths";
import { setEventStatusAction, setRegistrationsClosedAction } from "./actions";

export const metadata = { title: "Eventi" };

const STATE_BADGE = {
  not_applicable: null,
  not_yet_open: { label: "Iscrizioni non ancora aperte", tone: "neutral" },
  open: { label: "Iscrizioni aperte", tone: "success" },
  closed: { label: "Iscrizioni chiuse", tone: "neutral" },
  full: { label: "Posti esauriti", tone: "warning" },
  past: null,
} as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ stato?: string; periodo?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.stato === "draft" || sp.stato === "published" || sp.stato === "hidden" ? sp.stato : null;
  const period = sp.periodo === "upcoming" || sp.periodo === "past" ? sp.periodo : null;
  const rows = await listAdminEvents({ status, period });
  const filtered = !!(status || period);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Eventi"
        description="Crea e gestisci gli eventi, i moduli di iscrizione e le regole di partecipazione. Solo gli eventi «Pubblicato» sono visibili sul sito."
        actions={<><ButtonLink href={adminPaths.eventCategories} variant="secondary">Categorie</ButtonLink><ButtonLink href={adminPaths.registrations} variant="secondary">Iscrizioni</ButtonLink><ButtonLink href={adminPaths.eventNew}>Nuovo evento</ButtonLink></>}
      />
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4 shadow-card" role="search" aria-label="Filtra gli eventi">
        <div className="w-48">
          <Select name="stato" label="Stato" defaultValue={status ?? ""}>
            <option value="">Tutti</option><option value="draft">Bozze</option><option value="published">Pubblicati</option><option value="hidden">Nascosti</option>
          </Select>
        </div>
        <div className="w-48">
          <Select name="periodo" label="Quando" defaultValue={period ?? ""}>
            <option value="">Tutti</option><option value="upcoming">Futuri</option><option value="past">Passati</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary">Filtra</Button>
        {filtered && <Link href={adminPaths.events} className="pb-3 text-sm underline">Azzera filtri</Link>}
      </form>

      <DataTable
        caption="Elenco degli eventi"
        rows={rows}
        rowKey={(r) => r.event.id}
        empty={filtered
          ? { title: "Nessun evento con questi filtri", action: <ButtonLink href={adminPaths.events} variant="secondary">Azzera filtri</ButtonLink> }
          : { title: "Non ci sono ancora eventi", description: "Crea il primo: resta in bozza finché non lo pubblichi. Fino ad allora il sito mostra un calendario in preparazione.", action: <ButtonLink href={adminPaths.eventNew}>Crea il primo evento</ButtonLink> }}
        columns={[
          { header: "Evento", cell: (r) => (
            <div className="min-w-[15rem]">
              <Link href={adminPaths.event(r.event.id)} className="font-semibold hover:underline">{r.event.title}</Link>
              <p className="text-sm text-ink-soft">{formatEventWhen(r.event.startsAt, null)}</p>
              <p className="text-xs text-ink-soft">/eventi/{r.event.slug}{r.categoryName ? ` · ${r.categoryName}` : ""}</p>
            </div>) },
          { header: "Stato", cell: (r) => (
            <span className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={r.event.status} />
              {r.isPast && <Badge>Concluso</Badge>}
              {r.event.featured && <Badge tone="terracotta">In evidenza</Badge>}
            </span>) },
          { header: "Iscrizioni", cell: (r) => {
            const e = r.event;
            if (e.ctaType !== "registration") return <span className="text-sm text-ink-soft">—</span>;
            const b = STATE_BADGE[r.state];
            return (
              <div className="min-w-[11rem] text-sm">
                {b && <Badge tone={b.tone}>{b.label}</Badge>}
                <p className="mt-1.5">
                  <strong>{e.seatsConfirmed}</strong> confermati{e.capacity != null ? <> su <strong>{e.capacity}</strong></> : ""}
                  {r.counts.pending > 0 && <> · <Link href={`${adminPaths.event(e.id)}#partecipanti`} className="font-semibold text-warning underline">{r.counts.pending} in attesa</Link></>}
                </p>
                <Link href={`${adminPaths.event(e.id)}#partecipanti`} className="mt-1 inline-block font-medium text-terracotta-deep hover:underline">Vedi partecipanti<span className="sr-only"> di {e.title}</span></Link>
              </div>
            );
          } },
          { header: "Azioni", align: "right", cell: (r) => (
            <div className="flex flex-wrap justify-end gap-2">
              <ButtonLink href={adminPaths.event(r.event.id)} size="sm" variant="ghost">Modifica</ButtonLink>
              {r.event.status === "published" && <ButtonLink href={paths.event(r.event.slug)} size="sm" variant="ghost">Vedi<span className="sr-only"> «{r.event.title}» sul sito</span></ButtonLink>}
              {r.event.ctaType === "registration" && !r.isPast && (
                <form action={setRegistrationsClosedAction}>
                  <input type="hidden" name="id" value={r.event.id} /><input type="hidden" name="closed" value={r.event.registrationManuallyClosed ? "0" : "1"} />
                  <Button type="submit" size="sm" variant="secondary">{r.event.registrationManuallyClosed ? "Riapri iscrizioni" : "Chiudi iscrizioni"}</Button>
                </form>
              )}
              <form action={setEventStatusAction}>
                <input type="hidden" name="id" value={r.event.id} /><input type="hidden" name="to" value={r.event.status === "published" ? "hidden" : "published"} />
                <Button type="submit" size="sm" variant={r.event.status === "published" ? "secondary" : "olive"}>{r.event.status === "published" ? "Nascondi" : "Pubblica"}</Button>
              </form>
            </div>) },
        ]}
      />
    </div>
  );
}
