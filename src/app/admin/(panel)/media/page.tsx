import { desc } from "drizzle-orm";
import { MetaForm, UploadForm } from "@/components/admin/content/MediaForms";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getMediaUsage } from "@/lib/content/media";
import { db, schema } from "@/lib/db";
import { mediaUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { deleteMediaAction } from "./actions";

export const metadata = { title: "Media" };

export default async function Page() {
  await requireAdmin();
  const rows = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));
  const usages = await Promise.all(rows.map((m) => getMediaUsage(m.id)));
  return (
    <>
      <PageHeader title="Media" description="Le immagini del sito. Carica qui le foto, poi scegli dove usarle nelle pagine, nelle news e negli eventi." />
      <section aria-labelledby="up-h" className="mb-12 max-w-2xl rounded-card border border-line bg-card p-6 shadow-card">
        <h2 id="up-h" className="mb-5 font-display text-2xl font-medium">Carica una nuova immagine</h2>
        <UploadForm />
      </section>
      <h2 className="mb-5 font-display text-2xl font-medium">Libreria ({rows.length})</h2>
      {rows.length === 0 ? (
        <EmptyState title="Nessuna immagine caricata" description="Carica la prima immagine con il modulo qui sopra. Finché non ce ne sono, il sito mostra disegni decorativi al posto delle foto." />
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((m, i) => {
            const used = usages[i]!;
            return (
              <li key={m.id} className="overflow-hidden rounded-card border border-line bg-card shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a local file */}
                <img src={mediaUrl(m.path)} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full bg-paper-deep object-cover" />
                <div className="space-y-4 p-5">
                  <p className="text-xs text-ink-soft">{m.width && m.height ? `${m.width}×${m.height} px · ` : ""}{Math.round(m.size / 1024)} KB · {formatDate(m.createdAt)}</p>
                  <MetaForm id={m.id} alt={m.alt} credit={m.credit ?? ""} />
                  <div className="border-t border-line pt-4">
                    {used.length > 0 ? (
                      <>
                        <p className="text-sm font-medium">In uso in:</p>
                        <ul className="mt-1 list-disc pl-5 text-sm text-ink-soft">{used.map((u, k) => <li key={k}>{u.label}</li>)}</ul>
                        <p className="mt-2 text-sm text-ink-soft">Per eliminarla, sostituiscila prima in questi punti.</p>
                      </>
                    ) : (
                      <ConfirmDialog triggerLabel="Elimina immagine" triggerVariant="secondary" title="Eliminare questa immagine?" description="L'immagine verrà rimossa per sempre dalla libreria. L'operazione non si può annullare." confirmLabel="Elimina" action={deleteMediaAction} fields={{ id: m.id }} />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
