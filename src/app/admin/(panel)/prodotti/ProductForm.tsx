"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { SaveBar } from "@/components/admin";
import { Checkbox, Input } from "@/components/ui";
import { adminPaths } from "@/lib/paths";
import { saveProductAction } from "./actions";

export type ProductFormValues = {
  id?: string;
  source: "manual" | "shopify";
  title: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  category: string;
  priceText: string;
  priceCheckedOn: string;
  visible: boolean;
  featuredHome: boolean;
};

export function ProductForm({ values, imported }: { values: ProductFormValues; imported?: boolean }) {
  const [state, action] = useActionState(saveProductAction, null);
  const fe = state?.fieldErrors ?? {};
  const synced = values.source === "shopify";
  return (
    <form action={action} onReset={(e) => e.preventDefault()} className="space-y-8">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {imported && (
        <p role="status" className="rounded-control border border-sage bg-sage-soft px-4 py-3 text-sm text-olive-deep">
          Abbiamo letto nome e foto dalla pagina pubblica di ABES. Controlla i dati e conferma con «Salva».
        </p>
      )}
      {synced && (
        <p role="note" className="rounded-control border border-line bg-paper-deep px-4 py-3 text-sm">
          Questo prodotto è sincronizzato da Shopify: nome, link, foto e prezzo si aggiornano da soli. Qui puoi cambiare descrizione foto, categoria e visibilità.
        </p>
      )}

      <section className="space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8" aria-labelledby="sec-prodotto">
        <h2 id="sec-prodotto" className="font-display text-2xl">Il prodotto</h2>
        <Input name="title" label="Nome del prodotto" required defaultValue={values.title} readOnly={synced} hint="Scrivilo come appare su ABES." error={fe.title} />
        <Input name="url" type="url" inputMode="url" label="Link alla scheda su ABES" required defaultValue={values.url} readOnly={synced}
          hint="Deve essere la pagina del prodotto, es. https://abes.bio/products/caponata-melanzane (non la home né il catalogo)." error={fe.url} />
        <Input name="category" label="Categoria" defaultValue={values.category} hint="Es. Conserve, Legumi, Farine, Pasta." error={fe.category} />
      </section>

      <section className="space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8" aria-labelledby="sec-foto">
        <h2 id="sec-foto" className="font-display text-2xl">Foto</h2>
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative size-36 shrink-0 overflow-hidden rounded-card border border-line bg-paper-deep">
            {values.imageUrl ? <Image src={values.imageUrl} alt="" fill sizes="144px" className="object-cover" /> : <span className="grid size-full place-items-center p-3 text-center text-xs text-ink-soft">Nessuna foto</span>}
          </div>
          <div className="min-w-0 flex-1 space-y-5">
            <Input name="imageUrl" type="url" inputMode="url" label="Indirizzo della foto (cdn.shopify.com)" defaultValue={values.imageUrl.startsWith("/media/") ? "" : values.imageUrl} readOnly={synced}
              hint="Si trova dal catalogo ABES: tasto destro sulla foto, «Copia indirizzo immagine»." error={fe.imageUrl} />
            {!synced && (
              <div className="space-y-1.5">
                <label htmlFor="imageFile" className="block text-sm font-medium">Oppure carica una foto <span className="font-normal text-ink-soft">(facoltativo)</span></label>
                <input id="imageFile" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-describedby="imageFile-hint"
                  className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:py-2.5 file:font-medium" />
                <p id="imageFile-hint" className="text-sm text-ink-soft">JPG, PNG, WebP o AVIF, massimo 8 MB. Usa solo foto di cui ABES ti ha dato il permesso.</p>
                {fe.imageFile && <p role="alert" className="text-sm font-medium text-danger">{fe.imageFile}</p>}
              </div>
            )}
          </div>
        </div>
        <Input name="imageAlt" label="Descrizione della foto" defaultValue={values.imageAlt} hint="Per chi non vede l'immagine. Es. «Barattolo di caponata siciliana ABES». Se vuoto usiamo il nome." error={fe.imageAlt} />
      </section>

      {!synced && (
        <section className="space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8" aria-labelledby="sec-prezzo">
          <h2 id="sec-prezzo" className="font-display text-2xl">Prezzo (facoltativo)</h2>
          <p role="note" className="rounded-control border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
            Il prezzo va aggiornato a mano: non si aggiorna da solo e non verrà mostrato come aggiornato. Il sito lo mostra solo se la data di verifica è degli ultimi 30 giorni. Il prezzo ufficiale resta quello su ABES. Se non sei sicuro, lascia vuoto.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input name="priceText" label="Prezzo" defaultValue={values.priceText} placeholder="Da 4,00 €" error={fe.priceText} />
            <Input name="priceCheckedOn" type="date" label="Verificato il" defaultValue={values.priceCheckedOn} hint="Se vuoto, usiamo la data di oggi." error={fe.priceCheckedOn} />
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-card border border-line bg-card p-6 shadow-card sm:p-8" aria-labelledby="sec-vis">
        <h2 id="sec-vis" className="font-display text-2xl">Dove si vede</h2>
        <Checkbox name="visible" label="Visibile sul sito" defaultChecked={values.visible} hint="Se tolto, il prodotto resta qui ma non compare né in Home né nello Shop." />
        <Checkbox name="featuredHome" label="Mostra in Home" defaultChecked={values.featuredHome} hint="Compare nella vetrina in Home, nell'ordine della lista." />
      </section>

      <SaveBar state={state} extra={<Link href={adminPaths.products} className="inline-flex min-h-11 items-center px-4 text-sm font-medium underline">Torna alla lista</Link>} />
    </form>
  );
}
