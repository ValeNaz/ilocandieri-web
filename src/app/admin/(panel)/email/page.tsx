import Link from "next/link";
import { DataTable, PageHeader } from "@/components/admin";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listAllTemplates } from "@/lib/email/admin";
import { adminPaths } from "@/lib/paths";

export const metadata = { title: "Email" };

export default async function Page() {
  await requireAdmin();
  const templates = await listAllTemplates();
  return (
    <>
      <PageHeader title="Email" description="I messaggi automatici che il sito invia a chi partecipa o si candida, e allo staff. Puoi cambiare oggetto e testo." />
      <DataTable
        caption="Modelli dei messaggi automatici"
        rows={templates}
        rowKey={(t) => t.key}
        empty={{ title: "Nessun modello disponibile", description: "I modelli vengono creati all'avvio del sito (comando db:seed)." }}
        columns={[
          { header: "Messaggio", cell: (t) => <Link href={adminPaths.emailTemplate(t.key)} className="font-medium text-terracotta-deep underline">{t.label}</Link> },
          { header: "Chi lo riceve", cell: (t) => (t.audience === "staff" ? "Staff" : "Utente") },
          { header: "Oggetto", cell: (t) => <span className="text-ink-soft">{t.subject}</span> },
          { header: "Testo", cell: (t) => (t.customized ? <Badge tone="terracotta">Modificato</Badge> : <Badge>Originale</Badge>) },
        ]}
      />
    </>
  );
}
