import { and, eq } from "drizzle-orm";
import { db as defaultDb, newId, schema, type Db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { sendTemplatedEmail } from "@/lib/email";
import { adminPaths } from "@/lib/paths";
import { checkBot, hashIp, rateLimit } from "@/lib/security";
import { getSetting } from "@/lib/settings";
import { getStorage, newStoredPath, safeDisplayName, validateCv } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { PRIVACY_VERSION } from "./constants";
import "./emails";
import { applicationSchema } from "./validation";

export const FORM_SCOPE = "careers";
export const RATE_LIMIT = { limit: 5, windowMs: 3600_000 } as const;

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string>; reason: "bot" | "rate" | "invalid" | "error" };

const GENERIC_BOT_MESSAGE = "Non è stato possibile inviare il modulo. Ricarica la pagina e riprova tra qualche istante.";

/**
 * Whole public submission pipeline: antispam (honeypot + timing token), rate limit per IP hash,
 * zod validation, CV validation by magic bytes, private storage, DB row, notification emails.
 * Delivery problems never fail the submission (the outbox keeps the message for retry).
 */
export async function processApplication(
  formData: FormData,
  ctx: { ip: string | null; now?: number; minMs?: number; db?: Db },
): Promise<SubmitResult> {
  const d = ctx.db ?? defaultDb;
  const now = ctx.now ?? Date.now();

  const bot = checkBot(formData, { scope: FORM_SCOPE, minMs: ctx.minMs ?? 3000, now });
  if (!bot.ok) {
    console.warn(`[careers] submission rejected by antispam: ${bot.reason}`);
    return { ok: false, reason: "bot", message: GENERIC_BOT_MESSAGE };
  }

  const ipHash = hashIp(ctx.ip);
  const rl = await rateLimit({ key: `careers:${ipHash}`, ...RATE_LIMIT, now, db: d });
  if (!rl.ok) {
    return { ok: false, reason: "rate", message: "Hai inviato troppe richieste. Riprova tra un po'." };
  }

  const parsed = applicationSchema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
  }

  // Optional job opening: must exist and be open.
  let openingId: string | null = null;
  if (parsed.success && parsed.data.openingId) {
    const [o] = await d
      .select({ id: schema.jobOpenings.id })
      .from(schema.jobOpenings)
      .where(and(eq(schema.jobOpenings.id, parsed.data.openingId), eq(schema.jobOpenings.status, "open")));
    if (!o) fieldErrors.openingId = "La posizione scelta non è più disponibile.";
    else openingId = o.id;
  }

  // Optional CV, validated on its bytes (never trust name/mime sent by the browser).
  let cv: { buffer: Buffer; ext: string; mime: string; name: string } | null = null;
  const file = formData.get("cv");
  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const v = validateCv(buffer);
    if (!v.ok) fieldErrors.cv = v.error;
    else cv = { buffer, ext: v.kind.ext, mime: v.kind.mime, name: safeDisplayName(file.name || `curriculum.${v.kind.ext}`) };
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { ok: false, reason: "invalid", message: "Controlla i campi evidenziati.", fieldErrors };
  }
  const data = parsed.data;

  const id = newId();
  let cvPath: string | null = null;
  try {
    if (cv) {
      cvPath = newStoredPath(cv.ext, new Date(now));
      await getStorage().put("private", cvPath, cv.buffer);
    }
    await d.insert(schema.applications).values({
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      area: data.area,
      openingId,
      message: data.message,
      cvPath,
      cvName: cv?.name ?? null,
      cvMime: cv?.mime ?? null,
      cvSize: cv?.buffer.length ?? null,
      privacyAcceptedAt: now,
      privacyVersion: PRIVACY_VERSION,
      status: "new",
      createdAt: now,
      ipHash,
    });
  } catch (err) {
    if (cvPath) await getStorage().remove("private", cvPath).catch(() => {});
    console.error("[careers] save failed:", err instanceof Error ? err.message : "unknown");
    return { ok: false, reason: "error", message: "Non siamo riusciti a registrare la candidatura. Riprova tra poco." };
  }

  await notifyApplication(id, d).catch((e) => console.error("[careers] email step failed:", e instanceof Error ? e.message : "unknown"));
  return { ok: true, id };
}

/** Send both emails for an application. Idempotent: keys are stable per application (and recipient). */
export async function notifyApplication(applicationId: string, d: Db = defaultDb): Promise<void> {
  const [app] = await d.select().from(schema.applications).where(eq(schema.applications.id, applicationId));
  if (!app) return;
  const org = await getSetting("org");
  await sendTemplatedEmail(
    {
      template: "application_received",
      to: app.email,
      idempotencyKey: `application_received:${app.id}:new`,
      ctx: { candidato: { nome: app.firstName }, organizzazione: { nome: org.name } },
    },
    d,
  );
  const { applicationsTo } = await getSetting("notifications");
  // Only the application area, date and an admin link: never the CV or contact data.
  for (const to of applicationsTo) {
    await sendTemplatedEmail(
      {
        template: "admin_new_application",
        to,
        idempotencyKey: `admin_new_application:${app.id}:${to.toLowerCase()}`,
        ctx: { candidatura: { ambito: app.area, data: formatDateTime(app.createdAt) }, link: `${getSiteUrl()}${adminPaths.application(app.id)}` },
      },
      d,
    );
  }
}
