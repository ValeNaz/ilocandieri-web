"use client";

import { useActionState, useRef } from "react";
import { useSafeForm } from "./useSafeForm";
import { updateMediaAction, uploadMediaAction } from "@/app/admin/(panel)/media/actions";
import { SaveBar } from "@/components/admin/SaveBar";
import { Input } from "@/components/ui";
import type { ActionState } from "@/lib/actions";

export function UploadForm() {
  const [state, action] = useActionState<ActionState, FormData>(uploadMediaAction, null);
  const err = state && !state.ok ? state.fieldErrors : undefined;
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="file" className="block text-sm font-medium">Immagine <span className="text-terracotta-deep" aria-hidden="true">*</span></label>
        <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required aria-invalid={err?.file ? true : undefined}
          className="block w-full rounded-control border border-line-strong bg-card px-3 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper-deep file:px-4 file:py-2 file:font-medium" />
        <p className="text-sm text-ink-soft">JPG, PNG, WebP o AVIF, fino a 8 MB. Usa solo foto di cui hai i diritti.</p>
        {err?.file && <p role="alert" className="text-sm font-medium text-danger">{err.file}</p>}
      </div>
      <Input label="Descrizione dell'immagine (testo alternativo)" name="alt" required error={err?.alt} maxLength={200} hint="Descrivi cosa si vede, in una frase: serve a chi usa uno screen reader e ai motori di ricerca." />
      <Input label="Crediti / autore" name="credit" error={err?.credit} maxLength={150} />
      <SaveBar state={state} sticky={false} label="Carica immagine" />
    </form>
  );
}

export function MetaForm({ id, alt, credit }: { id: string; alt: string; credit: string }) {
  const { state, onSubmit } = useSafeForm(updateMediaAction);
  const err = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Input label="Descrizione (testo alternativo)" name="alt" id={`alt-${id}`} defaultValue={alt} required error={err?.alt} maxLength={200} />
      <Input label="Crediti / autore" name="credit" id={`credit-${id}`} defaultValue={credit} error={err?.credit} maxLength={150} />
      <SaveBar state={state} sticky={false} />
    </form>
  );
}
