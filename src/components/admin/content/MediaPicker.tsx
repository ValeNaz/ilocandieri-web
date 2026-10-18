"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import { adminPaths } from "@/lib/paths";

export type MediaOption = { id: string; url: string; alt: string };

/** Pick one image from the media library. Submits the media id in a hidden input named `name` ("" = none). */
export function MediaPicker({ name, label, defaultValue, options, hint, error }: { name: string; label: string; defaultValue: string | null; options: MediaOption[]; hint?: string; error?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const ref = useRef<HTMLDialogElement>(null);
  const current = options.find((o) => o.id === value);
  const missing = value && !current;
  return (
    <div className="space-y-1.5" role="group" aria-label={label}>
      <span className="block text-sm font-medium">{label} <span className="font-normal text-ink-soft">(facoltativo)</span></span>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-4">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of a local file
          <img src={current.url} alt={current.alt} className="size-20 rounded-control border border-line object-cover" />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-control border border-dashed border-line-strong px-2 text-center text-xs text-ink-soft">{missing ? "Immagine non trovata" : "Nessuna immagine"}</span>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => ref.current?.showModal()}>{current ? "Cambia immagine" : "Scegli immagine"}</Button>
          {value && <Button size="sm" variant="ghost" onClick={() => setValue("")}>Rimuovi</Button>}
        </div>
      </div>
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
      <dialog ref={ref} aria-label={`Scegli: ${label}`} className="m-auto w-[min(94vw,46rem)] rounded-card border border-line bg-card p-0 text-ink shadow-pop">
        <div className="space-y-4 p-6">
          <h3 className="font-display text-2xl font-medium">Scegli un&apos;immagine</h3>
          {options.length === 0 ? (
            <p className="text-ink-soft">Non ci sono ancora immagini. <a className="font-medium text-terracotta-deep underline" href={adminPaths.media} target="_blank" rel="noopener noreferrer">Carica la prima nella libreria Media<span className="sr-only"> (nuova scheda)</span></a>, poi riapri questa finestra dopo aver ricaricato la pagina.</p>
          ) : (
            <ul className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
              {options.map((o) => (
                <li key={o.id}>
                  <button type="button" onClick={() => { setValue(o.id); ref.current?.close(); }} aria-pressed={o.id === value}
                    className="block w-full overflow-hidden rounded-control border-2 border-line text-left hover:border-terracotta aria-pressed:border-terracotta">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                    <img src={o.url} alt="" className="aspect-[4/3] w-full object-cover" />
                    <span className="block truncate px-2 py-1.5 text-xs text-ink-soft">{o.alt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end"><Button variant="secondary" onClick={() => ref.current?.close()}>Chiudi</Button></div>
        </div>
      </dialog>
    </div>
  );
}
