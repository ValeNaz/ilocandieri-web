// Security audit regression tests: GDPR erasure (rows + related emails + files) and double-decision races.
import { eq, like } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { db, newId, schema } from "@/lib/db";
import { setMailTransport } from "@/lib/email";
import { purgeOutboxOlderThan } from "@/lib/email/outbox";
import { approve, cancel, deleteRegistration, register, reject } from "@/lib/events/registrations";
import { setSetting } from "@/lib/settings";
import { getStorage } from "@/lib/storage";
import { FORM_SCOPE, processApplication } from "@/lib/careers/submit";
import { deleteApplication } from "@/lib/careers/admin";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken } from "@/lib/security";
import { getEvent, makeEvent, person, regsOf } from "./helpers/events";

afterEach(() => setMailTransport(null));
beforeAll(async () => {
  await db.run(sql`PRAGMA journal_mode = WAL`);
  await setSetting("notifications", { registrationsTo: ["segreteria@example.org"], applicationsTo: ["hr@example.org"], contactsTo: [] });
});

const outboxFor = (id: string) => db.select().from(schema.emailOutbox).where(like(schema.emailOutbox.idempotencyKey, `%:${id}:%`));

describe("erasure of a single registration (GDPR art. 17)", () => {
  it("removes the row and every related email, and releases the seats", async () => {
    setMailTransport({ sendMail: vi.fn().mockResolvedValue({}) });
    const e = await makeEvent({ registrationMode: "limited", capacity: 2 });
    const r = await register({ eventId: e.id, values: person({ email: "erase-me@example.test" }) });
    if (!r.ok) throw new Error(r.message);
    expect((await outboxFor(r.registrationId)).length).toBeGreaterThan(0);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(1);

    expect(await deleteRegistration(r.registrationId)).toBe(true);
    expect(await regsOf(e.id)).toHaveLength(0);
    expect(await outboxFor(r.registrationId)).toHaveLength(0);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(0);
    expect(await deleteRegistration(r.registrationId)).toBe(false); // idempotent
  });
});

describe("applications: deleting removes row, private CV file and related emails", () => {
  it("leaves nothing behind", async () => {
    setMailTransport({ sendMail: vi.fn().mockResolvedValue({}) });
    const fd = new FormData();
    const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(200, 0x20)]);
    const vals: Record<string, string | File> = {
      firstName: "Ada", lastName: "Lovelace", email: "ada-erase@example.test", area: "Accoglienza", message: "Mi piacerebbe collaborare.", privacy: "on",
      [FORM_TOKEN_FIELD]: issueFormToken(Date.now() - 10_000, FORM_SCOPE), [HONEYPOT_FIELD]: "", cv: new File([pdf], "cv.pdf", { type: "application/pdf" }),
    };
    for (const [k, v] of Object.entries(vals)) fd.set(k, v);
    const res = await processApplication(fd, { ip: "203.0.113.9" });
    if (!res.ok) throw new Error(res.message);
    const [app] = await db.select().from(schema.applications).where(eq(schema.applications.id, res.id));
    expect(await getStorage().exists("private", app!.cvPath!)).toBe(true);
    expect((await outboxFor(res.id)).length).toBeGreaterThan(0);

    await deleteApplication(res.id);
    expect(await getStorage().exists("private", app!.cvPath!)).toBe(false);
    expect(await outboxFor(res.id)).toHaveLength(0);
  });
});

describe("email log is not an archive", () => {
  it("retention trims outbox rows older than 90 days only", async () => {
    const old = newId();
    const fresh = newId();
    const base = { to: "x@example.test", subject: "s", text: "t", status: "sent" as const };
    await db.insert(schema.emailOutbox).values([
      { id: old, idempotencyKey: `t:${old}:a`, createdAt: Date.now() - 100 * 86_400_000, ...base },
      { id: fresh, idempotencyKey: `t:${fresh}:a`, ...base },
    ]);
    expect(await purgeOutboxOlderThan(90)).toBeGreaterThanOrEqual(1);
    expect(await outboxFor(old)).toHaveLength(0);
    expect(await outboxFor(fresh)).toHaveLength(1);
  });
});

describe("double decisions never double-count seats", () => {
  it("two simultaneous cancels of the same confirmed registration release the seat once", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 5 });
    const a = await register({ eventId: e.id, values: person(), skipEmails: true });
    const b = await register({ eventId: e.id, values: person(), skipEmails: true });
    if (!a.ok || !b.ok) throw new Error("setup");
    const rs = await Promise.all([cancel(a.registrationId, { skipEmails: true }), cancel(a.registrationId, { skipEmails: true })]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(1); // b still holds its seat
  });

  it("approve twice / reject on confirmed / approve on cancelled are refused and change nothing", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 5 });
    const a = await register({ eventId: e.id, values: person(), skipEmails: true });
    if (!a.ok) throw new Error("setup");
    const approvals = await Promise.all([approve(a.registrationId, { skipEmails: true }), approve(a.registrationId, { skipEmails: true })]);
    expect(approvals.filter((r) => r.ok)).toHaveLength(1);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(a.seats);
    expect(await reject(a.registrationId, { skipEmails: true })).toMatchObject({ ok: false, reason: "invalid_state" });
    await cancel(a.registrationId, { skipEmails: true });
    expect(await approve(a.registrationId, { skipEmails: true })).toMatchObject({ ok: false, reason: "invalid_state" });
    expect((await getEvent(e.id)).seatsConfirmed).toBe(0);
  });
});
