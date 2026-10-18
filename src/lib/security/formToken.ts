import { hmacHex, safeEqual } from "./hash";

/** Name of the honeypot input. Must be rendered hidden (see <BotGuard />) and left empty by humans. */
export const HONEYPOT_FIELD = "website_url";
/** Name of the hidden input carrying the signed timing token. */
export const FORM_TOKEN_FIELD = "_ft";

const DEFAULT_MIN_MS = 3_000;
const DEFAULT_MAX_MS = 2 * 3600_000;

/** Issue a token `${issuedAtMs}.${hmac}` signed with APP_SECRET. Render in a hidden input. */
export function issueFormToken(now = Date.now(), scope = "form"): string {
  const t = String(now);
  return `${t}.${hmacHex(`ft:${scope}:${t}`)}`;
}

export type FormTokenCheck = { ok: true } | { ok: false; reason: "missing" | "invalid" | "too_fast" | "expired" };

export function verifyFormToken(
  token: string | null | undefined,
  opts: { now?: number; minMs?: number; maxMs?: number; scope?: string } = {},
): FormTokenCheck {
  if (!token) return { ok: false, reason: "missing" };
  const [t, sig] = token.split(".");
  if (!t || !sig || !/^\d{10,16}$/.test(t)) return { ok: false, reason: "invalid" };
  if (!safeEqual(sig, hmacHex(`ft:${opts.scope ?? "form"}:${t}`))) return { ok: false, reason: "invalid" };
  const age = (opts.now ?? Date.now()) - Number(t);
  if (age < (opts.minMs ?? DEFAULT_MIN_MS)) return { ok: false, reason: "too_fast" };
  if (age > (opts.maxMs ?? DEFAULT_MAX_MS)) return { ok: false, reason: "expired" };
  return { ok: true };
}

/** Honeypot check: true when the trap field is empty (human). */
export function honeypotPassed(data: FormData | Record<string, unknown>): boolean {
  const v = data instanceof FormData ? data.get(HONEYPOT_FIELD) : data[HONEYPOT_FIELD];
  return v == null || String(v).trim() === "";
}

/**
 * Combined bot check for public forms (server side). Usage in a server action:
 *   const bot = checkBot(formData); if (!bot.ok) return { error: "Invio non valido, riprova." };
 */
export function checkBot(
  data: FormData,
  opts: { now?: number; minMs?: number; scope?: string } = {},
): { ok: true } | { ok: false; reason: string } {
  if (!honeypotPassed(data)) return { ok: false, reason: "honeypot" };
  const res = verifyFormToken(String(data.get(FORM_TOKEN_FIELD) ?? ""), opts);
  return res.ok ? { ok: true } : { ok: false, reason: res.reason };
}
