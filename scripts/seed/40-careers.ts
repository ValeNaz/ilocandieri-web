import type { SeedFn } from "../seed-types";
import "../../src/lib/careers/emails";
import { getDefaultTemplates } from "../../src/lib/email/templates";

/** Careers seed: ONLY the default email templates. No applications, no job openings (nothing invented). */
const seed: SeedFn = async ({ db, schema, log }) => {
  const defaults = getDefaultTemplates();
  let n = 0;
  for (const key of ["application_received", "admin_new_application"]) {
    const t = defaults[key];
    if (!t) continue;
    const r = await db.insert(schema.emailTemplates).values({ key, subject: t.subject, body: t.body }).onConflictDoNothing({ target: schema.emailTemplates.key }).returning({ key: schema.emailTemplates.key });
    n += r.length;
  }
  log(`careers: ${n} email templates inserted`);
};

export default seed;
