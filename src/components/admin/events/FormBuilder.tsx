"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Badge, Button } from "@/components/ui";
import type { EventFormField } from "@/lib/db/schema";

const TYPES: { type: EventFormField["type"]; label: string }[] = [
  { type: "text", label: "Testo breve" },
  { type: "textarea", label: "Testo lungo" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Telefono" },
  { type: "select", label: "Elenco a scelta" },
  { type: "checkbox", label: "Casella da spuntare" },
  { type: "seats", label: "Numero di partecipanti" },
];
const LOCKED = new Set(["name", "email"]);
const control = "w-full rounded-control border border-line-strong bg-card px-3 py-2 text-[0.95rem] text-ink focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/20";
const newId = () => `c_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Form builder. State lives here; the serialized fields go to the server in the hidden input `formFields`
 * and are re-validated there (the browser is never trusted). Inputs use form="" so they are not posted themselves.
 */
export function FormBuilder({ initial, reserved, version, registrationsCount, error }: { initial: EventFormField[]; reserved: boolean; version: number | null; registrationsCount: number; error?: string | null }) {
  const [fields, setFields] = useState<EventFormField[]>(initial);
  const [adding, setAdding] = useState<EventFormField["type"]>("text");
  const hidden = useRef<HTMLInputElement>(null);
  const first = useRef(true);
  const uid = useId();

  // Tell the surrounding <form> (SaveBar "unsaved changes") that something changed.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [fields]);

  const isLocked = (f: EventFormField) => LOCKED.has(f.id) || (reserved && f.id === "requisito");
  const patch = (id: string, p: Partial<EventFormField>) => setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const move = (idx: number, dir: -1 | 1) =>
    setFields((fs) => {
      const j = idx + dir;
      if (j < 2 || j >= fs.length || idx < 2) return fs; // name + email stay first
      const copy = [...fs];
      [copy[idx], copy[j]] = [copy[j]!, copy[idx]!];
      return copy;
    });
  const add = () => {
    const base: EventFormField = { id: newId(), type: adding, label: TYPES.find((t) => t.type === adding)!.label, required: false };
    if (adding === "select") base.options = ["Opzione 1", "Opzione 2"];
    if (adding === "seats") { base.label = "Quante persone?"; base.required = true; base.min = 1; base.max = 4; }
    setFields((fs) => [...fs, base]);
  };
  const hasSeats = fields.some((f) => f.type === "seats");

  return (
    <div className="space-y-4">
      <input ref={hidden} type="hidden" name="formFields" value={JSON.stringify(fields)} />
      <div className="rounded-control border border-warning/30 bg-warning-soft px-4 py-3 text-[0.95rem] text-warning" role="note">
        <strong className="font-semibold">Chiedi solo ciò che serve davvero.</strong> Non raccogliere dati sensibili (salute, origine, religione, opinioni politiche, orientamento) né documenti, salvo reale necessità.
      </div>
      {version != null && (
        <p className="text-sm text-ink-soft">
          Versione attuale del modulo: <strong>{version}</strong>.{" "}
          {registrationsCount > 0
            ? `Ci sono già ${registrationsCount} iscrizioni: se modifichi i campi si crea una nuova versione e le iscrizioni già ricevute restano esattamente come sono.`
            : "Se modifichi i campi dopo che qualcuno si è iscritto, si crea una nuova versione senza toccare le iscrizioni precedenti."}
        </p>
      )}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

      <ol className="space-y-3">
        {fields.map((f, i) => {
          const locked = isLocked(f);
          const fid = `${uid}-${f.id}`;
          return (
            <li key={f.id} className="rounded-card border border-line bg-paper/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-ink-soft">{i + 1}.</span> {TYPES.find((t) => t.type === f.type)?.label}
                  {LOCKED.has(f.id) && <Badge>Sempre presente</Badge>}
                  {reserved && f.id === "requisito" && <Badge tone="terracotta">Requisito dichiarato</Badge>}
                </p>
                {!LOCKED.has(f.id) && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i <= 2} aria-label={`Sposta in su «${f.label}»`}>↑</Button>
                    <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === fields.length - 1} aria-label={`Sposta in giù «${f.label}»`}>↓</Button>
                    {!locked && <Button size="sm" variant="ghost" onClick={() => setFields((fs) => fs.filter((x) => x.id !== f.id))} aria-label={`Rimuovi «${f.label}»`}>Rimuovi</Button>}
                  </div>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${fid}-l`} className="mb-1 block text-sm font-medium">Etichetta</label>
                  <input id={`${fid}-l`} form="fb-detached" className={control} value={f.label} maxLength={160} onChange={(e) => patch(f.id, { label: e.target.value })} />
                </div>
                <div>
                  <label htmlFor={`${fid}-h`} className="mb-1 block text-sm font-medium">Testo di aiuto <span className="font-normal text-ink-soft">(facoltativo)</span></label>
                  <input id={`${fid}-h`} form="fb-detached" className={control} value={f.help ?? ""} maxLength={240} onChange={(e) => patch(f.id, { help: e.target.value })} />
                </div>
                {f.type === "select" && (
                  <div className="sm:col-span-2">
                    <label htmlFor={`${fid}-o`} className="mb-1 block text-sm font-medium">Opzioni <span className="font-normal text-ink-soft">(una per riga, almeno 2)</span></label>
                    <textarea id={`${fid}-o`} form="fb-detached" rows={4} className={control} value={(f.options ?? []).join("\n")} onChange={(e) => patch(f.id, { options: e.target.value.split("\n").slice(0, 30) })} />
                  </div>
                )}
                {f.type === "seats" && (
                  <>
                    <div>
                      <label htmlFor={`${fid}-mi`} className="mb-1 block text-sm font-medium">Minimo</label>
                      <input id={`${fid}-mi`} form="fb-detached" type="number" min={1} max={50} className={control} value={f.min ?? 1} onChange={(e) => patch(f.id, { min: Math.max(1, Number(e.target.value) || 1) })} />
                    </div>
                    <div>
                      <label htmlFor={`${fid}-ma`} className="mb-1 block text-sm font-medium">Massimo</label>
                      <input id={`${fid}-ma`} form="fb-detached" type="number" min={1} max={50} className={control} value={f.max ?? ""} onChange={(e) => patch(f.id, { max: e.target.value ? Math.max(1, Number(e.target.value)) : undefined })} />
                      <p className="mt-1 text-xs text-ink-soft">Vale anche il limite «posti per richiesta» dell&apos;evento: il più basso prevale.</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" form="fb-detached" checked={f.required} disabled={locked} onChange={(e) => patch(f.id, { required: e.target.checked })} className="size-4 accent-[var(--color-terracotta)]" />
                  Campo obbligatorio{locked && " (sempre)"}
                </label>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-end gap-3 rounded-card border border-dashed border-line-strong p-4">
        <div className="min-w-[14rem]">
          <label htmlFor={`${uid}-add`} className="mb-1 block text-sm font-medium">Aggiungi un campo</label>
          <select id={`${uid}-add`} form="fb-detached" className={control} value={adding} onChange={(e) => setAdding(e.target.value as EventFormField["type"])}>
            {TYPES.filter((t) => !(t.type === "seats" && hasSeats)).map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
        </div>
        <Button variant="secondary" onClick={add} disabled={fields.length >= 20 || (adding === "seats" && hasSeats)}>Aggiungi campo</Button>
        <p className="text-sm text-ink-soft">{fields.length} di 20 campi</p>
      </div>
    </div>
  );
}
