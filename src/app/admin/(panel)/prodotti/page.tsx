import Image from "next/image";
import Link from "next/link";
import { Badge, Button, ButtonLink, EmptyState, Input } from "@/components/ui";
import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getHomeShowcaseLimit, listProducts } from "@/lib/abes/admin";
import { displayTitle } from "@/lib/abes/format";
import { getProviderStatus } from "@/lib/abes/provider";
import { adminPaths, paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import { moveProductAction, syncNowAction, toggleProductAction } from "./actions";

export const metadata = { title: "Prodotti ABES" };

export default async function Page() {
  await requireAdmin();
  const [products, homeLimit] = await Promise.all([listProducts(), getHomeShowcaseLimit()]);
  const provider = getProviderStatus();
  const homeItems = products.filter((p) => p.visible && p.featuredHome);
  const lastSync = products.reduce((m, p) => Math.max(m, p.lastSyncedAt ?? 0), 0);
  const syncErrors = products.some((p) => p.source === "shopify" && p.syncStatus === "error");

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Prodotti ABES"
        description="I prodotti reali di abes.bio che mostri nella vetrina. Ogni scheda porta alla pagina di quel prodotto su ABES: carrello, ordini e pagamenti restano lì."
        actions={<ButtonLink href={`${adminPaths.products}/nuovo`}>Aggiungi prodotto</ButtonLink>}
      />

      <section aria-labelledby="stato-fonte" className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-6 shadow-card">
          <h2 id="stato-fonte" className="font-display text-xl">Da dove arrivano i prodotti</h2>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={provider.kind === "shopify" ? "success" : "neutral"}>{provider.kind === "shopify" ? "Shopify collegato" : "Catalogo manuale"}</Badge>
            {provider.kind === "shopify" && <span className="text-sm text-ink-soft">{provider.domain}{provider.collection ? ` · collezione ${provider.collection}` : ""}</span>}
          </p>
          {provider.kind === "shopify" ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-ink-soft">
                {lastSync ? `Ultima sincronizzazione: ${formatDate(lastSync)}.` : "Non è ancora stata fatta una sincronizzazione."}
                {syncErrors && " L'ultima non è riuscita: si vede l'ultima copia valida, senza prezzi."}
              </p>
              <form action={syncNowAction}><Button type="submit" variant="secondary" size="sm">Sincronizza ora</Button></form>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-ink-soft">
              <p>Gestisci i prodotti a mano: nome, foto e link. Nessun prezzo o «disponibile» viene mostrato, così non appaiono informazioni vecchie.</p>
              <details className="rounded-control border border-line bg-paper-deep/60 px-3 py-2">
                <summary className="cursor-pointer font-medium text-ink">Come collegare Shopify (per chi gestisce il server)</summary>
                <p className="mt-2">Imposta le variabili <code>SHOPIFY_STORE_DOMAIN</code> e <code>SHOPIFY_STOREFRONT_TOKEN</code> (token Storefront API creato da ABES nell&apos;app «Headless») e riavvia. Opzionale: <code>SHOPIFY_COLLECTION_HANDLE</code> per sincronizzare una sola collezione. Qui comparirà «Sincronizza ora».</p>
              </details>
            </div>
          )}
        </div>

        <div className="rounded-card border border-line bg-card p-6 shadow-card">
          <h2 className="font-display text-xl">Importa da un link ABES</h2>
          <p className="mt-2 text-sm text-ink-soft">Incolla il link di un prodotto: leggiamo nome e foto una sola volta e li ricontrolli prima di salvare.</p>
          <form action={`${adminPaths.products}/nuovo`} method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[14rem] flex-1">
              <Input name="importa" type="url" inputMode="url" label="Link del prodotto" required placeholder="https://abes.bio/products/…" />
            </div>
            <Button type="submit" variant="secondary">Importa</Button>
          </form>
        </div>
      </section>

      <p className="mb-4 text-sm text-ink-soft" role="status">
        In Home: <strong className="text-ink">{homeItems.length}</strong> prodotti segnati
        {homeLimit ? <> · la Home ne mostra al massimo <strong className="text-ink">{homeLimit}</strong> (si cambia in <Link href={adminPaths.home} className="underline">Home</Link>)</> : <> · il numero mostrato si decide in <Link href={adminPaths.home} className="underline">Home</Link></>}.
        {" "}L&apos;ordine della lista è l&apos;ordine sul sito.
      </p>

      {products.length === 0 ? (
        <EmptyState title="Nessun prodotto in vetrina" description="Aggiungi i primi prodotti: la Home mostrerà un invito a visitare il catalogo ABES finché la vetrina è vuota."
          action={<ButtonLink href={`${adminPaths.products}/nuovo`}>Aggiungi il primo prodotto</ButtonLink>} />
      ) : (
        <ol className="space-y-3" aria-label="Prodotti della vetrina, in ordine">
          {products.map((p, i) => {
            const beyond = p.featuredHome && p.visible && homeLimit ? homeItems.findIndex((h) => h.id === p.id) >= homeLimit : false;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-card p-4 shadow-card">
                <span className="w-6 text-center text-sm font-semibold text-ink-soft" aria-hidden="true">{i + 1}</span>
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-paper-deep">
                  {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-[12rem] flex-1">
                  <p className="font-semibold leading-snug"><Link href={`${adminPaths.products}/${p.id}`} className="hover:underline">{displayTitle(p.title)}</Link></p>
                  <p className="mt-0.5 text-sm text-ink-soft">{p.category ?? "Senza categoria"} · <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline">abes.bio/products/{p.handle}<span className="sr-only"> (si apre su abes.bio)</span></a></p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {p.visible ? <Badge tone="success">Visibile</Badge> : <Badge>Nascosto{p.syncStatus === "removed" ? " (non più su ABES)" : ""}</Badge>}
                    {p.featuredHome && <Badge tone="terracotta">In Home</Badge>}
                    {beyond && <Badge tone="warning">Oltre il limite della Home</Badge>}
                    {p.source === "shopify" && <Badge tone="olive">Shopify</Badge>}
                    {p.syncStatus === "error" && <Badge tone="danger">Sincronizzazione fallita</Badge>}
                    {!p.imageUrl && <Badge tone="danger">Manca la foto</Badge>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={moveProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" />
                    <Button type="submit" size="sm" variant="ghost" disabled={i === 0} aria-label={`Sposta «${displayTitle(p.title)}» più in alto`}>↑</Button></form>
                  <form action={moveProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" />
                    <Button type="submit" size="sm" variant="ghost" disabled={i === products.length - 1} aria-label={`Sposta «${displayTitle(p.title)}» più in basso`}>↓</Button></form>
                  <form action={toggleProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="flag" value="visible" /><input type="hidden" name="value" value={p.visible ? "0" : "1"} />
                    <Button type="submit" size="sm" variant="secondary">{p.visible ? "Nascondi" : "Mostra"}</Button></form>
                  <form action={toggleProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="flag" value="featuredHome" /><input type="hidden" name="value" value={p.featuredHome ? "0" : "1"} />
                    <Button type="submit" size="sm" variant="secondary">{p.featuredHome ? "Togli dalla Home" : "Metti in Home"}</Button></form>
                  <ButtonLink href={`${adminPaths.products}/${p.id}`} size="sm" variant="ghost">Modifica</ButtonLink>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-8 text-sm text-ink-soft">Vedi il risultato: <Link href={paths.home} className="underline">Home</Link> · <Link href={paths.shop} className="underline">Shop</Link></p>
    </div>
  );
}
