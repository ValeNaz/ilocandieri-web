import type { ReactNode } from "react";

/** Label wrapper for custom controls (rich-text editor, media picker...). For native inputs use <Input/> etc. */
export function FormField({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string | null; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5" role="group" aria-labelledby={`${id}-label`} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}>
      <span id={`${id}-label`} className="block text-sm font-medium">
        {label}
        {required ? <span className="text-terracotta-deep" aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {hint && <p id={`${id}-hint`} className="text-sm text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
