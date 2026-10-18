"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, Spinner } from "@/components/ui/Button";
import type { ActionState } from "@/lib/actions";
import { cn } from "@/lib/utils";

/**
 * Sticky save bar for admin forms. Place INSIDE the <form>. Shows explicit state:
 * "Modifiche non salvate" (dirty) / "Salvataggio..." / "Salvato" / error message from the action state.
 *
 *   const [state, action] = useActionState(saveAction, null);
 *   <form action={action}> ...fields... <SaveBar state={state} extra={<Button variant="secondary">Anteprima</Button>} /> </form>
 */
export function SaveBar({ state, label = "Salva", extra, sticky = true }: { state: ActionState; label?: string; extra?: ReactNode; sticky?: boolean }) {
  const { pending } = useFormStatus();
  const anchor = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;
    const mark = () => setDirty(true);
    form.addEventListener("input", mark);
    form.addEventListener("change", mark);
    const warn = (e: BeforeUnloadEvent) => { if (dirtyRef.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => {
      form.removeEventListener("input", mark);
      form.removeEventListener("change", mark);
      window.removeEventListener("beforeunload", warn);
    };
  }, []);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  // A finished action resets "dirty" (state object identity changes per submission).
  const [seen, setSeen] = useState<ActionState>(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok) setDirty(false);
  }

  let status: { text: string; tone: "idle" | "dirty" | "ok" | "error" | "busy" };
  if (pending) status = { text: "Salvataggio in corso…", tone: "busy" };
  else if (state && !state.ok) status = { text: state.message ?? "Salvataggio non riuscito.", tone: "error" };
  else if (dirty) status = { text: "Modifiche non salvate", tone: "dirty" };
  else if (state?.ok) status = { text: state.message ?? "Salvato", tone: "ok" };
  else status = { text: "Nessuna modifica", tone: "idle" };

  return (
    <div ref={anchor} className={cn("mt-8 border-t border-line pt-5", sticky && "sticky bottom-0 z-30 -mx-4 mt-10 bg-card/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12")}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p role={status.tone === "error" ? "alert" : "status"} aria-live="polite"
          className={cn("flex items-center gap-2 text-sm font-medium", status.tone === "error" && "text-danger", status.tone === "ok" && "text-success", status.tone === "dirty" && "text-warning", status.tone === "idle" && "text-ink-soft")}>
          {status.tone === "busy" && <Spinner />}
          {status.text}
        </p>
        <div className="flex gap-3">
          {extra}
          <Button type="submit" pending={pending}>{label}</Button>
        </div>
      </div>
    </div>
  );
}
