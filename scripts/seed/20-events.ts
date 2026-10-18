/**
 * EVENTS seed: ONLY the default email templates (admin can edit them later). No events, no categories:
 * the dossier forbids invented content. Idempotent, never overwrites admin edits.
 */
import "../../src/lib/events/emails"; // registers the default templates as a side effect
import { getDefaultTemplates } from "../../src/lib/email/templates";
import type { SeedFn } from "../seed-types";

const KEYS = ["registration_confirmed", "registration_pending", "registration_approved", "registration_rejected", "registration_cancelled", "admin_new_registration"];

const seed: SeedFn = async ({ db, schema, log }) => {
  const defaults = getDefaultTemplates();
  let n = 0;
  for (const key of KEYS) {
    const t = defaults[key];
    if (!t) throw new Error(`Missing default email template: ${key}`);
    const r = await db.insert(schema.emailTemplates).values({ key, subject: t.subject, body: t.body }).onConflictDoNothing({ target: schema.emailTemplates.key }).returning({ key: schema.emailTemplates.key });
    n += r.length;
  }
  log(`events: ${n} email templates inserted (no events seeded by design)`);
};

export default seed;
