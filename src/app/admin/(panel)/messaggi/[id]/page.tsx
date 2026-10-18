import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin";
import { Button, ButtonLink, ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { adminPaths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { deleteMessageAction, setMessageStatusAction } from "../actions";

export const metadata = { title: "Messaggio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [m] = await db.select().from(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  if (!m) notFound();
  const next = m.status === "new" ? "handled" : "new";
  const reply = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "il tuo messaggio a I Locandieri"}`)}`;
  return (
    <>
      <PageHeader title={m.subject || "Messaggio dal sito"} description={<>Ricevuto il {formatDateTime(m.createdAt)}</>} actions={<StatusBadge status={m.status} />} />
      <article className="max-w-3xl rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Nome</dt><dd className="mt-1">{m.name}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Email</dt><dd className="mt-1 break-all"><a className="text-terracotta-deep underline" href={`mailto:${m.email}`}>{m.email}</a></dd></div>
        </dl>
        <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wider text-ink-soft">Messaggio</h2>
        <p className="whitespace-pre-wrap break-words text-lg">{m.message}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <ButtonLink href={reply}>Rispondi via email</ButtonLink>
          <form action={setMessageStatusAction}>
            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value={next} />
            <Button type="submit" variant="secondary">{m.status === "new" ? "Segna come gestito" : "Segna come da gestire"}</Button>
          </form>
          <ConfirmDialog triggerLabel="Elimina" triggerVariant="ghost" title="Eliminare il messaggio?" description="Il messaggio verrà cancellato definitivamente, insieme ai dati personali di chi lo ha scritto." confirmLabel="Elimina" action={deleteMessageAction} fields={{ id: m.id }} />
        </div>
      </article>
      <p className="mt-6"><Link className="text-sm underline" href={adminPaths.messages}>← Tutti i messaggi</Link></p>
    </>
  );
}
