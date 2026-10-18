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
    await vi.waitFor(() => expect(sendMail).toHaveBeenCalledTimes(1)); // delivery is deferred (anti-enumeration)
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

describe("password reset hardening", () => {
  it("does not wait for SMTP: response time must not reveal whether the account exists", async () => {
    await db.insert(schema.users).values({ id: newId(), email: "timing@x.it", name: "T", passwordHash: await hashPassword("old-password-1") });
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const sendMail = vi.fn().mockImplementation(() => gate);
    setMailTransport({ sendMail });
    const outcome = await Promise.race([requestPasswordReset("timing@x.it").then(() => "returned"), new Promise((r) => setTimeout(() => r("blocked"), 1500))]);
    release();
    setMailTransport(null);
    expect(outcome).toBe("returned");
  });

  it("using one reset link invalidates the other outstanding links of the same user", async () => {
    const id = newId();
    await db.insert(schema.users).values({ id, email: "twice@x.it", name: "T", passwordHash: await hashPassword("old-password-1") });
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    await requestPasswordReset("twice@x.it");
    await requestPasswordReset("twice@x.it");
    await vi.waitFor(() => expect(sendMail).toHaveBeenCalledTimes(2));
    const [t1, t2] = sendMail.mock.calls.map((c) => /token=([^\s&]+)/.exec(c[0].text)![1]!);
    expect((await resetPasswordWithToken(t1!, "brand-new-password")).ok).toBe(true);
    expect(await isResetTokenValid(t2!)).toBe(false);
    setMailTransport(null);
  });
});
