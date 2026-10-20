"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import "./careers.css";

type Meta = { label: ReactNode; hint?: string; error?: string | null; required?: boolean };

/** Label (always visible) + control + hint + error, wired with ids and aria. */
function Shell({ id, label, hint, error, required, children }: Meta & { id: string; children: (aria: Record<string, string | boolean | undefined>) => ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className="cf-field">
      <label htmlFor={id} className="cf-label">
        {label}{" "}
        {required ? <span className="cf-req" aria-hidden="true">(obbligatorio)</span> : <span className="cf-opt">(facoltativo)</span>}
      </label>
      {children({ id, "aria-describedby": [hintId, errId].filter(Boolean).join(" ") || undefined, "aria-invalid": error ? true : undefined, "aria-required": required || undefined })}
      {hint && <p id={hintId} className="cf-hint">{hint}</p>}
      {error && <p id={errId} role="alert" className="cf-err">{error}</p>}
    </div>
  );
}

export function TextField({ label, hint, error, required, name, ...rest }: Meta & InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return <Shell id={name} {...{ label, hint, error, required }}>{(aria) => <input name={name} required={required} className="cf-control" {...aria} {...rest} />}</Shell>;
}

export function AreaField({ label, hint, error, required, name, ...rest }: Meta & TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string }) {
  return <Shell id={name} {...{ label, hint, error, required }}>{(aria) => <textarea name={name} required={required} className="cf-control" {...aria} {...rest} />}</Shell>;
}

export function ChoiceField({ label, hint, error, required, name, children, ...rest }: Meta & SelectHTMLAttributes<HTMLSelectElement> & { name: string }) {
  return <Shell id={name} {...{ label, hint, error, required }}>{(aria) => <select name={name} required={required} className="cf-control" {...aria} {...rest}>{children}</select>}</Shell>;
}

export function ConsentField({ label, error, name, ...rest }: { label: ReactNode; error?: string | null; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  const errId = error ? `${name}-err` : undefined;
  return (
    <div className="cf-field">
      <div className="cf-check">
        <input id={name} name={name} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={errId} {...rest} />
        <label htmlFor={name}>{label}</label>
      </div>
      {error && <p id={errId} role="alert" className="cf-err">{error}</p>}
    </div>
  );
}

/** File input: native control (focusable, labelled, accepts the file) under a styled stand-in with Italian text. */
export function FileField({ label, hint, error, required, name, ...rest }: Meta & Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { name: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <Shell id={name} {...{ label, hint, error, required }}>
      {(aria) => (
        <div className="cf-file" data-invalid={error ? "true" : undefined}>
          <input type="file" name={name} required={required} onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)} {...aria} {...rest} />
          <span aria-hidden="true" className="cf-pick">Scegli un file</span>
          <span aria-hidden="true" className="cf-name">{fileName ?? "Nessun file selezionato"}</span>
        </div>
      )}
    </Shell>
  );
}
