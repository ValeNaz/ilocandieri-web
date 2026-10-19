"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Wrap, type FieldMeta } from "./Field";

/**
 * File field with Italian labels: the native control (whose "Choose file / No file chosen" text follows the browser
 * language) is visually hidden but stays the focusable, labelled input; a styled "Scegli un file" stands in for it.
 */
export function FileInput({ label, hint, error, required, className, id, name, onChange, ...rest }: FieldMeta & Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { name: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputId = id ?? name;
  return (
    <Wrap id={inputId} {...{ label, hint, error, required }}>
      {(aria) => (
        <div className={cn("relative flex items-center gap-4 rounded-control border border-line-strong bg-card px-3 py-2.5 has-[:focus-visible]:border-terracotta has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-terracotta/20", error && "border-danger", className)}>
          <input
            type="file"
            name={name}
            required={required}
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
            onChange={(e) => { setFileName(e.currentTarget.files?.[0]?.name ?? null); onChange?.(e); }}
            {...aria}
            {...rest}
          />
          <span aria-hidden="true" className="shrink-0 rounded-full bg-paper-deep px-4 py-2 text-sm font-medium text-ink peer-hover:bg-line">Scegli un file</span>
          <span aria-hidden="true" className="min-w-0 truncate text-sm text-ink-soft">{fileName ?? "Nessun file selezionato"}</span>
        </div>
      )}
    </Wrap>
  );
}
