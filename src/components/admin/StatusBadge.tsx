import { Badge, type BadgeTone } from "@/components/ui/Badge";

const MAP: Record<string, { label: string; tone: BadgeTone }> = {
  // content
  draft: { label: "Bozza", tone: "warning" },
  published: { label: "Pubblicato", tone: "success" },
  hidden: { label: "Nascosto", tone: "neutral" },
  // registrations
  pending: { label: "In attesa", tone: "warning" },
  confirmed: { label: "Confermata", tone: "success" },
  rejected: { label: "Rifiutata", tone: "danger" },
  cancelled: { label: "Annullata", tone: "neutral" },
  // applications / messages
  new: { label: "Nuova", tone: "terracotta" },
  reviewing: { label: "In esame", tone: "warning" },
  archived: { label: "Archiviata", tone: "neutral" },
  handled: { label: "Gestito", tone: "success" },
  // email outbox
  queued: { label: "In coda", tone: "warning" },
  sent: { label: "Inviata", tone: "success" },
  failed: { label: "Non riuscita", tone: "danger" },
  not_configured: { label: "Email non configurata", tone: "warning" },
  // jobs
  open: { label: "Aperta", tone: "success" },
  closed: { label: "Chiusa", tone: "neutral" },
};

/** Maps any status string used in the schema to a readable Italian badge. Unknown values render as-is. */
export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? { label: status, tone: "neutral" as BadgeTone };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
