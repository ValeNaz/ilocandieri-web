import Link from "next/link";
import { DataTable, PageHeader, StatusBadge } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { listOutbox, outboxCounts } from "@/lib/email/admin";
import { adminPaths } from "@/lib/paths";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Registro degli invii" };

const TABS = [
  { value: "", label: "Tutte" },
  { value: "failed", label: "Non riuscite" },
  { value: "not_configured", label: "Email non configurata" },
  { value: "queued", label: "In coda" },
  { value: "sent", label: "Inviate" },
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ stato?: string }> }) {
  await requireAdmin();
  const { stato } = await searchParams;
  const [rows, counts] = await Promise.all([listOutbox({ status: stato }), outboxCounts()]);
  const total = counts.queued + counts.sent + counts.failed + counts.not_configured;
  return (
    <>
      <PageHeader title="Registro degli invii" description="Tutte le email che il sito ha provato a inviare. Quelle non riuscite si possono rimandare." />
      <nav aria-label="Filtra per stato" className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = (stato ?? "") === t.value;
          const n = t.value === "" ? total : counts[t.value];
          return (
            <Link key={t.value} href={t.value ? `${adminPaths.emailOutbox}?stato=${t.value}` : adminPaths.emailOutbox} aria-current={active ? "page" : undefined}
              className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-terracotta bg-terracotta-soft text-terracotta-deep" : "border-line-strong bg-card hover:bg-paper-deep")}>
              {t.label}<span className="rounded-full bg-paper-deep px-2 text-xs text-ink-soft">{n}</span>
            </Link>
          );
        })}
      </nav>
      <DataTable
        caption="Email in uscita"
        rows={rows}
        rowKey={(r) => r.id}
        empty={{ title: "Nessuna email in questo elenco", description: "Quando il sito invierà messaggi (iscrizioni, candidature…) compariranno qui." }}
        columns={[
          { header: "Data", cell: (r) => formatDateTime(r.createdAt) },
          { header: "Destinatario", cell: (r) => <span className="break-all">{r.to}</span> },
          { header: "Oggetto", cell: (r) => <Link href={adminPaths.emailOutboxItem(r.id)} className="text-terracotta-deep underline">{r.subject}</Link> },
          { header: "Stato", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </>
  );
}
