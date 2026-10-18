import { ButtonLink, Badge, Card } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { BLOCK_DEFS, PAGE_URLS, SLOT_LABELS, isBlockType, type PageKey } from "@/lib/content/blocks";
import { getAllPageBlocks } from "@/lib/content/queries";
import { listMediaOptions } from "@/lib/content/media";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { adminPaths } from "@/lib/paths";
import { moveBlockAction, toggleBlockAction } from "@/app/admin/(panel)/pagine/actions";
import { Button } from "@/components/ui";
import { BlockForm } from "./BlockForm";
import { SeoForm } from "./SeoForm";

/** Admin editor for all the blocks of a page (home and institutional pages): edit, hide/show, move up/down, SEO. */
export async function PageEditor({ pageKey, title, description }: { pageKey: PageKey; title: string; description: string }) {
  const [{ page }, media] = await Promise.all([getAllPageBlocks(pageKey), listMediaOptions()]);
  // Read raw rows so that even blocks with invalid data stay editable.
  const rows = page ? await db.select().from(schema.pageBlocks).where(eq(schema.pageBlocks.pageId, page.id)) : [];
  rows.sort((a, b) => a.position - b.position);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<ButtonLink href={PAGE_URLS[pageKey]} variant="secondary" target="_blank" rel="noopener">Vedi pagina<span className="sr-only"> (nuova scheda)</span></ButtonLink>}
      />
      {!page ? (
        <p className="rounded-card border border-line bg-card p-6">Questa pagina non esiste ancora nel database: esegui <code>pnpm db:seed</code>.</p>
      ) : (
        <div className="space-y-6">
          <p className="text-ink-soft">Ogni sezione si modifica separatamente: apri una sezione, cambia i testi e premi <strong>Salva</strong>. Le modifiche sono subito visibili sul sito. Usa le frecce per cambiare l&apos;ordine e «Nascondi» per togliere una sezione senza perderla.</p>
          <ol className="space-y-4">
            {rows.map((row, i) => {
              const known = isBlockType(row.type);
              const def = known ? BLOCK_DEFS[row.type as keyof typeof BLOCK_DEFS] : null;
              const data = (row.data ?? {}) as Record<string, unknown>;
              const slot = typeof data.slot === "string" ? data.slot : "";
              const heading = (typeof data.title === "string" && data.title) || (typeof data.text === "string" && data.text.slice(0, 60)) || def?.label || row.type;
              return (
                <li key={row.id}>
                  <Card className="overflow-hidden">
                    <details className="group" open={rows.length === 1}>
                      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-deep text-sm font-semibold">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">{def?.label ?? row.type}{slot && SLOT_LABELS[slot] ? ` · ${SLOT_LABELS[slot]}` : ""}</span>
                          <span className="block truncate font-display text-lg font-medium">{heading}</span>
                        </span>
                        {!row.visible && <Badge tone="warning">Nascosta</Badge>}
                        <span className="text-sm font-medium text-terracotta-deep group-open:hidden">Modifica</span>
                        <span className="hidden text-sm font-medium text-terracotta-deep group-open:inline">Chiudi</span>
                      </summary>
                      <div className="border-t border-line px-5 py-6">
                        <div className="mb-6 flex flex-wrap gap-2">
                          <form action={toggleBlockAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <Button type="submit" size="sm" variant="secondary">{row.visible ? "Nascondi dal sito" : "Mostra sul sito"}</Button>
                          </form>
                          <form action={moveBlockAction}>
                            <input type="hidden" name="id" value={row.id} /><input type="hidden" name="dir" value="up" />
                            <Button type="submit" size="sm" variant="ghost" disabled={i === 0} aria-label={`Sposta in alto la sezione ${i + 1}`}>↑ Su</Button>
                          </form>
                          <form action={moveBlockAction}>
                            <input type="hidden" name="id" value={row.id} /><input type="hidden" name="dir" value="down" />
                            <Button type="submit" size="sm" variant="ghost" disabled={i === rows.length - 1} aria-label={`Sposta in basso la sezione ${i + 1}`}>↓ Giù</Button>
                          </form>
                        </div>
                        {typeof data.adminNote === "string" && data.adminNote && (
                          <p role="note" className="mb-6 rounded-control border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning"><strong>Nota per chi modifica:</strong> {data.adminNote}</p>
                        )}
                        {def && <p className="mb-5 text-sm text-ink-soft">{def.description}</p>}
                        {def ? (
                          <BlockForm blockId={row.id} fields={def.fields} values={data} media={media} />
                        ) : (
                          <p className="text-danger">Tipo di sezione sconosciuto ({row.type}).</p>
                        )}
                      </div>
                    </details>
                  </Card>
                </li>
              );
            })}
          </ol>

          <section aria-labelledby="seo-h" className="rounded-card border border-line bg-card p-6 shadow-card">
            <h2 id="seo-h" className="font-display text-2xl font-medium">SEO e condivisione</h2>
            <p className="mb-6 mt-1 text-ink-soft">Come appare questa pagina su Google e quando il link viene condiviso.</p>
            <SeoForm pageId={page.id} seoTitle={page.seoTitle ?? ""} seoDescription={page.seoDescription ?? ""} ogImageId={page.ogImageId} media={media} />
          </section>
        </div>
      )}
      <p className="mt-8 text-sm text-ink-soft"><a className="underline" href={adminPaths.pages}>Tutte le pagine</a></p>
    </>
  );
}
