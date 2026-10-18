import { and, eq, like, lt, ne } from "drizzle-orm";
import { db as defaultDb, newId, schema, type Db } from "@/lib/db";
import { sendMail } from "./sender";

export type OutboxStatus = "queued" | "sent" | "failed" | "not_configured";

export type EnqueueInput = {
  /** Unique per logical message, e.g. `${template}:${registrationId}:${status}`. Retries never duplicate. */
  idempotencyKey: string;
  to: string;
  subject: string;
  text: string;
  html?: string | null;
};

export type EnqueueResult = { id: string; status: OutboxStatus; created: boolean };

/** Insert into the outbox only (no send). Returns the existing row when the key was already used. */
export async function enqueue(input: EnqueueInput, db: Db = defaultDb): Promise<EnqueueResult> {
  const id = newId();
  const inserted = await db
    .insert(schema.emailOutbox)
    .values({ id, ...input, html: input.html ?? null, status: "queued" })
    .onConflictDoNothing({ target: schema.emailOutbox.idempotencyKey })
    .returning({ id: schema.emailOutbox.id });
  if (inserted.length > 0) return { id, status: "queued", created: true };
  const [existing] = await db
    .select({ id: schema.emailOutbox.id, status: schema.emailOutbox.status })
    .from(schema.emailOutbox)
    .where(eq(schema.emailOutbox.idempotencyKey, input.idempotencyKey));
  return { id: existing!.id, status: existing!.status, created: false };
}

/**
 * Attempt delivery of one outbox row. Idempotent: rows already 'sent' are never re-sent.
 * No SMTP configured -> status 'not_configured' (never a fake "sent").
 */
export async function deliver(id: string, db: Db = defaultDb): Promise<OutboxStatus> {
  const [row] = await db.select().from(schema.emailOutbox).where(eq(schema.emailOutbox.id, id));
  if (!row) throw new Error(`Outbox row not found: ${id}`);
  if (row.status === "sent") return "sent";

  // Claim: only one concurrent deliverer proceeds past this point per attempt count.
  const claimed = await db
    .update(schema.emailOutbox)
    .set({ attempts: row.attempts + 1 })
    .where(and(eq(schema.emailOutbox.id, id), eq(schema.emailOutbox.attempts, row.attempts), ne(schema.emailOutbox.status, "sent")))
    .returning({ id: schema.emailOutbox.id });
  if (claimed.length === 0) return row.status;

  try {
    const res = await sendMail({ to: row.to, subject: row.subject, text: row.text, html: row.html });
    if (!res.sent) {
      await db.update(schema.emailOutbox).set({ status: "not_configured", lastError: "SMTP non configurato" }).where(eq(schema.emailOutbox.id, id));
      return "not_configured";
    }
    await db.update(schema.emailOutbox).set({ status: "sent", sentAt: Date.now(), lastError: null }).where(eq(schema.emailOutbox.id, id));
    return "sent";
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)).slice(0, 500);
    await db.update(schema.emailOutbox).set({ status: "failed", lastError: msg }).where(eq(schema.emailOutbox.id, id));
    return "failed";
  }
}

/** Enqueue (idempotent) and try to send right away. Never throws on delivery problems. */
export async function enqueueAndSend(input: EnqueueInput, db: Db = defaultDb): Promise<EnqueueResult> {
  const q = await enqueue(input, db);
  if (!q.created && q.status === "sent") return q;
  if (!q.created) return q; // already known: retries are explicit via retryEmail()
  const status = await deliver(q.id, db);
  return { ...q, status };
}

/** Admin "Riprova": re-attempt a failed / not_configured / queued message. */
export async function retryEmail(id: string, db: Db = defaultDb): Promise<OutboxStatus> {
  return deliver(id, db);
}

/**
 * Privacy: outbox rows hold recipient + rendered text (names, emails, messages). Delete the ones tied to one
 * entity id (idempotency keys are `<template>:<entityId>:...`), e.g. when a registration/application is erased.
 */
export async function purgeOutboxFor(entityId: string, db: Db = defaultDb): Promise<number> {
  if (!/^[a-z0-9]{10,40}$/i.test(entityId)) return 0;
  const rows = await db.delete(schema.emailOutbox).where(like(schema.emailOutbox.idempotencyKey, `%:${entityId}:%`)).returning({ id: schema.emailOutbox.id });
  return rows.length;
}

/** Privacy: drop outbox rows older than `days` (default 90). The log is for troubleshooting, not an archive. */
export async function purgeOutboxOlderThan(days = 90, db: Db = defaultDb, now = Date.now()): Promise<number> {
  const rows = await db.delete(schema.emailOutbox).where(lt(schema.emailOutbox.createdAt, now - days * 86_400_000)).returning({ id: schema.emailOutbox.id });
  return rows.length;
}
