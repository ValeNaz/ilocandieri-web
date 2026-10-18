import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin";
import { ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getTemplateForEdit } from "@/lib/email/admin";
import { adminPaths } from "@/lib/paths";
import { restoreTemplateAction } from "../../actions";
import { TemplateEditor } from "./TemplateEditor";

export const metadata = { title: "Modello email" };

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin();
  const { key } = await params;
  const t = await getTemplateForEdit(decodeURIComponent(key));
  if (!t) notFound();
  const modified = t.defaults ? t.defaults.subject !== t.subject || t.defaults.body !== t.body : false;
  return (
    <>
      <p className="mb-3 text-sm"><Link href={adminPaths.email} className="text-terracotta-deep underline">← Tutti i modelli</Link></p>
      <PageHeader
        title={t.label}
        description={t.description || undefined}
        actions={
          t.defaults && modified ? (
            <ConfirmDialog triggerLabel="Ripristina il testo originale" triggerVariant="secondary" destructive={false} title="Ripristinare il testo originale?" description="Oggetto e testo torneranno a quelli predefiniti: le tue modifiche andranno perse." confirmLabel="Ripristina" action={restoreTemplateAction} fields={{ key: t.key }} />
          ) : undefined
        }
      />
      <TemplateEditor tkey={t.key} subject={t.subject} body={t.body} placeholders={t.placeholders} />
    </>
  );
}
