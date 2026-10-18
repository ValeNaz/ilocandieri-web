import { and, eq, gt, isNull } from "drizzle-orm";
import { db, newId, schema } from "@/lib/db";
import { getSiteUrl, isProd } from "@/lib/env";
import { sendTemplatedEmail } from "@/lib/email";
import { adminPaths } from "@/lib/paths";
import { randomToken, sha256Hex } from "@/lib/security/hash";
import { hashPassword, passwordPolicyError } from "./password";
import { destroyUserSessions } from "./session";

const RESET_TTL_MS = 3600_000;

/** Create a reset token + enqueue the email. Silent when the email is unknown (no user enumeration). */
export async function requestPasswordReset(emailRaw: string): Promise<void> {
  const email = emailRaw.trim().toLowerCase();
  const [user] = await db.select().from(schema.users).where(and(eq(schema.users.email, email), eq(schema.users.active, true)));
  if (!user) return;
  const token = randomToken(32);
  const resetId = newId();
  await db.insert(schema.passwordResets).values({
    id: resetId,
    userId: user.id,
    tokenHash: sha256Hex(token),
    expiresAt: Date.now() + RESET_TTL_MS,
  });
  const link = `${getSiteUrl()}${adminPaths.reset(token)}`;
  const res = await sendTemplatedEmail({
    template: "password_reset",
    to: user.email,
    idempotencyKey: `password_reset:${resetId}`,
    ctx: { utente: { nome: user.name || user.email }, link },
  });
  if (!isProd() && res.status !== "sent") console.warn(`[dev] Password reset link (email ${res.status}): ${link}`);
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.passwordResets.id })
    .from(schema.passwordResets)
    .where(and(eq(schema.passwordResets.tokenHash, sha256Hex(token)), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, Date.now())));
  return !!row;
}

export type ResetResult = { ok: true } | { ok: false; error: string };

/** Consume a token (single use) and set the new password; all sessions of the user are revoked. */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<ResetResult> {
  const policy = passwordPolicyError(newPassword);
  if (policy) return { ok: false, error: policy };
  const hashed = sha256Hex(token);
  // Atomic claim: only one request can flip usedAt from NULL.
  const claimed = await db
    .update(schema.passwordResets)
    .set({ usedAt: Date.now() })
    .where(and(eq(schema.passwordResets.tokenHash, hashed), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, Date.now())))
    .returning({ userId: schema.passwordResets.userId });
  const userId = claimed[0]?.userId;
  if (!userId) return { ok: false, error: "Il link non è valido o è scaduto. Richiedine uno nuovo." };
  await db.update(schema.users).set({ passwordHash: await hashPassword(newPassword) }).where(eq(schema.users.id, userId));
  await destroyUserSessions(userId);
  return { ok: true };
}
