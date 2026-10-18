import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin";
import { Button, Card, ConfirmDialog, EmptyState, Input, Select, Textarea } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listOpenings } from "@/lib/careers/admin";
import { adminPaths } from "@/lib/paths";
import { deleteOpeningAction, saveOpeningAction } from "../actions";

export const metadata = { title: "Posizioni aperte" };

type Opening = Awaited<ReturnType<typeof listOpenings>>[number];

function OpeningForm({ o }: { o?: Opening }) {
  const pid = o?.id ?? "new";
  return (
    <form action={saveOpeningAction} className="space-y-4">
      {o && <input type="hidden" name="id" value={o.id} />}
      <Input id={`title-${pid}`} name="title" label="Titolo della posizione" required maxLength={120} defaultValue={o?.title} />
      <Textarea id={`description-${pid}`} name="description" label="Descrizione" rows={4} maxLength={4000} defaultValue={o?.description} hint="Che cosa si cerca, dove, con quali attività." />
      <Select id={`status-${pid}`} name="status" label="Stato" required defaultValue={o?.status ?? "draft"} hint="Solo le posizioni «Pubblicata» compaiono nel sito.">
        <option value="draft">Bozza (non visibile)</option>
        <option value="open">Pubblicata (visibile nel sito)</option>
        <option value="closed">Chiusa (non visibile)</option>
      </Select>
      <Button type="submit">{o ? "Salva modifiche" : "Aggiungi posizione"}</Button>
    </form>
  );
}

export default async function Page() {
  await requireAdmin();
  const openings = await listOpenings();
  return (
    <>
      <p className="mb-3 text-sm"><Link href={adminPaths.applications} className="text-terracotta-deep underline">← Candidature</Link></p>
      <PageHeader title="Posizioni aperte" description="Facoltativo. Se non pubblichi nessuna posizione, il sito mostra solo l'invito alla candidatura spontanea." />
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {openings.length === 0 ? (
            <EmptyState title="Nessuna posizione inserita" description="Aggiungi una posizione con il modulo accanto, quando serve." />
          ) : (
            openings.map((o) => (
              <Card key={o.id} className="p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-medium">{o.title}</h2>
                  <StatusBadge status={o.status === "open" ? "published" : o.status === "draft" ? "draft" : "closed"} />
                </div>
                <OpeningForm o={o} />
                <div className="mt-4 border-t border-line pt-4">
                  <ConfirmDialog triggerLabel="Elimina posizione" title="Eliminare questa posizione?" description="Le candidature già ricevute restano, ma non saranno più collegate alla posizione." action={deleteOpeningAction} fields={{ id: o.id }} />
                </div>
              </Card>
            ))
          )}
        </div>
        <Card className="h-fit p-6">
          <h2 className="mb-4 font-display text-xl font-medium">Nuova posizione</h2>
          <OpeningForm />
        </Card>
      </div>
    </>
  );
}
