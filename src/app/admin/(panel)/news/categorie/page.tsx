import { PageHeader } from "@/components/admin";
import { Button, ButtonLink, ConfirmDialog, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/lib/news/admin";
import { adminPaths } from "@/lib/paths";
import { deleteCategoryAction, renameCategoryAction } from "../actions";
import { CategoryForm } from "./CategoryForm";

export const metadata = { title: "Categorie news" };

export default async function Page() {
  await requireAdmin();
  const cats = await listCategories();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Categorie delle news" description="Servono a filtrare l'elenco sul sito. Eliminare una categoria non elimina le news." actions={<ButtonLink href={adminPaths.news} variant="ghost" size="sm">← Torna alle news</ButtonLink>} />
      <div className="space-y-8">
        <CategoryForm />
        {cats.length === 0 ? (
          <EmptyState title="Nessuna categoria" description="Aggiungine una qui sopra per poterla assegnare alle news." />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-card shadow-card" aria-label="Categorie esistenti">
            {cats.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                <form action={renameCategoryAction} className="flex min-w-[16rem] flex-1 items-center gap-3">
                  <input type="hidden" name="id" value={c.id} />
                  <label htmlFor={`cat-${c.id}`} className="sr-only">Nome della categoria</label>
                  <input id={`cat-${c.id}`} name="name" defaultValue={c.name} maxLength={50} required className="w-full rounded-control border border-line-strong bg-card px-3 py-2" />
                  <Button type="submit" size="sm" variant="secondary">Rinomina</Button>
                </form>
                <span className="text-sm text-ink-soft">{c.count} {c.count === 1 ? "news" : "news"}</span>
                <ConfirmDialog triggerLabel="Elimina" title={`Eliminare la categoria «${c.name}»?`} description={c.count ? `Le ${c.count} news collegate restano, ma senza categoria.` : undefined} confirmLabel="Elimina" action={deleteCategoryAction} fields={{ id: c.id }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
