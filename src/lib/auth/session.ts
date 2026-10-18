import { and, eq, gt, lt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { NextResponse } from "next/server";
import { db, newId, schema } from "@/lib/db";
import { adminPaths } from "@/lib/paths";
import { isProd } from "@/lib/env";
import { randomToken, sha256Hex } from "@/lib/security/hash";

export const SESSION_COOKIE = "il_session";
export const SESSION_TTL_MS = 7 * 24 * 3600_000;
const RENEW_AFTER_MS = 24 * 3600_000;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

export const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: "lax" as const,
  path: "/",
  expires,
});

/** Create a session row and set the cookie. Call from a server action / route handler. */
export async function createSession(userId: string): Promise<void> {
  const token = randomToken(32);
  const ua = (await headers()).get("user-agent")?.slice(0, 255) ?? null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await db.insert(schema.sessions).values({ id: newId(), userId, tokenHash: sha256Hex(token), expiresAt, userAgent: ua });
  // Cookie outlives the DB row on purpose: the DB row is the source of truth (sliding 7d expiry).
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(new Date(Date.now() + 30 * 24 * 3600_000)));
  await db.update(schema.users).set({ lastLoginAt: Date.now() }).where(eq(schema.users.id, userId));
}

/** Delete the current session (logout) and clear the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256Hex(token)));
  jar.delete(SESSION_COOKIE);
}

/** Delete every session of a user (password change/reset). Optionally keep one by token. */
export async function destroyUserSessions(userId: string, keepTokenHash?: string) {
  const rows = await db.select({ id: schema.sessions.id, h: schema.sessions.tokenHash }).from(schema.sessions).where(eq(schema.sessions.userId, userId));
  for (const r of rows) if (r.h !== keepTokenHash) await db.delete(schema.sessions).where(eq(schema.sessions.id, r.id));
}

/** Resolve a raw session token to a user (sliding expiry), or null. */
export async function resolveSession(token: string | undefined): Promise<(CurrentUser & { sessionId: string; tokenHash: string; renewTo?: number }) | null> {
  if (!token) return null;
  const tokenHash = sha256Hex(token);
  const now = Date.now();
  const [row] = await db
    .select({
      sessionId: schema.sessions.id,
      expiresAt: schema.sessions.expiresAt,
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      active: schema.users.active,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.tokenHash, tokenHash), gt(schema.sessions.expiresAt, now)));
  if (!row || !row.active) return null;
  let renewTo: number | undefined;
  if (row.expiresAt - now < SESSION_TTL_MS - RENEW_AFTER_MS) {
    renewTo = now + SESSION_TTL_MS;
    await db.update(schema.sessions).set({ expiresAt: renewTo }).where(eq(schema.sessions.id, row.sessionId));
  }
  return { sessionId: row.sessionId, tokenHash, id: row.id, email: row.email, name: row.name, role: row.role, renewTo };
}

/** Current user or null. Memoised per request. Never throws. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await resolveSession(token);
  if (!s) return null;
  return { id: s.id, email: s.email, name: s.name, role: s.role };
});

/**
 * GUARD for every admin page, server action and form handler.
 * Redirects to the login page when unauthenticated. `role: "admin"` restricts to full admins
 * (editors are rejected with 404). Returns the user.
 */
export async function requireAdmin(opts: { role?: "admin" } = {}): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(adminPaths.login);
  if (opts.role === "admin" && user.role !== "admin") notFound();
  return user;
}

/**
 * GUARD for admin route handlers (GET downloads, JSON endpoints). Returns the user, or a ready 401 response:
 *   const auth = await requireAdminRoute(); if (auth instanceof NextResponse) return auth;
 */
export async function requireAdminRoute(opts: { role?: "admin" } = {}): Promise<CurrentUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user || (opts.role === "admin" && user.role !== "admin")) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return user;
}

/** Housekeeping: remove expired sessions. */
export async function purgeExpiredSessions() {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, Date.now()));
}
