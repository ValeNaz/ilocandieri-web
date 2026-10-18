"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { destroyUserSessions, requireAdmin, SESSION_COOKIE } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { rateLimit } from "@/lib/security/rateLimit";
import { sha256Hex } from "@/lib/security/hash";

const schemaPw = z
  .object({ current: z.string().min(1, "Inserisci la password attuale."), password: z.string(), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Le due password non coincidono." });

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = schemaPw.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  const policy = passwordPolicyError(parsed.data.password);
  if (policy) return actionError(policy, { password: policy });

  const rl = await rateLimit({ key: `chpw:${user.id}`, limit: 8, windowMs: 15 * 60_000 });
  if (!rl.ok) return actionError("Troppi tentativi. Riprova tra qualche minuto.");

  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
  if (!row || !(await verifyPassword(row.passwordHash, parsed.data.current))) {
    return actionError("La password attuale non è corretta.", { current: "Password non corretta." });
  }
  await db.update(schema.users).set({ passwordHash: await hashPassword(parsed.data.password) }).where(eq(schema.users.id, user.id));
  // Revoke every other session; keep this one.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await destroyUserSessions(user.id, token ? sha256Hex(token) : undefined);
  await audit(user.id, "password_changed", "user", user.id);
  return actionOk("Password aggiornata. Le altre sessioni sono state chiuse.");
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = z.object({ name: z.string().trim().max(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Nome non valido.", zodFieldErrors(parsed.error));
  await db.update(schema.users).set({ name: parsed.data.name }).where(eq(schema.users.id, user.id));
  return actionOk("Profilo salvato.");
}
