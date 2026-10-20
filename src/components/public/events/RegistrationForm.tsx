"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { Checkbox, Input, Select, Textarea } from "@/components/ui";
import { Spinner } from "@/components/ui/Button";
import "../liste/liste.css";
import { submitRegistration, type RegistrationFormState } from "@/app/(public)/eventi/[slug]/actions";
import type { EventFormField } from "@/lib/db/schema";

type Props = {
  slug: string;
  eventId: string;
  formVersionId: string;
  fields: EventFormField[];
  intro: string;
  button: string;
  /** Declared rule: pending requests keep their seats (or do not). Shown only for approval/reserved events. */
  seatsNotice?: string | null;
  criteria?: string | null;
  privacyNote?: string | null;
  privacyHref: string;
  token: string;
  tokenField: string;
  honeypotField: string;
  /** Remaining seats to display (limited events only). */
  remaining: number | null;
  maxSeats: number;
  messages: { confirmed: string; pending: string };
};

type Live = { state: string; remaining: number | null; message: string | null };

export function RegistrationForm(p: Props) {
  const [state, action, pending] = useActionState<RegistrationFormState, FormData>(submitRegistration, null);
  const [live, setLive] = useState<Live>({ state: "open", remaining: p.remaining, message: null });
  const feedback = useRef<HTMLDivElement>(null);

  // Keep "posti disponibili" fresh while the page is open.
  useEffect(() => {
    if (p.remaining == null) return;
    let stop = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch(`/api/eventi/${encodeURIComponent(p.slug)}/disponibilita`, { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as Live;
        if (!stop) setLive(j);
      } catch { /* offline: keep last value */ }
    };
    const id = setInterval(tick, 20_000);
    return () => { stop = true; clearInterval(id); };
  }, [p.slug, p.remaining]);

  // Move focus to the outcome so screen-reader and keyboard users notice it.
  useEffect(() => {
    if (state) feedback.current?.focus();
  }, [state]);

  if (state?.ok) {
    const confirmed = state.status === "confirmed";
    return (
      <div className={confirmed ? "cut cut-yellow" : "cut cut-orange"} role="status">
        <div ref={feedback} tabIndex={-1} className="outline-none">
          <h3 className="t-head">{confirmed ? "Iscrizione confermata" : "Richiesta ricevuta"}</h3>
          <p className="mt-3 text-lg">{state.message}</p>
          {!confirmed && <p className="mt-3">Ti scriveremo all&apos;indirizzo email che hai indicato non appena avremo valutato la richiesta.</p>}
        </div>
      </div>
    );
  }

  if (live.state !== "open") {
    return (
      <div className="cut cut-orange" role="status">
        <p className="text-lg font-bold">{live.message ?? "Le iscrizioni non sono più disponibili."}</p>
      </div>
    );
  }

  const errors = state?.fieldErrors ?? {};
  const vals = state?.values ?? {};
  const seatsCap = Math.min(p.maxSeats, live.remaining ?? p.maxSeats);

  return (
    <form action={action} className="cut cut-white pf space-y-6" noValidate={false} aria-describedby="form-intro">
      <div>
        <p id="form-intro" className="text-lg font-bold">{p.intro}</p>
        {p.criteria && <p className="pf-note mt-3 bg-[var(--c-orange)]"><strong className="font-bold">Riservato a:</strong> {p.criteria}</p>}
        {p.seatsNotice && <p className="mt-3 text-sm">{p.seatsNotice}</p>}
        {live.remaining != null && (
          <p className="bd bd-green mt-3 !min-h-9 !px-4 !text-sm" aria-live="polite">
            Posti disponibili: {live.remaining}
          </p>
        )}
      </div>

      {state && !state.ok && (
        <div ref={feedback} tabIndex={-1} role="alert" className="pf-note bg-danger-soft text-danger outline-none">
          <p className="font-semibold">{state.message}</p>
        </div>
      )}

      <input type="hidden" name="_event" value={p.eventId} />
      <input type="hidden" name="_version" value={p.formVersionId} />
      <input type="hidden" name={p.tokenField} value={p.token} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Lascia vuoto questo campo<input type="text" name={p.honeypotField} tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2" key={state?.nonce ?? 0}>
        {p.fields.map((f) => {
          const common = { name: f.id, label: f.label, hint: f.help, error: errors[f.id] };
          const wide = f.type === "textarea" || f.type === "checkbox";
          return (
            <div key={f.id} className={wide ? "sm:col-span-2" : undefined}>
              {f.type === "textarea" && <Textarea {...common} required={f.required} rows={4} maxLength={2000} defaultValue={vals[f.id] ?? ""} />}
              {f.type === "select" && (
                <Select {...common} required={f.required} defaultValue={vals[f.id] ?? ""}>
                  <option value="">Scegli…</option>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              )}
              {f.type === "checkbox" && <Checkbox name={f.id} label={f.required ? `${f.label} (obbligatorio)` : f.label} hint={f.help} error={errors[f.id]} required={f.required} defaultChecked={vals[f.id] === "on"} />}
              {f.type === "seats" && <Input {...common} required={f.required} type="number" inputMode="numeric" min={Math.max(1, f.min ?? 1)} max={Math.max(1, Math.min(f.max ?? seatsCap, seatsCap))} step={1} defaultValue={vals[f.id] ?? String(Math.max(1, f.min ?? 1))} />}
              {(f.type === "text" || f.type === "email" || f.type === "phone") && (
                <Input {...common} required={f.required} type={f.type === "phone" ? "tel" : f.type === "email" ? "email" : "text"} autoComplete={f.id === "name" ? "name" : f.type === "email" ? "email" : f.type === "phone" ? "tel" : "off"} maxLength={f.id === "name" ? 120 : 254} defaultValue={vals[f.id] ?? ""} />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t-2 border-dashed border-ink pt-5">
        {p.privacyNote && <p className="text-sm">{p.privacyNote}</p>}
        <Checkbox
          name="_privacy"
          required
          error={errors._privacy}
          defaultChecked={vals._privacy === "on"}
          label={<>Ho letto l&apos;<Link href={p.privacyHref} target="_blank">informativa privacy<span className="sr-only"> (si apre in una nuova scheda)</span></Link> (obbligatorio)</>}
        />
      </div>

      <button type="submit" disabled={pending} aria-busy={pending || undefined} className="pill pill-solid pf-submit w-full sm:w-auto">
        {pending && <Spinner />}
        {p.button} {!pending && <span className="arrow" aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
