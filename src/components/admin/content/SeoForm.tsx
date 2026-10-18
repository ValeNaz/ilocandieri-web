"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import { savePageSeoAction } from "@/app/admin/(panel)/pagine/actions";
import { SaveBar } from "@/components/admin/SaveBar";
import { Input, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import { MediaPicker, type MediaOption } from "./MediaPicker";

export function SeoForm({ pageId, seoTitle, seoDescription, ogImageId, media }: { pageId: string; seoTitle: string; seoDescription: string; ogImageId: string | null; media: MediaOption[] }) {
  const [state, action] = useActionState<ActionState, FormData>(savePageSeoAction, null);
  const [, start] = useTransition();
  const err = state && !state.ok ? state.fieldErrors : undefined;
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => action(fd));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="pageId" value={pageId} />
      <Input label="Titolo per i motori di ricerca" name="seoTitle" defaultValue={seoTitle} maxLength={70} error={err?.seoTitle} hint="Compare nei risultati di Google e nella scheda del browser. Ideale: sotto i 60 caratteri." />
      <Textarea label="Descrizione" name="seoDescription" defaultValue={seoDescription} rows={3} maxLength={200} error={err?.seoDescription} hint="Breve riassunto mostrato sotto il titolo nei risultati di ricerca. Ideale: 120-160 caratteri." />
      <MediaPicker name="ogImageId" label="Immagine per la condivisione sui social" defaultValue={ogImageId} options={media} error={err?.ogImageId} hint="Anteprima quando il link viene condiviso (consigliata 1200×630). Se vuota si usa quella predefinita del sito." />
      <SaveBar state={state} sticky={false} />
    </form>
  );
}
