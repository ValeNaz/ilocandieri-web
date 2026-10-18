import { z } from "zod";
import { db, newId, schema } from "@/lib/db";
import { sendTemplatedEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/env";
import { adminPaths } from "@/lib/paths";
import { checkBot, hashIp, issueFormToken, rateLimit } from "@/lib/security";
import { getSetting } from "@/lib/settings";
import "./email-templates";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Scrivi il tuo nome.").max(100, "Massimo 100 caratteri."),
  email: z.string().trim().toLowerCase().email("Inserisci un indirizzo email valido.").max(160),
  subject: z.string().trim().max(150, "Massimo 150 caratteri.").default(""),
  message: z.string().trim().min(10, "Scrivi almeno qualche parola (minimo 10 caratteri).").max(3000, "Massimo 3000 caratteri."),
  privacy: z.literal("on", { error: "Per inviare il messaggio devi prendere visione dell'informativa privacy." }),
});

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Signed timing token rendered in the form (min-time antispam). */
export const issueContactToken = () => issueFormToken(Date.now(), "contact");

export const CONTACT_LIMIT = { limit: 5, windowMs: 3600_000 } as const;
export const CONTACT_MIN_MS = 3000;
const GENERIC_BOT_ERROR = "Non siamo riusciti a inviare il messaggio. Ricarica la pagina e riprova.";

/**
 * Public contact form handler (framework independent for testing).
 * Order: honeypot + signed timing token -> rate limit per hashed IP -> zod -> store -> notify (best effort).
 */
export async function submitContact(formData: FormData, ip: string, opts: { now?: number } = {}): Promise<ContactResult> {
  const bot = checkBot(formData, { scope: "contact", minMs: CONTACT_MIN_MS, now: opts.now });
  if (!bot.ok) return { ok: false, message: GENERIC_BOT_ERROR };

  const ipHash = hashIp(ip);
  const rl = await rateLimit({ key: `contact:${ipHash}`, ...CONTACT_LIMIT });
  if (!rl.ok) return { ok: false, message: "Hai inviato molti messaggi in poco tempo. Riprova più tardi oppure scrivici via email." };

  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    privacy: formData.get("privacy") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "_")] ??= i.message;
    return { ok: false, message: "Controlla i campi evidenziati.", fieldErrors };
  }

  const d = parsed.data;
  const id = newId();
  await db.insert(schema.contactMessages).values({ id, name: d.name, email: d.email, subject: d.subject, message: d.message, ipHash });

  // Notification is best effort: the message is already saved and visible in the admin.
  try {
    const { contactsTo } = await getSetting("notifications");
    for (const to of contactsTo) {
      await sendTemplatedEmail({
        template: "admin_new_contact",
        to,
        idempotencyKey: `admin_new_contact:${id}:${to}`,
        ctx: { messaggio: { nome: d.name, email: d.email, oggetto: d.subject || "(nessun oggetto)", testo: d.message }, link: `${getSiteUrl()}${adminPaths.message(id)}` },
      });
    }
  } catch (e) {
    console.error("[contact] notification failed", e instanceof Error ? e.message : "unknown");
  }
  return { ok: true, message: "Grazie, il tuo messaggio è stato inviato. Ti risponderemo il prima possibile." };
}
