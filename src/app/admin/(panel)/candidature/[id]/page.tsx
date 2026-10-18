import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin";
import { Button, ButtonLink, Card, ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getApplication } from "@/lib/careers/admin";
import { adminPaths } from "@/lib/paths";
import { formatDateTime } from "@/lib/utils";
import { deleteApplicationAction, setStatusAction } from "../actions";

export const metadata = { title: "Candidatura" };

const STATUS_ACTIONS = [
  { status: "new", label: "Segna come nuova" },
  { status: "reviewing", label: "Metti in esame" },
  { status: "archived", label: "Archivia" },
] as const;

const fmtSize = (n: number | null) => (n == null ? "" : n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${app.email}`} className="text-terracotta-deep underline">{app.email}</a>],
    ["Telefono", app.phone ? <a key="p" href={`tel:${app.phone}`} className="text-terracotta-deep underline">{app.phone}</a> : "Non indicato"],
    ["Ambito", app.area],
    ["Posizione", app.opening ? app.opening.title : "Candidatura spontanea"],
    ["Ricevuta il", formatDateTime(app.createdAt)],
    ["Privacy", `Presa visione il ${formatDateTime(app.privacyAcceptedAt)} (versione ${app.privacyVersion})`],
  ];

  return (
    <>
      <p className="mb-3 text-sm"><Link href={adminPaths.applications} className="text-terracotta-deep underline">← Tutte le candidature</Link></p>
      <PageHeader
        title={`${app.firstName} ${app.lastName}`}
        description={<span className="inline-flex items-center gap-2">Stato attuale: <StatusBadge status={app.status} /></span>}
        actions={<ConfirmDialog triggerLabel="Elimina" triggerVariant="danger" title="Eliminare questa candidatura?" description="Verranno cancellati i dati e il CV allegato. L'operazione non si può annullare." confirmLabel="Elimina definitivamente" action={deleteApplicationAction} fields={{ id: app.id }} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-xl font-medium">Messaggio</h2>
            <p className="mt-3 whitespace-pre-wrap break-words">{app.message}</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-medium">Dati</h2>
            <dl className="mt-3 divide-y divide-line">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-sm font-medium text-ink-soft">{k}</dt>
                  <dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-xl font-medium">Curriculum</h2>
            {app.cvPath ? (
              <>
                <p className="mt-3 break-words text-sm text-ink-soft">{app.cvName} · {fmtSize(app.cvSize)}</p>
                {/* Plain link on purpose: the download is a protected route handler (attachment). */}
                <a href={adminPaths.applicationCv(app.id)} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-terracotta px-6 text-[0.95rem] font-medium text-white hover:bg-terracotta-deep">Scarica il CV</a>
              </>
            ) : (
              <p className="mt-3 text-ink-soft">Nessun CV allegato.</p>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-xl font-medium">Cambia stato</h2>
            <div className="mt-4 flex flex-col gap-2">
              {STATUS_ACTIONS.filter((s) => s.status !== app.status).map((s) => (
                <form key={s.status} action={setStatusAction}>
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="status" value={s.status} />
                  <Button type="submit" variant="secondary" className="w-full">{s.label}</Button>
                </form>
              ))}
            </div>
          </Card>
          <ButtonLink href={adminPaths.applications} variant="ghost">Torna all&rsquo;elenco</ButtonLink>
        </div>
      </div>
    </>
  );
}
