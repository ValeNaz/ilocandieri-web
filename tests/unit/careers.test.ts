import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db, newId, schema } from "@/lib/db";
import { setMailTransport } from "@/lib/email";
import { getStorage, validateCv } from "@/lib/storage";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken } from "@/lib/security";
import { setSetting } from "@/lib/settings";
import { applicationCounts, deleteApplication, listApplications, runRetention } from "@/lib/careers/admin";
import { FORM_SCOPE, notifyApplication, processApplication } from "@/lib/careers/submit";

const PDF = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(200, 0x20), Buffer.from("\n%%EOF")]);
const DAY = 86_400_000;

function form(over: Record<string, string | File | null> = {}, now = Date.now()) {
  const fd = new FormData();
  const base: Record<string, string | File | null> = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.test",
    phone: "+39 331 1234567",
    area: "Accoglienza",
    message: "Mi piacerebbe collaborare con voi.",
    privacy: "on",
    [FORM_TOKEN_FIELD]: issueFormToken(now - 10_000, FORM_SCOPE),
    [HONEYPOT_FIELD]: "",
    cv: new File([PDF], "cv.pdf", { type: "application/pdf" }),
    ...over,
  };
  for (const [k, v] of Object.entries(base)) if (v !== null) fd.set(k, v);
  return fd;
}
let ipN = 0;
const ctx = () => ({ ip: `10.0.0.${++ipN}` });

afterEach(() => setMailTransport(null));

describe("CV validation (magic bytes)", () => {
  it("accepts pdf/doc/docx by content", () => {
    expect(validateCv(PDF)).toMatchObject({ ok: true, kind: { ext: "pdf" } });
    expect(validateCv(Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(50)]))).toMatchObject({ ok: true, kind: { ext: "doc" } });
    const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("[Content_Types].xml word/document.xml")]);
    expect(validateCv(docx)).toMatchObject({ ok: true, kind: { ext: "docx" } });
  });
  it("rejects a fake extension (exe/html renamed .pdf), empty and oversized files", () => {
    expect(validateCv(Buffer.from("MZ\x90\x00 this is an exe"))).toMatchObject({ ok: false });
    expect(validateCv(Buffer.from("<html><script>alert(1)</script></html>"))).toMatchObject({ ok: false });
    expect(validateCv(Buffer.alloc(0))).toMatchObject({ ok: false });
    const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(5 * 1024 * 1024)]);
    expect(validateCv(big)).toMatchObject({ ok: false, error: expect.stringContaining("5 MB") });
  });
  it("a plain ZIP without word/ parts is not a docx", () => {
    expect(validateCv(Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("hello.txt")]))).toMatchObject({ ok: false });
  });
});

describe("public submission", () => {
  it("stores the application + CV in private storage and sends both emails (no CV attached)", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    await setSetting("notifications", { registrationsTo: [], contactsTo: [], applicationsTo: ["staff@example.test"] });
    const res = await processApplication(form(), ctx());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const [row] = await db.select().from(schema.applications).where(eq(schema.applications.id, res.id));
    expect(row).toMatchObject({ status: "new", cvMime: "application/pdf", privacyVersion: expect.any(String) });
    expect(row!.privacyAcceptedAt).toBeGreaterThan(0);
    expect(row!.ipHash).toMatch(/^[0-9a-f]{32}$/);
    expect(row!.cvPath).toMatch(/\.pdf$/);
    expect((await getStorage().get("private", row!.cvPath!))?.equals(PDF)).toBe(true);
    expect(await getStorage().get("public", row!.cvPath!)).toBeNull();

    expect(sendMail).toHaveBeenCalledTimes(2);
    const msgs = sendMail.mock.calls.map((c) => c[0] as { to: string; text: string; subject: string; attachments?: unknown });
    const user = msgs.find((m) => m.to === "ada@example.test")!;
    const staff = msgs.find((m) => m.to === "staff@example.test")!;
    expect(user.text).toContain("Potremo ricontattarti qualora emergessero opportunità coerenti");
    expect(user.text).not.toMatch(/assunt|posto di lavoro garantito|risponder/i);
    expect(staff.attachments).toBeUndefined();
    expect(staff.text).toContain(`/admin/candidature/${res.id}`);
    expect(staff.text).not.toContain("ada@example.test");
    expect(staff.text).not.toContain("Lovelace");
  });

  it("email step is idempotent: notifying twice never sends twice", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    await setSetting("notifications", { registrationsTo: [], contactsTo: [], applicationsTo: ["staff@example.test"] });
    const res = await processApplication(form(), ctx());
    if (!res.ok) throw new Error("expected ok");
    expect(sendMail).toHaveBeenCalledTimes(2);
    await notifyApplication(res.id);
    await notifyApplication(res.id);
    expect(sendMail).toHaveBeenCalledTimes(2);
    const keys = await db.select({ k: schema.emailOutbox.idempotencyKey }).from(schema.emailOutbox);
    expect(keys.filter((k) => k.k.includes(res.id))).toHaveLength(2);
  });

  it("works without SMTP: saved, emails marked not_configured", async () => {
    const res = await processApplication(form(), ctx());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const out = await db.select().from(schema.emailOutbox);
    const mine = out.filter((o) => o.idempotencyKey.includes(res.id));
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((o) => o.status === "not_configured")).toBe(true);
  });

  it("antispam: honeypot, missing/forged/too-fast token are rejected with a generic message and nothing is saved", async () => {
    const before = (await applicationCounts()).total;
    const bad = [
      form({ [HONEYPOT_FIELD]: "http://spam.example" }),
      form({ [FORM_TOKEN_FIELD]: null }),
      form({ [FORM_TOKEN_FIELD]: "1234567890123.deadbeef" }),
      form({ [FORM_TOKEN_FIELD]: issueFormToken(Date.now(), FORM_SCOPE) }), // submitted instantly
      form({ [FORM_TOKEN_FIELD]: issueFormToken(Date.now() - 10_000, "contact") }), // token of another form
    ];
    for (const fd of bad) {
      const r = await processApplication(fd, ctx());
      expect(r).toMatchObject({ ok: false, reason: "bot" });
    }
    expect((await applicationCounts()).total).toBe(before);
  });

  it("rate limits per IP hash (6th request in the window is refused)", async () => {
    const ip = "192.0.2.77";
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await processApplication(form(), { ip }));
    expect(results.slice(0, 5).every((r) => r.ok)).toBe(true);
    expect(results[5]).toMatchObject({ ok: false, reason: "rate" });
  });

  it("server-side validation: field errors, privacy required, fake CV rejected", async () => {
    const r1 = await processApplication(form({ email: "nope", privacy: null, area: "Inventato", firstName: "" }), ctx());
    expect(r1).toMatchObject({ ok: false, reason: "invalid" });
    if (!r1.ok) expect(Object.keys(r1.fieldErrors ?? {}).sort()).toEqual(["area", "email", "firstName", "privacy"]);
    const r2 = await processApplication(form({ cv: new File(["MZ not a pdf"], "cv.pdf", { type: "application/pdf" }) }), ctx());
    expect(r2).toMatchObject({ ok: false, reason: "invalid", fieldErrors: { cv: expect.any(String) } });
  });

  it("uses the extension detected from content for the stored name, not the client's", async () => {
    const r = await processApplication(form({ cv: new File([PDF], "../../evil.php", { type: "text/php" }) }), ctx());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [row] = await db.select().from(schema.applications).where(eq(schema.applications.id, r.id));
    expect(row!.cvPath).toMatch(/^\d{4}\/\d{2}\/[0-9a-f]{24}\.pdf$/);
    expect(row!.cvName).not.toContain("/");
  });
});

