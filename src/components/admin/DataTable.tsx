import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string; align?: "right" };

/** Simple accessible table (server component). On narrow screens it scrolls horizontally inside its card. */
export function DataTable<T>({ columns, rows, rowKey, caption, empty }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  empty: { title: string; description?: ReactNode; action?: ReactNode };
}) {
  if (rows.length === 0) return <EmptyState {...empty} />;
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card shadow-card">
      <table className="w-full min-w-[36rem] border-collapse text-left text-[0.95rem]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-paper-deep/60">
            {columns.map((c) => (
              <th key={c.header} scope="col" className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft", c.align === "right" && "text-right")}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={rowKey(r)} className="transition-colors hover:bg-paper/70">
              {columns.map((c) => (
                <td key={c.header} className={cn("px-4 py-3.5 align-middle", c.align === "right" && "text-right", c.className)}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
