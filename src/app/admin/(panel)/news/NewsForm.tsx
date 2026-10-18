"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { SaveBar } from "@/components/admin";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button, Checkbox, Input, Select, Textarea } from "@/components/ui";
import { adminPaths } from "@/lib/paths";
import { saveNewsAction } from "./actions";

export type NewsFormValues = {
  id?: string;
  status: "draft" | "published";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  categoryId: string;
  featured: boolean;
  publishedAtLocal: string;
  seoTitle: string;
  seoDescription: string;
  cover: { id: string; url: string; alt: string } | null;
  og: { id: string; url: string } | null;
  gallery: { id: string; url: string; alt: string; position: number }[];
};

type Props = { values: NewsFormValues; categories: { id: string; name: string }[]; library: { id: string; url: string; alt: string }[] };

export function NewsForm({ values, categories, library }: Props) {
  const [state, action] = useActionState(saveNewsAction, null);
  const fe = state?.fieldErrors ?? {};
  const published = values.status === "published";
  const card = "space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8";

  return (
    <form action={action} onReset={(e) => e.preventDefault()} className="space-y-8" noValidate>
      {/* Default (Enter-key) submit must never publish: keep a "save" button first in tree order. */}
      <button type="submit" name="intent" value="save" tabIndex={-1} aria-hidden="true" className="sr-only">Salva</button>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <section className={card} aria-labelledby="n-testo">
        <h2 id="n-testo" className="font-display text-2xl">Testo</h2>
        <Input name="title" label="Titolo" required defaultValue={values.title} error={fe.title} />
        <Textarea name="excerpt" label="Introduzione" rows={3} defaultValue={values.excerpt} maxLength={400}
          hint="Due righe che compaiono nell'elenco e sotto il titolo. Se lasci vuoto, usiamo l'inizio del testo." error={fe.excerpt} />
        <RichTextEditor name="body" label="Testo dell'articolo" defaultHtml={values.body} error={fe.body}
          hint="Usa i pulsanti sopra per titoli, grassetto, elenchi e link. Le foto si aggiungono nella galleria qui sotto." />
      </section>

      <section className={card} aria-labelledby="n-info">
        <h2 id="n-info" className="font-display text-2xl">Pubblicazione</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select name="categoryId" label="Categoria" defaultValue={values.categoryId} error={fe.categoryId} hint="Gestisci l'elenco in «Categorie» in alto.">
            <option value="">Nessuna categoria</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input name="publishedAtLocal" type="datetime-local" label="Data di pubblicazione" defaultValue={values.publishedAtLocal} error={fe.publishedAtLocal}
            hint="Se vuota, è il momento in cui premi «Pubblica». Una data futura programma la uscita." />
        </div>
        <Input name="slug" label="Indirizzo della pagina" defaultValue={values.slug} error={fe.slug} placeholder="si crea dal titolo"
          hint="Compare dopo /news/. Usa lettere minuscole e trattini. Cambiarlo dopo la pubblicazione rompe i vecchi link condivisi." />
        <Checkbox name="featured" label="In evidenza" defaultChecked={values.featured} hint="Compare per prima in Home e in cima all'elenco news." />
      </section>

      <section className={card} aria-labelledby="n-cover">
        <h2 id="n-cover" className="font-display text-2xl">Foto di copertina</h2>
        {values.cover && (
          <div className="flex items-start gap-4">
            <div className="relative aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-xl border border-line"><Image src={values.cover.url} alt="" fill sizes="176px" className="object-cover" /></div>
            <Checkbox name="removeCover" label="Togli la copertina" />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="coverFile" className="block text-sm font-medium">{values.cover ? "Sostituisci con una nuova foto" : "Carica una foto"} <span className="font-normal text-ink-soft">(facoltativo)</span></label>
          <input id="coverFile" name="coverFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:py-2.5 file:font-medium" />
          <p className="text-sm text-ink-soft">JPG, PNG, WebP o AVIF, massimo 8 MB. Senza foto, la card usa un disegno decorativo.</p>
          {fe.coverFile && <p role="alert" className="text-sm font-medium text-danger">{fe.coverFile}</p>}
        </div>
        {library.length > 0 && (
          <details className="rounded-control border border-line bg-paper-deep/40 p-3">
            <summary className="cursor-pointer text-sm font-medium">Oppure scegli dalle foto già caricate</summary>
            <fieldset className="mt-3">
              <legend className="sr-only">Foto già caricate</legend>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {library.map((m) => (
                  <label key={m.id} className="relative block cursor-pointer overflow-hidden rounded-xl border border-line has-[:checked]:ring-4 has-[:checked]:ring-terracotta/50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-terracotta">
                    <input type="radio" name="coverPick" value={m.id} className="sr-only" />
                    <span className="relative block aspect-square"><Image src={m.url} alt={m.alt || "Foto senza descrizione"} fill sizes="120px" className="object-cover" /></span>
                  </label>
                ))}
              </div>
            </fieldset>
          </details>
        )}
        <Input name="coverAlt" label="Descrizione della foto" defaultValue={values.cover?.alt ?? ""} error={fe.coverAlt} hint="Per chi non vede l'immagine: dì cosa si vede, in una frase. Obbligatoria per pubblicare con una copertina." />
      </section>

      <section className={card} aria-labelledby="n-gal">
        <h2 id="n-gal" className="font-display text-2xl">Galleria</h2>
        {values.gallery.length > 0 && (
          <ul className="space-y-4">
            {values.gallery.map((g) => (
              <li key={g.id} className="flex flex-wrap items-start gap-4 rounded-control border border-line p-3">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl"><Image src={g.url} alt="" fill sizes="96px" className="object-cover" /></div>
                <div className="min-w-[14rem] flex-1 space-y-3">
                  <Input name={`galleryAlt_${g.id}`} label="Descrizione della foto" defaultValue={g.alt} hint={g.alt ? undefined : "Manca: senza descrizione la foto viene letta come decorativa."} />
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="w-28"><Input name={`galleryPos_${g.id}`} type="number" label="Posizione" defaultValue={g.position} /></div>
                    <label className="flex items-center gap-2 pb-3 text-sm"><input type="checkbox" name="galleryRemove" value={g.id} className="size-4" /> Togli dalla galleria</label>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-1.5">
          <label htmlFor="galleryFiles" className="block text-sm font-medium">Aggiungi foto <span className="font-normal text-ink-soft">(facoltativo)</span></label>
          <input id="galleryFiles" name="galleryFiles" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:py-2.5 file:font-medium" />
          <p className="text-sm text-ink-soft">Puoi sceglierne più di una. Dopo il salvataggio potrai descrivere ogni foto e cambiare l&apos;ordine (numero più basso = prima).</p>
          {fe.galleryFiles && <p role="alert" className="text-sm font-medium text-danger">{fe.galleryFiles}</p>}
        </div>
      </section>

      <section className={card} aria-labelledby="n-seo">
        <h2 id="n-seo" className="font-display text-2xl">Come appare su Google e sui social</h2>
        <Input name="seoTitle" label="Titolo per i motori di ricerca" defaultValue={values.seoTitle} maxLength={70} hint="Facoltativo. Se vuoto usiamo il titolo della news." error={fe.seoTitle} />
        <Textarea name="seoDescription" label="Descrizione per i motori di ricerca" rows={3} defaultValue={values.seoDescription} maxLength={170} hint="Facoltativo, circa 150 caratteri. Se vuota usiamo l'introduzione." error={fe.seoDescription} />
        {values.og && (
          <div className="flex items-start gap-4">
            <div className="relative aspect-[1.91/1] w-44 shrink-0 overflow-hidden rounded-xl border border-line"><Image src={values.og.url} alt="" fill sizes="176px" className="object-cover" /></div>
            <Checkbox name="removeOg" label="Togli questa immagine social" />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="ogFile" className="block text-sm font-medium">Immagine per la condivisione sui social <span className="font-normal text-ink-soft">(facoltativo)</span></label>
          <input id="ogFile" name="ogFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:py-2.5 file:font-medium" />
          <p className="text-sm text-ink-soft">Meglio 1200 × 630 px. Se non la carichi, usiamo la copertina.</p>
          {fe.ogFile && <p role="alert" className="text-sm font-medium text-danger">{fe.ogFile}</p>}
        </div>
      </section>

      <SaveBar
        state={state}
        label={published ? "Salva modifiche" : "Salva bozza"}
        extra={
          <>
            {values.id && <Link href={`${adminPaths.news}/${values.id}/anteprima`} target="_blank" className="inline-flex min-h-11 items-center px-3 text-sm font-medium underline">Anteprima<span className="sr-only"> (si apre in una nuova scheda)</span></Link>}
            {published
              ? <Button type="submit" name="intent" value="unpublish" variant="secondary">Ritira (torna bozza)</Button>
              : <Button type="submit" name="intent" value="publish" variant="olive">Pubblica</Button>}
          </>
        }
      />
    </form>
  );
}
