"use client";

import { useActionState } from "react";
import { SaveBar } from "@/components/admin";
import { Button, Input, Textarea } from "@/components/ui";
import { previewTemplateAction, saveTemplateAction, type PreviewState } from "../../actions";
import type { ActionState } from "@/lib/actions";

export function TemplateEditor({ tkey, subject, body, placeholders }: { tkey: string; subject: string; body: string; placeholders: string[] }) {
  const [state, save] = useActionState<ActionState, FormData>(saveTemplateAction, null);
  const [preview, runPreview, previewing] = useActionState<PreviewState, FormData>(previewTemplateAction, null);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <form action={save} className="space-y-5">
        <input type="hidden" name="key" value={tkey} />
        <Input name="subject" label="Oggetto" required defaultValue={subject} maxLength={200} error={state?.fieldErrors?.subject} />
        <Textarea name="body" label="Testo del messaggio" required rows={16} defaultValue={body} maxLength={8000} error={state?.fieldErrors?.body}
          hint="Testo semplice. Le parti tra doppie graffe, come {{candidato.nome}}, vengono sostituite automaticamente." className="font-mono text-[0.95rem]" />
        <SaveBar
          state={state}
          sticky={false}
          extra={<Button type="submit" variant="secondary" formAction={runPreview} pending={previewing}>Anteprima</Button>}
        />
      </form>
      <aside className="space-y-6">
        <section aria-labelledby="ph" className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="ph" className="font-display text-lg font-medium">Dati che puoi inserire</h2>
          {placeholders.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Questo messaggio non usa dati variabili.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {placeholders.map((p) => (
                <li key={p}><code className="rounded-full border border-line bg-paper px-2.5 py-1 text-sm">{`{{${p}}}`}</code></li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="pv" aria-live="polite" className="rounded-card border border-line bg-card p-5 shadow-card">
          <h2 id="pv" className="font-display text-lg font-medium">Anteprima</h2>
          {preview ? (
            <div className="mt-3 space-y-3 text-sm">
              <p><span className="text-ink-soft">Oggetto:</span> <strong>{preview.subject}</strong></p>
              <pre className="whitespace-pre-wrap break-words rounded-control bg-paper p-4 font-sans text-[0.95rem] leading-relaxed">{preview.text}</pre>
              <p className="text-ink-soft">I dati tra parentesi quadre verranno sostituiti con quelli reali.</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Premi «Anteprima» per vedere come apparirà il messaggio, senza salvarlo.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
