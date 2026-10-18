import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin";
import { Button, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { isEmailConfigured } from "@/lib/email";
import { getOutboxItem } from "@/lib/email/admin";
import { adminPaths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { retryEmailAction } from "../../actions";

export const metadata = { title: "Dettaglio email" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const m = await getOutboxItem(id);
  if (!m) notFound();
  const canRetry = m.status !== "sent";
  const rows: [string, React.ReactNode][] = [
    ["Stato", <StatusBadge key="s" status={m.status} />],
    ["Destinatario", <span key="t" className="break-all">{m.to}</span>],
    ["Oggetto", m.subject],
    ["Creata il", formatDateTime(m.createdAt)],
    ["Inviata il", m.sentAt ? formatDateTime(m.sentAt) : "Non ancora"],
    ["Tentativi", String(m.attempts)],
    ["Ultimo errore", m.lastError ?? "Nessuno"],
  ];
  return (
    <>
      <p className="mb-3 text-sm"><Link href={adminPaths.emailOutbox} className="text-terracotta-deep underline">← Registro degli invii</Link></p>
      <PageHeader title="Dettaglio email" description="Per tutelare la privacy il testo del messaggio non viene mostrato qui." />
      <Card className="max-w-3xl p-6">
        <dl className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm font-medium text-ink-soft">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {canRetry && (
          <form action={retryEmailAction} className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-5">
            <input type="hidden" name="id" value={m.id} />
            <Button type="submit">Riprova</Button>
            {!isEmailConfigured() && <p className="text-sm text-warning">SMTP non configurato: il tentativo non invierà nulla finché non è impostato.</p>}
          </form>
        )}
      </Card>
    </>
  );
}
