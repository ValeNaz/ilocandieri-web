import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-card border border-dashed border-line-strong bg-card/60 px-6 py-14 text-center", className)}>
      <svg aria-hidden="true" viewBox="0 0 48 48" className="mb-5 size-12 text-arancio">
        <circle cx="24" cy="24" r="17" fill="currentColor" />
        <circle cx="24" cy="24" r="13" fill="none" stroke="#fbf6ec" strokeOpacity=".7" strokeWidth="1.5" />
        <path d="M24 11v26M11 24h26M14.8 14.8l18.4 18.4M33.2 14.8 14.8 33.2" stroke="#fbf6ec" strokeOpacity=".7" strokeWidth="1.5" />
      </svg>
      <h3 className="font-display text-2xl font-medium">{title}</h3>
      {description && <p className="mt-2 max-w-md text-ink-soft">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
