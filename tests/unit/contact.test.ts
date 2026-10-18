import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { CONTACT_LIMIT, submitContact } from "@/lib/content/contact";
import { db, schema } from "@/lib/db";
import { setMailTransport } from "@/lib/email/sender";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken } from "@/lib/security";
import { setSetting } from "@/lib/settings";

const NOW = Date.now();
function form(over: Record<string, string> = {}, tokenAge = 10_000) {
  const fd = new FormData();
  fd.set(FORM_TOKEN_FIELD, issueFormToken(NOW - tokenAge, "contact"));
  fd.set(HONEYPOT_FIELD, "");
  const base: Record<string, string> = { name: "Maria Rossi", email: "Maria@Example.org", subject: "Collaborazione", message: "Vorrei sapere di più sulle vostre attività.", privacy: "on" };
  for (const [k, v] of Object.entries({ ...base, ...over })) fd.set(k, v);
  return fd;
}
const count = async () => (await db.select().from(schema.contactMessages)).length;

describe("submitContact", () => {
  beforeEach(async () => {
    await db.delete(schema.contactMessages);
    await db.delete(schema.rateLimits);
    await db.delete(schema.emailOutbox);
    setMailTransport(null);
  });

  it("stores a valid message (email normalised, IP hashed) and queues the admin notification", async () => {
    await setSetting("notifications", { registrationsTo: [], applicationsTo: [], contactsTo: ["admin@example.org"] });
    const sent: { to: string; subject: string }[] = [];
    setMailTransport({ sendMail: async (m) => { sent.push(m); } });
    const r = await submitContact(form(), "203.0.113.9", { now: NOW });
    expect(r.ok).toBe(true);
    const [row] = await db.select().from(schema.contactMessages);
    expect(row!.email).toBe("maria@example.org");
    expect(row!.ipHash).toMatch(/^[0-9a-f]{32}$/);
    expect(row!.ipHash).not.toContain("203");
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toBe("admin@example.org");
    const [ob] = await db.select().from(schema.emailOutbox).where(eq(schema.emailOutbox.to, "admin@example.org"));
    expect(ob!.status).toBe("sent");
  });

  it("without SMTP the message is still saved and the email is 'not_configured', never 'sent'", async () => {
    await setSetting("notifications", { registrationsTo: [], applicationsTo: [], contactsTo: ["admin@example.org"] });
    expect((await submitContact(form(), "203.0.113.10", { now: NOW })).ok).toBe(true);
    const [ob] = await db.select().from(schema.emailOutbox);
    expect(ob!.status).toBe("not_configured");
  });

  it("rejects the honeypot, a missing/forged/too-fast token without saving", async () => {
    expect((await submitContact(form({ [HONEYPOT_FIELD]: "http://spam" }), "198.51.100.1", { now: NOW })).ok).toBe(false);
    const noToken = form(); noToken.delete(FORM_TOKEN_FIELD);
    expect((await submitContact(noToken, "198.51.100.1", { now: NOW })).ok).toBe(false);
    const forged = form(); forged.set(FORM_TOKEN_FIELD, `${NOW - 10_000}.deadbeef`);
    expect((await submitContact(forged, "198.51.100.1", { now: NOW })).ok).toBe(false);
    expect((await submitContact(form({}, 500), "198.51.100.1", { now: NOW })).ok).toBe(false);
    expect(await count()).toBe(0);
  });

  it("validates fields and requires the privacy acknowledgement", async () => {
    const bad = await submitContact(form({ email: "non-una-email", message: "corto", privacy: "" }), "198.51.100.2", { now: NOW });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(Object.keys(bad.fieldErrors ?? {}).sort()).toEqual(["email", "message", "privacy"]);
    expect(await count()).toBe(0);
  });

  it("rate limits by hashed IP", async () => {
    for (let i = 0; i < CONTACT_LIMIT.limit; i++) expect((await submitContact(form(), "192.0.2.77", { now: NOW })).ok).toBe(true);
    const blocked = await submitContact(form(), "192.0.2.77", { now: NOW });
    expect(blocked.ok).toBe(false);
    expect(await count()).toBe(CONTACT_LIMIT.limit);
    expect((await submitContact(form(), "192.0.2.78", { now: NOW })).ok).toBe(true);
  });
});
