import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { adminPaths } from "@/lib/paths";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Messaggi contatti" };

const FILTERS = [["", "Tutti"], ["new", "Da gestire"], ["handled", "Gestiti"]] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ stato?: string }> }) {
  await requireAdmin();
  const { stato } = await searchParams;
  const status = stato === "new" || stato === "handled" ? stato : "";
  const rows = await db.select().from(schema.contactMessages).where(status ? eq(schema.contactMessages.status, status) : undefined).orderBy(desc(schema.contactMessages.createdAt));
  return (
    <>
      <PageHeader title="Messaggi contatti" description="Messaggi arrivati dal modulo contatti del sito." />
      <nav aria-label="Filtra per stato" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([v, l]) => (
          <Link key={v} href={v ? `${adminPaths.messages}?stato=${v}` : adminPaths.messages} aria-current={status === v ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", status === v ? "border-ink bg-ink text-paper" : "border-line-strong hover:bg-paper-deep")}>{l}</Link>
        ))}
      </nav>
      <DataTable
        caption="Messaggi ricevuti dal modulo contatti"
        rows={rows}
        rowKey={(r) => r.id}
        empty={{ title: "Nessun messaggio", description: status ? "Non ci sono messaggi con questo stato." : "Quando qualcuno scriverà dal modulo contatti, il messaggio comparirà qui." }}
        columns={[
          { header: "Ricevuto", cell: (r) => <span className="whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
          { header: "Da", cell: (r) => <><span className="font-medium">{r.name}</span><br /><span className="text-sm text-ink-soft">{r.email}</span></> },
          { header: "Messaggio", cell: (r) => <Link className="font-medium text-terracotta-deep underline" href={adminPaths.message(r.id)}>{r.subject || r.message.slice(0, 60)}{!r.subject && r.message.length > 60 ? "…" : ""}</Link> },
          { header: "Stato", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </>
  );
}