describe("admin: list, delete, retention", () => {
  async function seedApp(ageDays: number, status: "new" | "reviewing" | "archived" = "new") {
    const id = newId();
    const cvPath = `2020/01/${id}.pdf`;
    await getStorage().put("private", cvPath, PDF);
    await db.insert(schema.applications).values({
      id, firstName: "Old", lastName: `Cand${id.slice(0, 5)}`, email: `${id}@example.test`, area: "Altro", message: "msg", cvPath, cvName: "cv.pdf", cvMime: "application/pdf", cvSize: PDF.length,
      privacyAcceptedAt: Date.now(), privacyVersion: "t", status, createdAt: Date.now() - ageDays * DAY,
    });
    return { id, cvPath };
  }

  it("filters by status, area and search (LIKE wildcards are literal)", async () => {
    const a = await seedApp(1, "reviewing");
    const rows = await listApplications({ status: "reviewing", area: "Altro", q: a.id.slice(0, 5) });
    expect(rows.map((r) => r.id)).toContain(a.id);
    expect(await listApplications({ q: "%" })).toHaveLength(0);
    expect((await listApplications({ status: "archived", q: a.id.slice(0, 5) })).length).toBe(0);
  });

  it("delete removes the row AND the file", async () => {
    const a = await seedApp(1);
    expect(await getStorage().exists("private", a.cvPath)).toBe(true);
    expect(await deleteApplication(a.id)).toBe(1);
    expect(await getStorage().exists("private", a.cvPath)).toBe(false);
    expect(await listApplications({ q: a.id.slice(0, 5) })).toHaveLength(0);
  });

  it("retention: dry run counts, real run deletes only older rows and their files; unset = untouched", async () => {
    const old = await seedApp(400);
    const recent = await seedApp(10);
    const dry = await runRetention({ applicationsDays: 365, pastRegistrationsDays: 0 }, { dryRun: true });
    expect(dry.applications).toBeGreaterThanOrEqual(1);
    expect(dry.registrations).toBeNull();
    expect(await getStorage().exists("private", old.cvPath)).toBe(true);

    const none = await runRetention({ applicationsDays: 0, pastRegistrationsDays: null });
    expect(none).toEqual({ applications: null, registrations: null });
    expect(await getStorage().exists("private", old.cvPath)).toBe(true);

    await runRetention({ applicationsDays: 365 });
    expect(await getStorage().exists("private", old.cvPath)).toBe(false);
    expect(await getStorage().exists("private", recent.cvPath)).toBe(true);
    expect((await db.select().from(schema.applications).where(eq(schema.applications.id, recent.id))).length).toBe(1);
  });

  it("retention: past registrations only for events ended longer ago than the limit", async () => {
    const mkEvent = async (endsDaysAgo: number) => {
      const id = newId();
      await db.insert(schema.events).values({ id, slug: `ev-${id}`, title: "E", startsAt: Date.now() - (endsDaysAgo + 1) * DAY, endsAt: Date.now() - endsDaysAgo * DAY, status: "published" });
      const fv = newId();
      await db.insert(schema.eventFormVersions).values({ id: fv, eventId: id, version: 1, fields: [] });
      const rid = newId();
      await db.insert(schema.registrations).values({ id: rid, eventId: id, formVersionId: fv, status: "confirmed", name: "x", email: "x@x.it", emailNormalized: "x@x.it" });
      return rid;
    };
    const oldReg = await mkEvent(500);
    const freshReg = await mkEvent(5);
    const rep = await runRetention({ pastRegistrationsDays: 365 });
    expect(rep.registrations).toBe(1);
    const left = (await db.select({ id: schema.registrations.id }).from(schema.registrations)).map((r) => r.id);
    expect(left).not.toContain(oldReg);
    expect(left).toContain(freshReg);
  });
});
