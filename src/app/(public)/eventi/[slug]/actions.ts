"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { REGISTRATION_SCOPE } from "@/lib/events/constants";
import { messageFor, stateMessage } from "@/lib/events/messages";
import { register } from "@/lib/events/registrations";
import { getEventTexts } from "@/lib/events/texts";
import { getRegistrationState } from "@/lib/events/state";
import { checkBot, FORM_TOKEN_FIELD, getClientIp, hashIp, HONEYPOT_FIELD, rateLimit } from "@/lib/security";

export type RegistrationFormState = {
  ok: boolean;
  status?: "confirmed" | "pending";
  message: string;
  fieldErrors?: Record<string, string>;
  /** Echo of what the person typed, so a failed submit never wipes the form. */
  values?: Record<string, string>;
  /** Changes on every submission: forces inputs to pick up `values` again. */
  nonce: number;
} | null;

const RESERVED = new Set([FORM_TOKEN_FIELD, HONEYPOT_FIELD, "_event", "_version", "_privacy"]);

/** Public registration endpoint. EVERYTHING is re-validated server side (state, capacity, fields). */
export async function submitRegistration(_prev: RegistrationFormState, formData: FormData): Promise<RegistrationFormState> {
  const nonce = Date.now();
  const fail = (message: string, extra: Partial<NonNullable<RegistrationFormState>> = {}): RegistrationFormState => ({ ok: false, message, nonce, ...extra });

  const bot = checkBot(formData, { scope: REGISTRATION_SCOPE, minMs: 3000 });
  if (!bot.ok) {
    return fail(bot.reason === "too_fast" || bot.reason === "expired" ? "Invio troppo rapido o pagina rimasta aperta a lungo: ricarica la pagina e riprova." : "Invio non valido, riprova tra qualche istante.");
  }

  const ipHash = hashIp(getClientIp(await headers()));
  const rl = await rateLimit({ key: `event-reg:${ipHash}`, limit: 20, windowMs: 3600_000 });
  if (!rl.ok) return fail("Hai inviato troppe richieste. Riprova tra un po'.");

  const eventId = String(formData.get("_event") ?? "");
  const formVersionId = String(formData.get("_version") ?? "");
  if (!/^[a-z0-9]{10,40}$/.test(eventId)) return fail("Evento non trovato.");

  const values: Record<string, string> = {};
  const echo: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (RESERVED.has(k) || typeof v !== "string") continue;
    values[k] = v;
    if (v.length <= 2000) echo[k] = v;
  }

  if (formData.get("_privacy") === "on") echo._privacy = "on";
  if (formData.get("_privacy") !== "on") {
    return fail("Controlla i campi evidenziati.", { fieldErrors: { _privacy: "Per proseguire devi dichiarare di aver letto l'informativa privacy." }, values: echo });
  }

  const [ev] = await db.select().from(schema.events).where(eq(schema.events.id, eventId));
  if (!ev) return fail("Evento non trovato.");

  const res = await register({ eventId, formVersionId: formVersionId || null, values, ipHash, privacyAcceptedAt: Date.now() });
  const texts = await getEventTexts();
  if (!res.ok) {
    // Re-word state refusals with the page-level texts editable in admin (per-event overrides still win).
    const state = getRegistrationState(ev, Date.now());
    const message = state === "open" ? res.message : (stateMessage(ev, state, texts.messages) ?? res.message);
    return fail(message, { fieldErrors: res.fieldErrors, values: echo });
  }
  return { ok: true, status: res.status, message: messageFor(ev, res.status === "confirmed" ? "confirmed" : "pending", texts.messages), nonce };
}
