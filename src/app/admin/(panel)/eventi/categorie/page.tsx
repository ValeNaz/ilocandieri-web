import { DataTable, PageHeader } from "@/components/admin";
import { Button, ButtonLink, ConfirmDialog, Input } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/lib/events/service";
import { adminPaths } from "@/lib/paths";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export const metadata = { title: "Categorie degli eventi" };

export default async function Page() {
  await requireAdmin();
  const cats = await listCategories();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Categorie degli eventi" description="Servono a raggruppare gli eventi e a filtrarli sul sito (il filtro compare solo se ci sono categorie in uso)." actions={<ButtonLink href={adminPaths.events} variant="secondary">Torna agli eventi</ButtonLink>} />
      <form action={saveCategoryAction} className="mb-8 flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4 shadow-card">
        <div className="min-w-[14rem] flex-1"><Input name="name" label="Nuova categoria" required maxLength={60} placeholder="Per esempio: Sport" /></div>
        <Button type="submit">Aggiungi</Button>
      </form>
      <DataTable
        caption="Categorie degli eventi"
        rows={cats}
        rowKey={(c) => c.id}
        empty={{ title: "Nessuna categoria", description: "Le categorie le decidi tu: aggiungi la prima quando ti serve." }}
        columns={[
          { header: "Nome", cell: (c) => (
            <form action={saveCategoryAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={c.id} />
              <div className="min-w-[12rem]"><Input name="name" label="Nome" defaultValue={c.name} required maxLength={60} /></div>
              <Button type="submit" size="sm" variant="secondary">Rinomina</Button>
            </form>) },
          { header: "Eventi", cell: (c) => c.events },
          { header: "Azioni", align: "right", cell: (c) => (
            <ConfirmDialog triggerLabel="Elimina" title={`Eliminare la categoria «${c.name}»?`} description={c.events > 0 ? `${c.events} eventi la usano: resteranno senza categoria.` : "La categoria non è usata da nessun evento."} confirmLabel="Elimina" action={deleteCategoryAction} fields={{ id: c.id }} />) },
        ]}
      />
    </div>
  );
}
