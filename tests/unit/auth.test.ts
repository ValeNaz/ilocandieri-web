import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { requestPasswordReset, resetPasswordWithToken, isResetTokenValid } from "@/lib/auth/reset";
import { db, newId, schema } from "@/lib/db";
import { setMailTransport } from "@/lib/email";

vi.mock("next/headers", () => ({ cookies: async () => ({}), headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: () => {}, notFound: () => {} }));

describe("passwords", () => {
  it("hashes with argon2id and verifies", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(h, "correct horse battery")).toBe(true);
    expect(await verifyPassword(h, "wrong")).toBe(false);
    expect(await verifyPassword("garbage", "x")).toBe(false);
  });
  it("enforces policy", () => {
    expect(passwordPolicyError("short")).toBeTruthy();
    expect(passwordPolicyError("aaaaaaaaaaaa")).toBeTruthy();
    expect(passwordPolicyError("a-decent-passphrase")).toBeNull();
  });
});

describe("password reset", () => {
  it("issues a single-use token by email and revokes sessions", async () => {
    const id = newId();
    await db.insert(schema.users).values({ id, email: "reset@x.it", name: "R", passwordHash: await hashPassword("old-password-1") });
    await db.insert(schema.sessions).values({ id: newId(), userId: id, tokenHash: "h1", expiresAt: Date.now() + 100000 });
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });

    await requestPasswordReset("nobody@x.it");
    expect(sendMail).not.toHaveBeenCalled();

    await requestPasswordReset("Reset@X.it");
    expect(sendMail).toHaveBeenCalledTimes(1);
    const token = /token=([^\s&]+)/.exec(sendMail.mock.calls[0]![0].text)![1]!;
    expect(await isResetTokenValid(token)).toBe(true);

    expect((await resetPasswordWithToken(token, "short")).ok).toBe(false);
    expect((await resetPasswordWithToken(token, "brand-new-password")).ok).toBe(true);
    expect((await resetPasswordWithToken(token, "another-new-password")).ok).toBe(false); // single use
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    expect(await verifyPassword(u!.passwordHash, "brand-new-password")).toBe(true);
    expect(await db.select().from(schema.sessions).where(eq(schema.sessions.userId, id))).toHaveLength(0);
    setMailTransport(null);
  });
});
