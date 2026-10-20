"use client";

import { MediaPicker, type MediaOption } from "@/components/admin/content/MediaPicker";
import { useSafeForm } from "@/components/admin/content/useSafeForm";
import { SaveBar } from "@/components/admin/SaveBar";
import { Input } from "@/components/ui";
import type { MediaSlotEntry, MediaSlotKind } from "@/lib/media-slots";
import { saveMediaSlotAction } from "./actions";

export function SlotForm({ id, kind, defaultAlt, entry, options }: { id: string; kind: MediaSlotKind; defaultAlt: string; entry: MediaSlotEntry | null; options: MediaOption[] }) {
  const { state, onSubmit } = useSafeForm(saveMediaSlotAction);
  const err = state && !state.ok ? state.fieldErrors : undefined;
  const video = kind === "video";
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="slotId" value={id} />
      <MediaPicker name="mediaId" label={video ? "Immagine di copertina del video" : "Foto"} defaultValue={entry?.mediaId ?? null} options={options} error={err?.mediaId}
        hint={video ? "Si vede prima che il video parta e a chi ha chiesto meno movimento. Senza video, compare come foto." : "Scegli una foto dalla libreria Media (caricala prima lì)."} />
      {video && (
        <Input label="Indirizzo del video" name="videoUrl" id={`${id}-videoUrl`} defaultValue={entry?.videoUrl ?? ""} error={err?.videoUrl} maxLength={500} inputMode="url"
          placeholder="https://.../video.mp4" hint="Un file MP4 o WebM, muto, 15-40 secondi, al massimo 10-15 MB. Incolla l'indirizzo diretto del file (finisce con .mp4 o .webm), non il link di una pagina YouTube o Instagram." />
      )}
      <Input label="Descrizione per chi non vede" name="alt" id={`${id}-alt`} defaultValue={entry?.alt ?? ""} error={err?.alt} maxLength={200}
        hint={`Se la lasci vuota: «${defaultAlt}». Descrivi cosa si vede davvero nella tua foto.`} />
      <Input label="Didascalia" name="caption" id={`${id}-caption`} defaultValue={entry?.caption ?? ""} error={err?.caption} maxLength={160}
        hint="Breve, sotto la foto: luogo, momento o autore. Es. «Raccolta di febbraio. Foto di ...»." />
      <SaveBar state={state} sticky={false} />
    </form>
  );
}
