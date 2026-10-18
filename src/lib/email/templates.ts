import { eq } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import { enqueueAndSend, type EnqueueResult } from "./outbox";
import { renderEmail, type TemplateContext } from "./render";

export type DefaultTemplate = { subject: string; body: string; description?: string };

/**
 * Registry of default templates (used when the DB has no override and by the seed).
 * Other modules add theirs from their own module file via `registerDefaultTemplates()`.
 */
const defaults = new Map<string, DefaultTemplate>();

export function registerDefaultTemplates(t: Record<string, DefaultTemplate>) {
  for (const [k, v] of Object.entries(t)) defaults.set(k, v);
}
export const getDefaultTemplates = () => Object.fromEntries(defaults);

registerDefaultTemplates({
  password_reset: {
    description: "Reimpostazione password admin",
    subject: "Reimposta la password del pannello I Locandieri",
    body: `Ciao {{utente.nome}},

abbiamo ricevuto una richiesta per reimpostare la password del tuo accesso al pannello.

Apri questo link entro un'ora per scegliere una nuova password:
{{link}}

Se non sei stato tu, ignora questo messaggio: la password attuale resta valida.`,
  },
});

export async function loadTemplate(key: string, db: Db = defaultDb): Promise<DefaultTemplate> {
  const [row] = await db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.key, key));
  if (row) return { subject: row.subject, body: row.body };
  const d = defaults.get(key);
  if (!d) throw new Error(`Unknown email template: ${key}`);
  return d;
}

/**
 * Render template `key` (DB override, else default) with `ctx` and send via outbox.
 * `idempotencyKey` should follow `${template}:${entityId}:${state}`.
 */
export async function sendTemplatedEmail(
  opts: { template: string; to: string; idempotencyKey: string; ctx: TemplateContext },
  db: Db = defaultDb,
): Promise<EnqueueResult> {
  const tpl = await loadTemplate(opts.template, db);
  const r = renderEmail(tpl, opts.ctx);
  return enqueueAndSend({ idempotencyKey: opts.idempotencyKey, to: opts.to, subject: r.subject, text: r.text, html: r.html }, db);
}
