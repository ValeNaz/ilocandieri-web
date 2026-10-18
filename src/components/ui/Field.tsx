import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldMeta = { label: string; hint?: string; error?: string | null; required?: boolean };

const control =
  "w-full rounded-control border border-line-strong bg-card px-4 py-3 text-base text-ink placeholder:text-ink-soft " +
  "transition-[border-color,box-shadow] duration-150 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/20 " +
  "disabled:bg-paper-deep disabled:text-ink-soft aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15";

/** Label + control + hint + error wrapper with correct aria wiring. `id` defaults to `name`. */
function Wrap({ id, label, hint, error, required, quiet, children }: FieldMeta & { id: string; quiet?: boolean; children: (aria: Record<string, string | boolean | undefined>) => ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-terracotta-deep" aria-hidden="true"> *</span> : quiet ? null : <span className="font-normal text-ink-soft"> (facoltativo)</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, "aria-required": required || undefined })}
      {hint && <p id={hintId} className="text-sm text-ink-soft">{hint}</p>}
      {error && <p id={errId} role="alert" className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

export function Input({ label, hint, error, required, className, id, name, ...rest }: FieldMeta & InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return (
    <Wrap id={id ?? name} quiet={rest.readOnly || rest.disabled} {...{ label, hint, error, required }}>
      {(aria) => <input name={name} required={required} className={cn(control, className)} {...aria} {...rest} />}
    </Wrap>
  );
}

export function Textarea({ label, hint, error, required, className, id, name, rows = 5, ...rest }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string }) {
  return (
    <Wrap id={id ?? name} {...{ label, hint, error, required }}>
      {(aria) => <textarea name={name} rows={rows} required={required} className={cn(control, "resize-y", className)} {...aria} {...rest} />}
    </Wrap>
  );
}

export function Select({ label, hint, error, required, className, id, name, children, ...rest }: FieldMeta & SelectHTMLAttributes<HTMLSelectElement> & { name: string }) {
  return (
    <Wrap id={id ?? name} {...{ label, hint, error, required }}>
      {(aria) => (
        <select name={name} required={required} className={cn(control, "appearance-none bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-11", className)}
          style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%231e1912' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m5 8 5 5 5-5'/></svg>\")" }}
          {...aria} {...rest}>
          {children}
        </select>
      )}
    </Wrap>
  );
}

export function Checkbox({ label, hint, error, className, id, name, ...rest }: Omit<FieldMeta, "required"> & { label: ReactNode } & InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  const fid = id ?? name;
  const errId = error ? `${fid}-err` : undefined;
  const hintId = hint ? `${fid}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-3">
        <input id={fid} name={name} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
          className={cn("mt-1 size-5 shrink-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-card transition-colors checked:border-terracotta checked:bg-terracotta checked:bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m4.5 10.5 3.5 3.5 7.5-8'/></svg>\")] aria-[invalid=true]:border-danger", className)} {...rest} />
        <label htmlFor={fid} className="cursor-pointer text-[0.95rem] leading-snug text-ink">{label}</label>
      </div>
      {hint && <p id={hintId} className="pl-8 text-sm text-ink-soft">{hint}</p>}
      {error && <p id={errId} role="alert" className="pl-8 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
