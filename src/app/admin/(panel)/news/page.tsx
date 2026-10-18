import Link from "next/link";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { Badge, Button, ButtonLink, ConfirmDialog, Input, Select } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { isScheduled } from "@/lib/news/core";
import { listCategories, listNewsAdmin } from "@/lib/news/admin";
import { adminPaths, paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import { deleteNewsAction, setNewsStatusAction } from "./actions";

export const metadata = { title: "News" };

export default async function Page({ searchParams }: { searchParams: Promise<{ stato?: string; categoria?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [rows, cats] = await Promise.all([listNewsAdmin({ status: sp.stato, categoryId: sp.categoria, q: sp.q }), listCategories()]);
  const filtered = !!(sp.stato || sp.categoria || sp.q);

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="News"
        description="Articoli e novità. Le bozze non sono mai visibili ai visitatori: compaiono sul sito solo dopo «Pubblica»."
        actions={<><ButtonLink href={`${adminPaths.news}/categorie`} variant="secondary">Categorie</ButtonLink><ButtonLink href={`${adminPaths.news}/nuova`}>Nuova news</ButtonLink></>}
      />
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-line bg-card p-4 shadow-card" role="search" aria-label="Filtra le news">
        <div className="min-w-[12rem] flex-1"><Input name="q" label="Cerca nel titolo" defaultValue={sp.q ?? ""} /></div>
        <div className="w-44">
          <Select name="stato" label="Stato" defaultValue={sp.stato ?? ""}>
            <option value="">Tutte</option><option value="draft">Bozze</option><option value="published">Pubblicate</option>
          </Select>
        </div>
        <div className="w-52">
          <Select name="categoria" label="Categoria" defaultValue={sp.categoria ?? ""}>
            <option value="">Tutte</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <Button type="submit" variant="secondary">Filtra</Button>
        {filtered && <Link href={adminPaths.news} className="pb-3 text-sm underline">Azzera filtri</Link>}
      </form>

      <DataTable
        caption="Elenco delle news"
        rows={rows}
        rowKey={(r) => r.id}
        empty={filtered
          ? { title: "Nessuna news con questi filtri", action: <ButtonLink href={adminPaths.news} variant="secondary">Azzera filtri</ButtonLink> }
          : { title: "Non ci sono ancora news", description: "Scrivi la prima: resterà in bozza finché non la pubblichi. Fino ad allora il sito mostra «Nuove storie in arrivo».", action: <ButtonLink href={`${adminPaths.news}/nuova`}>Scrivi la prima news</ButtonLink> }}
        columns={[
          { header: "Titolo", cell: (r) => (
            <div className="min-w-[14rem]">
              <Link href={`${adminPaths.news}/${r.id}`} className="font-semibold hover:underline">{r.title}</Link>
              <p className="text-sm text-ink-soft">/news/{r.slug}</p>
            </div>) },
          { header: "Stato", cell: (r) => (
            <span className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={r.status} />
              {isScheduled(r) && <Badge tone="warning">Programmata</Badge>}
              {r.featured && <Badge tone="terracotta">In evidenza</Badge>}
            </span>) },
          { header: "Categoria", cell: (r) => r.categoryName ?? <span className="text-ink-soft">—</span> },
          { header: "Data", cell: (r) => <span className="whitespace-nowrap text-sm">{r.publishedAt ? formatDate(r.publishedAt) : `Modificata ${formatDate(r.updatedAt)}`}</span> },
          { header: "Azioni", align: "right", cell: (r) => (
            <div className="flex flex-wrap justify-end gap-2">
              <ButtonLink href={`${adminPaths.news}/${r.id}`} size="sm" variant="ghost">Modifica</ButtonLink>
              {r.status === "published"
                ? <>
                    <ButtonLink href={paths.newsItem(r.slug)} size="sm" variant="ghost">Vedi<span className="sr-only"> «{r.title}» sul sito</span></ButtonLink>
                    <form action={setNewsStatusAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="to" value="draft" /><Button type="submit" size="sm" variant="secondary">Ritira</Button></form>
                  </>
                : <>
                    <ButtonLink href={`${adminPaths.news}/${r.id}/anteprima`} size="sm" variant="ghost">Anteprima</ButtonLink>
                    <form action={setNewsStatusAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="to" value="published" /><Button type="submit" size="sm" variant="olive">Pubblica</Button></form>
                  </>}
              <ConfirmDialog triggerLabel="Elimina" title={`Eliminare «${r.title}»?`} description="L'articolo sparisce per sempre. Se vuoi solo nasconderlo, usa «Ritira»." confirmLabel="Elimina" action={deleteNewsAction} fields={{ id: r.id }} />
            </div>) },
        ]}
      />
    </div>
  );
}
