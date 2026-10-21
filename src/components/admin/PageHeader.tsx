import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(1.75rem,3.2vw,2.3rem)] font-semibold leading-tight tracking-[-0.01em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.97rem] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  );
}
