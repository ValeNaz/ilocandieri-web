"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";

/**
 * Destructive-action confirmation using a native <dialog> (no alert()).
 * Renders a trigger button; confirming submits `action` (a server action) with the given hidden fields.
 *
 *   <ConfirmDialog triggerLabel="Elimina" title="Eliminare la news?" description="..." action={deleteNews} fields={{ id }} />
 */
export function ConfirmDialog({
  triggerLabel, title, description, confirmLabel = "Conferma", cancelLabel = "Annulla", action, fields = {}, triggerVariant = "ghost", destructive = true, triggerClassName,
}: {
  triggerLabel: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  triggerVariant?: ButtonVariant;
  destructive?: boolean;
  triggerClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  return (
    <>
      <Button size="sm" variant={triggerVariant} className={triggerClassName} onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </Button>
      <dialog ref={ref} aria-labelledby={titleId} aria-describedby={description ? descId : undefined}
        className="m-auto w-[min(92vw,28rem)] rounded-card border border-line bg-card p-0 text-ink shadow-pop open:animate-[reveal_.25s_ease-out]"
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <form action={action} onSubmit={() => ref.current?.close()} className="space-y-5 p-7">
          {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <h2 id={titleId} className="font-display text-2xl font-medium">{title}</h2>
          {description && <p id={descId} className="text-ink-soft">{description}</p>}
          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={() => ref.current?.close()} autoFocus>{cancelLabel}</Button>
            <Button type="submit" variant={destructive ? "danger" : "primary"}>{confirmLabel}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
