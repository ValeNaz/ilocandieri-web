import { desc, eq, sql } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import "./register-all";
import { renderEmail, listPlaceholders, type RenderedEmail, type TemplateContext } from "./render";
import { getDefaultTemplates } from "./templates";

export type TemplateListItem = {
  key: string;
  label: string;
  description: string;
  audience: "utente" | "staff" | "altro";
  subject: string;
  customized: boolean;
  hasDefault: boolean;
  updatedAt: number | null;
};

/** Plain-language names for the known template keys (unknown keys fall back to the key itself). */
const LABELS: Record<string, string> = {
  password_reset: "Reimposta password del pannello",
  application_received: "Candidatura: conferma a chi si candida",
  admin_new_application: "Candidatura: avviso allo staff",
  registration_confirmed: "Iscrizione confermata",
  registration_pending: "Iscrizione in attesa",
  registration_approved: "Iscrizione approvata",
  registration_rejected: "Iscrizione rifiutata",
  registration_cancelled: "Iscrizione annullata",
  admin_new_registration: "Iscrizione: avviso allo staff",
  admin_new_contact: "Messaggio contatti: avviso allo staff",
};
export const templateLabel = (key: string) => LABELS[key] ?? key.replace(/_/g, " ");
const audienceOf = (key: string): TemplateListItem["audience"] => (key.startsWith("admin_") ? "staff" : key === "password_reset" ? "staff" : "utente");

/** Union of templates registered by modules and rows stored in the DB. */
export async function listAllTemplates(d: Db = defaultDb): Promise<TemplateListItem[]> {
  const defaults = getDefaultTemplates();
  const rows = await d.select().from(schema.emailTemplates);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const keys = new Set([...Object.keys(defaults), ...byKey.keys()]);
  return [...keys]
    .sort()
    .map((key) => {
      const row = byKey.get(key);
      const def = defaults[key];
      const subject = row?.subject ?? def?.subject ?? "";
      return {
        key,
        label: templateLabel(key),
        description: def?.description ?? "",
        audience: audienceOf(key),
        subject,
        customized: Boolean(row && def && (row.subject !== def.subject || row.body !== def.body)),
        hasDefault: Boolean(def),
        updatedAt: row?.updatedAt ?? null,
      };
    });
}

export async function getTemplateForEdit(key: string, d: Db = defaultDb) {
  const def = getDefaultTemplates()[key];
  const [row] = await d.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.key, key));
  if (!row && !def) return null;
  const current = row ?? { subject: def!.subject, body: def!.body };
  // Placeholders the code actually provides = those used by the default text (+ any in the current text).
  const available = [...new Set([...listPlaceholders(`${def?.subject ?? ""}\n${def?.body ?? ""}`), ...listPlaceholders(`${current.subject}\n${current.body}`)])].sort();
  return { key, label: templateLabel(key), description: def?.description ?? "", subject: current.subject, body: current.body, defaults: def ?? null, placeholders: available, hasRow: Boolean(row) };
}

export async function saveTemplate(key: string, subject: string, body: string, d: Db = defaultDb) {
  await d
    .insert(schema.emailTemplates)
    .values({ key, subject, body, updatedAt: Date.now() })
    .onConflictDoUpdate({ target: schema.emailTemplates.key, set: { subject, body, updatedAt: Date.now() } });
}

/** Restore the module default. Returns false when the module registered none. */
export async function restoreTemplate(key: string, d: Db = defaultDb): Promise<boolean> {
  const def = getDefaultTemplates()[key];
  if (!def) return false;
  await saveTemplate(key, def.subject, def.body, d);
  return true;
}

/** Build a sample context where every placeholder shows its own name, e.g. `{{evento.titolo}}` -> "[evento.titolo]". */
export function sampleContext(placeholders: string[]): TemplateContext {
  const ctx: TemplateContext = {};
  for (const p of placeholders) {
    const parts = p.split(".");
    let cur = ctx;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) cur[part] = `[${p}]`;
      else cur = (cur[part] ??= {}) as TemplateContext;
    });
  }
  return ctx;
}

export function previewTemplate(subject: string, body: string): RenderedEmail {
  return renderEmail({ subject, body }, sampleContext(listPlaceholders(`${subject}\n${body}`)));
}

// ---------- Outbox ----------
export async function listOutbox(opts: { status?: string; limit?: number } = {}, d: Db = defaultDb) {
  const valid = ["queued", "sent", "failed", "not_configured"] as const;
  const status = valid.find((s) => s === opts.status);
  return d
    .select({
      id: schema.emailOutbox.id,
      to: schema.emailOutbox.to,
      subject: schema.emailOutbox.subject,
      status: schema.emailOutbox.status,
      attempts: schema.emailOutbox.attempts,
      createdAt: schema.emailOutbox.createdAt,
    })
    .from(schema.emailOutbox)
    .where(status ? eq(schema.emailOutbox.status, status) : undefined)
    .orderBy(desc(schema.emailOutbox.createdAt))
    .limit(opts.limit ?? 100);
}

export async function outboxCounts(d: Db = defaultDb) {
  const rows = await d.select({ status: schema.emailOutbox.status, n: sql<number>`count(*)` }).from(schema.emailOutbox).groupBy(schema.emailOutbox.status);
  const out = { queued: 0, sent: 0, failed: 0, not_configured: 0 };
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}

/** Message detail WITHOUT the body (it may contain personal data): recipient, subject, state, error. */
export async function getOutboxItem(id: string, d: Db = defaultDb) {
  const [row] = await d
    .select({
      id: schema.emailOutbox.id,
      to: schema.emailOutbox.to,
      subject: schema.emailOutbox.subject,
      status: schema.emailOutbox.status,
      attempts: schema.emailOutbox.attempts,
      lastError: schema.emailOutbox.lastError,
      sentAt: schema.emailOutbox.sentAt,
      createdAt: schema.emailOutbox.createdAt,
    })
    .from(schema.emailOutbox)
    .where(eq(schema.emailOutbox.id, id));
  return row ?? null;
}
