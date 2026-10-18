"use client";

import { useState } from "react";
import { INTERNAL_LINK_OPTIONS, type Cta } from "@/lib/content/blocks";

const CUSTOM = "__custom";
const control = "w-full rounded-control border border-line-strong bg-card px-4 py-3 text-base text-ink focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/20 aria-[invalid=true]:border-danger";

/** Button editor: label + destination (site page, or an https://, mailto: or tel: address). Empty label+address = no button. */
export function CtaField({ name, label, defaultValue, hint, labelError, hrefError }: { name: string; label: string; defaultValue: Cta | null; hint?: string; labelError?: string; hrefError?: string }) {
  const initialHref = defaultValue?.href ?? "";
  const known = INTERNAL_LINK_OPTIONS.some((o) => o.value === initialHref);
  const [choice, setChoice] = useState(initialHref === "" ? "" : known ? initialHref : CUSTOM);
  const [custom, setCustom] = useState(known ? "" : initialHref);
  const href = choice === CUSTOM ? custom : choice;
  return (
    <fieldset className="space-y-3 rounded-control border border-line p-4">
      <legend className="px-1 text-sm font-medium">{label} <span className="font-normal text-ink-soft">(facoltativo)</span></legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${name}-label`} className="block text-sm text-ink-soft">Testo del pulsante</label>
          <input id={`${name}-label`} name={`${name}.label`} defaultValue={defaultValue?.label ?? ""} maxLength={60} className={control} aria-invalid={labelError ? true : undefined} />
          {labelError && <p role="alert" className="text-sm font-medium text-danger">{labelError}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${name}-choice`} className="block text-sm text-ink-soft">Dove porta</label>
          <select id={`${name}-choice`} value={choice} onChange={(e) => setChoice(e.target.value)} className={control}>
            <option value="">Nessun pulsante</option>
            {INTERNAL_LINK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            <option value={CUSTOM}>Altro indirizzo (https://, mailto:, tel:)</option>
          </select>
        </div>
      </div>
      {choice === CUSTOM && (
        <div className="space-y-1.5">
          <label htmlFor={`${name}-custom`} className="block text-sm text-ink-soft">Indirizzo</label>
          <input id={`${name}-custom`} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="https://…" className={control} aria-invalid={hrefError ? true : undefined} />
        </div>
      )}
      <input type="hidden" name={`${name}.href`} value={href} />
      {hrefError && <p role="alert" className="text-sm font-medium text-danger">{hrefError}</p>}
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </fieldset>
  );
}
