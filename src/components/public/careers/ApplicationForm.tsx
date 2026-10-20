"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { AreaField, ChoiceField, ConsentField, FileField, TextField } from "./Fields";
import { submitApplicationAction, type ApplyState } from "@/app/(public)/lavora-con-noi/actions";
import { paths } from "@/lib/paths";

const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  areas: readonly string[];
  openings: { id: string; title: string }[];
  defaultOpeningId?: string;
  confirmation: string;
  cta: string;
  /** Hidden antispam inputs rendered by the server component (token + honeypot). */
  guard: ReactNode;
};

export function ApplicationForm({ areas, openings, defaultOpeningId, confirmation, cta, guard }: Props) {
  const [state, dispatch, pending] = useActionState<ApplyState, FormData>(submitApplicationAction, null);
  const [clientFileError, setClientFileError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const fe = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div role="status" className="grid items-center gap-6 sm:grid-cols-[8rem_1fr]">
        <LogoMark build className="h-auto w-28 sm:w-full" />
        <p className="t-head">{confirmation}</p>
      </div>
    );
  }

  // Submit through a transition (not the form `action` prop) so React does not reset the form,
  // which would drop the chosen CV file after a validation error.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("cv");
    if (file instanceof File && file.size > MAX_BYTES) {
      setClientFileError("Il file supera il limite di 5 MB.");
      return;
    }
    setClientFileError(null);
    startTransition(() => dispatch(fd));
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const errorCount = Object.keys(fe).length + (clientFileError ? 1 : 0);

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-7" aria-busy={pending || undefined} encType="multipart/form-data">
      {guard}
      <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="polite">
        {state && !state.ok && state.message && (
          <p role="alert" className="cf-summary">
            {state.message}
            {errorCount > 1 ? ` (${errorCount} campi da correggere)` : ""}
          </p>
        )}
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <TextField name="firstName" label="Nome" required autoComplete="given-name" maxLength={80} error={fe.firstName} />
        <TextField name="lastName" label="Cognome" required autoComplete="family-name" maxLength={80} error={fe.lastName} />
        <TextField name="email" type="email" label="Email" required autoComplete="email" maxLength={200} error={fe.email} />
        <TextField name="phone" type="tel" label="Telefono" autoComplete="tel" maxLength={30} error={fe.phone} />
      </div>

      <ChoiceField name="area" label="Ambito di interesse" required defaultValue="" error={fe.area}>
        <option value="" disabled>Scegli un ambito</option>
        {areas.map((a) => <option key={a} value={a}>{a}</option>)}
      </ChoiceField>

      {openings.length > 0 && (
        <ChoiceField name="openingId" label="Posizione" defaultValue={defaultOpeningId ?? ""} error={fe.openingId} hint="Scegli una posizione aperta oppure lascia «Candidatura spontanea».">
          <option value="">Candidatura spontanea</option>
          {openings.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
        </ChoiceField>
      )}

      <AreaField name="message" label="Messaggio" required rows={6} maxLength={4000} error={fe.message}
        hint="Raccontaci chi sei, la tua esperienza e cosa ti interessa." />

      <FileField name="cv" label="Curriculum (CV)" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hint="PDF, DOC o DOCX, massimo 5 MB." error={fe.cv ?? clientFileError} />

      <ConsentField name="privacy" error={fe.privacy}
        label={<>Ho letto l&rsquo;<Link href={paths.privacy} target="_blank">informativa privacy<span className="sr-only"> (si apre in una nuova scheda)</span></Link> e acconsento al trattamento dei miei dati per valutare la candidatura.</>} />

      <div>
        <button type="submit" disabled={pending} aria-busy={pending || undefined} className="pill pill-solid cf-submit">{pending ? "Invio in corso…" : cta}{!pending && <span className="arrow" aria-hidden="true">→</span>}</button>
      </div>
    </form>
  );
}
