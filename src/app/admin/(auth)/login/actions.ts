"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { actionError, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { dummyHash, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { adminPaths } from "@/lib/paths";
import { hashIp } from "@/lib/security/hash";
import { getClientIp } from "@/lib/security/ip";
import { rateLimit, resetRateLimit } from "@/lib/security/rateLimit";

const schemaLogin = z.object({
  email: z.string().trim().toLowerCase().email("Inserisci un indirizzo email valido."),
  password: z.string().min(1, "Inserisci la password.").max(200),
  next: z.string().optional(),
});

const GENERIC = "Email o password non corrette.";

/** Only same-site admin paths are allowed as post-login destination. */
function safeNext(next?: string): string {
  if (next && next.startsWith("/admin") && !next.startsWith("//") && !next.includes("\\") && !next.startsWith("/admin/login")) return next;
  return adminPaths.dashboard;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schemaLogin.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  const { email, password, next } = parsed.data;

  const ip = hashIp(getClientIp(await headers()));
  const byIp = await rateLimit({ key: `login:ip:${ip}`, limit: 15, windowMs: 15 * 60_000 });
  const byEmail = await rateLimit({ key: `login:email:${hashIp(email)}`, limit: 6, windowMs: 15 * 60_000 });
  if (!byIp.ok || !byEmail.ok) {
    const mins = Math.ceil(Math.max(byIp.retryAfterMs, byEmail.retryAfterMs) / 60_000);
    return actionError(`Troppi tentativi. Riprova tra ${mins} minut${mins === 1 ? "o" : "i"}.`);
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  // Always run one argon2 verification so timing does not reveal whether the account exists.
  const ok = await verifyPassword(user?.passwordHash ?? (await dummyHash()), password);
  if (!user || !user.active || !ok) return actionError(GENERIC);

  await resetRateLimit(`login:email:${hashIp(email)}`);
  await createSession(user.id);
  await audit(user.id, "login");
  redirect(safeNext(next));
}
