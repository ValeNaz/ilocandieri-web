import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-card border border-dashed border-line-strong/60 bg-card px-6 py-14 text-center", className)}>
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-ink-soft">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
