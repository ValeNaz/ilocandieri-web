"use client";

import { useRef } from "react";
import { Button } from "@/components/ui";

const TOOLS: { label: string; open: string; close: string; sample: string }[] = [
  { label: "Titolo", open: "<h2>", close: "</h2>", sample: "Titolo" },
  { label: "Sottotitolo", open: "<h3>", close: "</h3>", sample: "Sottotitolo" },
  { label: "Paragrafo", open: "<p>", close: "</p>", sample: "Testo" },
  { label: "Grassetto", open: "<strong>", close: "</strong>", sample: "testo" },
  { label: "Elenco", open: "<ul>\n<li>", close: "</li>\n</ul>", sample: "voce" },
  { label: "Link", open: '<a href="https://">', close: "</a>", sample: "testo del link" },
];

/** Plain textarea with insert-tag helpers (content is sanitized on the server). */
export function HtmlField({ name, label, defaultValue, rows = 18, hint, error }: { name: string; label: string; defaultValue: string; rows?: number; hint?: string; error?: string | null }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (t: (typeof TOOLS)[number]) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b) || t.sample;
    el.setRangeText(`${t.open}${sel}${t.close}`, a, b, "end");
    el.focus();
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Formattazione">
        {TOOLS.map((t) => <Button key={t.label} size="sm" variant="secondary" onClick={() => wrap(t)}>{t.label}</Button>)}
      </div>
      <textarea ref={ref} id={name} name={name} rows={rows} defaultValue={defaultValue} spellCheck
        aria-invalid={error ? true : undefined}
        className="w-full resize-y rounded-control border border-line-strong bg-card px-4 py-3 font-mono text-sm leading-relaxed focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/20" />
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
