"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendContactMessage, type ContactState } from "@/app/(public)/contatti/actions";
import { Checkbox, Input, Textarea } from "@/components/ui";
import { Spinner } from "@/components/ui/Button";
import { paths } from "@/lib/paths";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending || undefined} className="pill pill-solid pf-submit">{pending && <Spinner />}Invia il messaggio {!pending && <span className="arrow" aria-hidden="true">→</span>}</button>;
}

export function ContactForm({ token, tokenField }: { token: string; tokenField: string }) {
  const [state, action] = useActionState<ContactState, FormData>(sendContactMessage, null);
  const err = state && !state.ok ? state.fieldErrors : undefined;
  const v = state && !state.ok ? state.values : undefined;

  if (state?.ok) {
    return (
      <div role="status" className="cut cut-green mt-6">
        <p className="t-head">Messaggio inviato</p>
        <p className="mt-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5" noValidate>
      <input type="hidden" name={tokenField} value={token} />
      {/* Honeypot: invisible to people and assistive tech, bots fill it. */}
      <div aria-hidden="true" className="sr-only">
        <label>Non compilare questo campo<input type="text" name="website_url" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Nome e cognome" name="name" autoComplete="name" defaultValue={v?.name} required error={err?.name} maxLength={100} />
        <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={v?.email} required error={err?.email} maxLength={160} />
      </div>
      <Input label="Oggetto" name="subject" defaultValue={v?.subject} error={err?.subject} maxLength={150} />
      <Textarea label="Messaggio" name="message" rows={6} defaultValue={v?.message} required error={err?.message} maxLength={3000} />
      <Checkbox
        name="privacy"
        error={err?.privacy}
        label={<>Ho letto l&apos;<Link href={paths.privacy} >informativa privacy</Link> e acconsento al trattamento dei dati per ricevere una risposta.</>}
      />

      {state && !state.ok && !err && <p role="alert" className="pf-note bg-danger-soft text-danger font-bold">{state.message}</p>}
      <div className="pt-1"><Submit /></div>
    </form>
  );
}
