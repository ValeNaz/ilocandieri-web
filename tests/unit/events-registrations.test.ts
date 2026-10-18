import { eq, sql } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDb, db, newId, schema } from "@/lib/db";
import { setMailTransport } from "@/lib/email";
import { DEFAULT_FIELDS, getLatestFormVersion, saveFormFields, type EventFormField } from "@/lib/events/forms";
import { duplicateEvent, deleteEvent, saveEvent } from "@/lib/events/service";
import { approve, cancel, recount, register, reject, type RegisterResult } from "@/lib/events/registrations";
import { sendRegistrationEmails } from "@/lib/events/emails";
import { DEFAULT_MESSAGES } from "@/lib/events/messages";
import { getAvailability, getHomeEvents, getPublicEvent, listPublicEvents } from "@/lib/events/public";
import { registrationsCsv, listAdminEvents } from "@/lib/events/admin";
import { parseEventInput } from "@/lib/events/validation";
import { setSetting } from "@/lib/settings";
import { DAY, getEvent, makeEvent, person, regsOf } from "./helpers/events";

afterEach(() => setMailTransport(null));

// Same journal mode as production (scripts/migrate.ts sets WAL; the generic test setup does not).
beforeAll(async () => {
  await db.run(sql`PRAGMA journal_mode = WAL`);
});

const reg = (eventId: string, values: Record<string, unknown> = person(), extra: object = {}) => register({ eventId, values, skipEmails: true, ...extra });
const okOf = (r: RegisterResult) => (r.ok ? r : (() => { throw new Error(`expected ok, got ${r.reason}: ${r.message}`); })());
const reasonOf = (r: RegisterResult) => (r.ok ? "ok" : r.reason);

async function expectCountersMatch(eventId: string) {
  const e = await getEvent(eventId);
  const rows = await regsOf(eventId);
  const confirmed = rows.filter((r) => r.status === "confirmed").reduce((s, r) => s + r.seats, 0);
  const pending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.seats, 0);
  expect(e.seatsConfirmed).toBe(confirmed);
  expect(e.seatsHeld).toBe(e.pendingHoldsSeats && e.capacity != null ? pending : 0);
  expect(e.seatsConfirmed).toBeGreaterThanOrEqual(0);
  expect(e.seatsHeld).toBeGreaterThanOrEqual(0);
  if (e.capacity != null) expect(e.seatsConfirmed + e.seatsHeld).toBeLessThanOrEqual(e.capacity);
}

describe("T1 - informational event (no form): CTA only", () => {
  it("cannot be registered to, even by a direct call", async () => {
    const e = await makeEvent({ ctaType: "external_link", ctaTarget: "https://example.org", registrationMode: null });
    expect(reasonOf(await reg(e.id))).toBe("not_applicable");
    expect(await regsOf(e.id)).toHaveLength(0);
    const mail = await makeEvent({ ctaType: "email", ctaTarget: "info@example.org", registrationMode: null });
    expect(reasonOf(await reg(mail.id))).toBe("not_applicable");
  });
});

describe("T2 / Example B - public form: saves, shows in admin, sends confirmation + admin notification", () => {
  beforeAll(async () => {
    await setSetting("notifications", { registrationsTo: ["segreteria@example.org"], applicationsTo: [], contactsTo: [] });
  });
  it("persists the registration with an answers snapshot and emails once", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    const fields: EventFormField[] = [...DEFAULT_FIELDS, { id: "diete", type: "text", label: "Intolleranze", required: false }];
    const e = await makeEvent({ title: "Cena di quartiere", location: "Castelvetrano" }, fields);
    const r = okOf(await register({ eventId: e.id, values: { ...person({ email: "Ada@Example.org" }), diete: "glutine" } }));
    expect(r.status).toBe("confirmed");
    expect(r.message).toBe(DEFAULT_MESSAGES.confirmed);
    const [row] = await regsOf(e.id);
    expect(row).toMatchObject({ status: "confirmed", seats: 1, emailNormalized: "ada@example.org", email: "Ada@Example.org" });
    expect(row!.answers).toEqual([
      { fieldId: "phone", label: "Telefono", value: "" },
      { fieldId: "diete", label: "Intolleranze", value: "glutine" },
    ]);
    const to = sendMail.mock.calls.map((c) => c[0].to).sort();
    expect(to).toEqual(["Ada@Example.org", "segreteria@example.org"].sort());
    const toUser = sendMail.mock.calls.find((c) => c[0].to === "Ada@Example.org")![0];
    expect(toUser.subject).toContain("Cena di quartiere");
    expect(toUser.subject.toLowerCase()).toContain("confermata");
    expect(toUser.text).toContain("Cena di quartiere");
    const toAdmin = sendMail.mock.calls.find((c) => c[0].to === "segreteria@example.org")![0];
    expect(toAdmin.subject).toContain("Cena di quartiere");
  });
});

describe("T3 / Example C - capacity 2 and 20, also with simultaneous requests", () => {
  it("capacity 2: two confirmed, third refused (sequential)", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 2 });
    expect(okOf(await reg(e.id)).status).toBe("confirmed");
    expect(okOf(await reg(e.id)).status).toBe("confirmed");
    const third = await reg(e.id);
    expect(third).toMatchObject({ ok: false, reason: "full", message: DEFAULT_MESSAGES.full });
    await expectCountersMatch(e.id);
  });
  it("capacity 2 + 3 simultaneous -> exactly 2 confirmed", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 2 });
    const res = await Promise.all([reg(e.id), reg(e.id), reg(e.id)]);
    expect(res.filter((r) => r.ok)).toHaveLength(2);
    expect(res.filter((r) => !r.ok).map(reasonOf)).toEqual(["full"]);
    expect(await regsOf(e.id)).toHaveLength(2);
    await expectCountersMatch(e.id);
  });
  it("20 seats + 25 simultaneous register() -> exactly 20 confirmed", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 20 });
    const res = await Promise.all(Array.from({ length: 25 }, () => reg(e.id)));
    expect(res.filter((r) => r.ok)).toHaveLength(20);
    expect(res.filter((r) => !r.ok).every((r) => reasonOf(r) === "full")).toBe(true);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(20);
    expect((await regsOf(e.id)).filter((r) => r.status === "confirmed")).toHaveLength(20);
    await expectCountersMatch(e.id);
  });
  it("REAL concurrency across separate DB connections (the atomic UPDATE is the guard, not the in-process queue)", async () => {
    const clients = [createDb(), createDb(), createDb()];
    try {
      const e = await makeEvent({ registrationMode: "limited", capacity: 7 });
      const res = await Promise.all(Array.from({ length: 30 }, (_, i) => register({ eventId: e.id, values: person(), skipEmails: true }, clients[i % 3]!.db)));
      expect(res.filter((r) => r.ok)).toHaveLength(7);
      await expectCountersMatch(e.id);
    } finally {
      clients.forEach((c) => c.client.close());
    }
  });
  it("capacity counts SEATS, not forms (Example C with seats)", async () => {
    const fields: EventFormField[] = [...DEFAULT_FIELDS, { id: "posti", type: "seats", label: "Posti", required: true, min: 1, max: 5 }];
    const e = await makeEvent({ registrationMode: "limited", capacity: 6, maxSeatsPerRequest: 4 }, fields);
    expect(okOf(await reg(e.id, person({ posti: "4" }))).seats).toBe(4);
    const tooMany = await reg(e.id, person({ posti: "3" }));
    expect(tooMany).toMatchObject({ ok: false, reason: "not_enough_seats", remaining: 2 });
    expect(okOf(await reg(e.id, person({ posti: "2" }))).seats).toBe(2);
    expect(reasonOf(await reg(e.id, person({ posti: "1" })))).toBe("full");
    // per-request cap enforced server side even if the form field allows more
    const e2 = await makeEvent({ registrationMode: "open", maxSeatsPerRequest: 2 }, fields);
    expect(reasonOf(await reg(e2.id, person({ posti: "3" })))).toBe("invalid");
    expect(await regsOf(e2.id)).toHaveLength(0);
    await expectCountersMatch(e.id);
  });
});

describe("T4 / Example D - approval and reserved events stay PENDING", () => {
  it("approval: pending after submit, pending message (never 'confermata'), no seat consumed", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 5 });
    const r = okOf(await reg(e.id));
    expect(r.status).toBe("pending");
    expect(r.message).toBe(DEFAULT_MESSAGES.pending);
    expect(r.message).not.toMatch(/è confermata/);
    const ev = await getEvent(e.id);
    expect(ev.seatsConfirmed).toBe(0);
    expect(ev.seatsHeld).toBe(0);
  });
  it("custom pending message override is honoured", async () => {
    const e = await makeEvent({ registrationMode: "approval", successMessage: { pending: "Ti scriviamo noi entro 48 ore." } });
    expect(okOf(await reg(e.id)).message).toBe("Ti scriviamo noi entro 48 ore.");
  });
  it("admin approve / reject move the request and email the person", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    const e = await makeEvent({ registrationMode: "approval", title: "Assemblea soci" });
    const a = okOf(await register({ eventId: e.id, values: person({ email: "a@example.org" }) }));
    const b = okOf(await register({ eventId: e.id, values: person({ email: "b@example.org" }) }));
    expect((await approve(a.registrationId, { userId: "u1" })).ok).toBe(true);
    expect((await reject(b.registrationId, { userId: "u1" })).ok).toBe(true);
    const subjects = sendMail.mock.calls.map((c) => `${c[0].to}|${c[0].subject}`);
    expect(subjects.some((s) => s.startsWith("a@example.org|") && s.includes("Partecipazione confermata: Assemblea soci"))).toBe(true);
    expect(subjects.some((s) => s.startsWith("b@example.org|") && s.includes("Richiesta non accolta: Assemblea soci"))).toBe(true);
    // already decided -> cannot be decided again
    expect(await approve(a.registrationId)).toMatchObject({ ok: false, reason: "invalid_state" });
    expect(await reject(a.registrationId)).toMatchObject({ ok: false, reason: "invalid_state" });
    expect(await approve(b.registrationId)).toMatchObject({ ok: false, reason: "invalid_state" });
  });
});

describe("T5 / Example E - approval + limit: never approve beyond capacity", () => {
  it("5 seats, 6 requests, approve sequentially: sixth fails with 'capienza superata'", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 5 });
    const rs = [];
    for (let i = 0; i < 6; i++) rs.push(okOf(await reg(e.id)));
    expect((await regsOf(e.id)).filter((r) => r.status === "pending")).toHaveLength(6);
    const outcomes = [];
    for (const r of rs) outcomes.push(await approve(r.registrationId, { skipEmails: true }));
    expect(outcomes.filter((o) => o.ok)).toHaveLength(5);
    const failed = outcomes.find((o) => !o.ok)!;
    expect(failed).toMatchObject({ ok: false, reason: "capacity_exceeded" });
    expect((failed as { message: string }).message).toMatch(/Capienza superata/);
    // the failed approval left the request pending and no counter changed
    expect((await regsOf(e.id)).filter((r) => r.status === "pending")).toHaveLength(1);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(5);
    await expectCountersMatch(e.id);
  });
  it("6 CONCURRENT approvals on 5 seats -> max 5 confirmed", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 5 });
    const rs = [];
    for (let i = 0; i < 6; i++) rs.push(okOf(await reg(e.id)));
    const out = await Promise.all(rs.map((r) => approve(r.registrationId, { skipEmails: true })));
    expect(out.filter((o) => o.ok)).toHaveLength(5);
    expect(out.filter((o) => !o.ok).map((o) => (o as { reason: string }).reason)).toEqual(["capacity_exceeded"]);
    expect((await regsOf(e.id)).filter((r) => r.status === "confirmed")).toHaveLength(5);
    await expectCountersMatch(e.id);
  });
  it("seats-based: a 3-seat request cannot be approved when 2 remain", async () => {
    const fields: EventFormField[] = [...DEFAULT_FIELDS, { id: "posti", type: "seats", label: "Posti", required: true, min: 1, max: 5 }];
    const e = await makeEvent({ registrationMode: "approval", capacity: 5, maxSeatsPerRequest: 3 }, fields);
    const a = okOf(await reg(e.id, person({ posti: "3" })));
    const b = okOf(await reg(e.id, person({ posti: "3" })));
    expect((await approve(a.registrationId, { skipEmails: true })).ok).toBe(true);
    expect(await approve(b.registrationId, { skipEmails: true })).toMatchObject({ ok: false, reason: "capacity_exceeded" });
    await expectCountersMatch(e.id);
  });
  it("concurrent approvals across separate connections", async () => {
    const clients = [createDb(), createDb()];
    try {
      const e = await makeEvent({ registrationMode: "approval", capacity: 4 });
      const rs = [];
      for (let i = 0; i < 8; i++) rs.push(okOf(await reg(e.id)));
      const out = await Promise.all(rs.map((r, i) => approve(r.registrationId, { skipEmails: true }, clients[i % 2]!.db)));
      expect(out.filter((o) => o.ok)).toHaveLength(4);
      await expectCountersMatch(e.id);
    } finally {
      clients.forEach((c) => c.client.close());
    }
  });
  it("pendingHoldsSeats: pending requests occupy seats (declared), freed on reject/cancel, approval cannot overshoot", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 3, pendingHoldsSeats: true });
    const rs = [];
    for (let i = 0; i < 3; i++) rs.push(okOf(await reg(e.id)));
    expect((await getEvent(e.id)).seatsHeld).toBe(3);
    expect(reasonOf(await reg(e.id))).toBe("full");
    expect((await approve(rs[0]!.registrationId, { skipEmails: true })).ok).toBe(true);
    expect(await getEvent(e.id)).toMatchObject({ seatsConfirmed: 1, seatsHeld: 2 });
    expect((await reject(rs[1]!.registrationId, { skipEmails: true })).ok).toBe(true);
    expect(await getEvent(e.id)).toMatchObject({ seatsConfirmed: 1, seatsHeld: 1 });
    expect(okOf(await reg(e.id)).status).toBe("pending"); // the freed seat is requestable again
    expect((await cancel(rs[2]!.registrationId, { skipEmails: true })).ok).toBe(true);
    await expectCountersMatch(e.id);
  });
  it("concurrent requests with holds never exceed capacity", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 5, pendingHoldsSeats: true });
    const res = await Promise.all(Array.from({ length: 12 }, () => reg(e.id)));
    expect(res.filter((r) => r.ok)).toHaveLength(5);
    await expectCountersMatch(e.id);
  });
});

describe("T6 - reserved events: declared requirement is collected but never confirms", () => {
  it("always pending, requirement mandatory, never auto-confirmed even for a matching declaration", async () => {
    const e = await makeEvent({ registrationMode: "reserved", reservedCriteria: "Riservato ai partner", reservedVerification: "manual", capacity: 10 });
    const form = (await getLatestFormVersion(e.id))!.fields;
    expect(form.some((f) => f.id === "requisito" && f.required)).toBe(true);
    // missing requirement -> invalid
    expect(reasonOf(await reg(e.id, person()))).toBe("invalid");
    const r = okOf(await reg(e.id, person({ requisito: "Sono un partner dell'associazione X" })));
    expect(r.status).toBe("pending");
    const [row] = await regsOf(e.id);
    expect(row!.status).toBe("pending");
    expect(row!.answers).toContainEqual(expect.objectContaining({ fieldId: "requisito", value: "Sono un partner dell'associazione X" }));
    expect((await getEvent(e.id)).seatsConfirmed).toBe(0);
    // only the admin decision confirms
    expect((await approve(r.registrationId, { userId: "admin", skipEmails: true })).ok).toBe(true);
  });
  it("Example D: reserved to partners stays pending, admin can approve or reject", async () => {
    const e = await makeEvent({ registrationMode: "reserved", reservedCriteria: "Partner" });
    const a = okOf(await reg(e.id, person({ requisito: "Partner" })));
    const b = okOf(await reg(e.id, person({ requisito: "Amico di un partner" })));
    expect([a.status, b.status]).toEqual(["pending", "pending"]);
    expect((await approve(a.registrationId, { skipEmails: true })).ok).toBe(true);
    expect((await reject(b.registrationId, { skipEmails: true, note: "Non risulta partner" })).ok).toBe(true);
    const rows = await regsOf(e.id);
    expect(rows.find((r) => r.id === b.registrationId)).toMatchObject({ status: "rejected", adminNote: "Non risulta partner", dedupeKey: null });
  });
});

describe("T7 - cancelling frees seats", () => {
  it("counters and state realign; a freed seat can be taken; never negative; no double cancel", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 2 });
    const a = okOf(await reg(e.id));
    okOf(await reg(e.id));
    expect(reasonOf(await reg(e.id))).toBe("full");
    expect((await getPublicEvent(e.slug))!.state).toBe("full");
    expect((await cancel(a.registrationId, { skipEmails: true })).ok).toBe(true);
    expect(await getEvent(e.id)).toMatchObject({ seatsConfirmed: 1 });
    expect((await getPublicEvent(e.slug))!.state).toBe("open");
    expect((await getPublicEvent(e.slug))!.remaining).toBe(1);
    expect(await cancel(a.registrationId)).toMatchObject({ ok: false, reason: "invalid_state" });
    expect((await getEvent(e.id)).seatsConfirmed).toBe(1);
    okOf(await reg(e.id));
    expect(reasonOf(await reg(e.id))).toBe("full");
    await expectCountersMatch(e.id);
  });
  it("a cancelled/rejected person can register again; active duplicates cannot", async () => {
    const e = await makeEvent({ registrationMode: "open" });
    const v = person({ email: "again@example.org" });
    const first = okOf(await reg(e.id, v));
    expect(reasonOf(await reg(e.id, { ...v, email: "AGAIN@example.org " }))).toBe("duplicate");
    await cancel(first.registrationId, { skipEmails: true });
    expect(okOf(await reg(e.id, v)).status).toBe("confirmed");
  });
  it("recount() repairs drifted counters", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 10 });
    for (let i = 0; i < 3; i++) okOf(await reg(e.id));
    await db.update(schema.events).set({ seatsConfirmed: 99, seatsHeld: 4 }).where(eq(schema.events.id, e.id));
    const r = await recount(e.id);
    expect(r).toMatchObject({ seatsConfirmed: 3, seatsHeld: 0 });
    await expectCountersMatch(e.id);
  });
  it("cancelling a confirmed seat on an 'unlimited' event still decrements safely", async () => {
    const e = await makeEvent({ registrationMode: "open" });
    const a = okOf(await reg(e.id));
    await db.update(schema.events).set({ seatsConfirmed: 0 }).where(eq(schema.events.id, e.id)); // drift
    await cancel(a.registrationId, { skipEmails: true });
    expect((await getEvent(e.id)).seatsConfirmed).toBe(0); // MAX(0, ..)
  });
});

describe("T8 - different forms on different events; editing a form never alters past registrations", () => {
  it("two events keep independent forms and answers", async () => {
    const fa: EventFormField[] = [...DEFAULT_FIELDS, { id: "taglia", type: "select", label: "Taglia maglietta", required: true, options: ["S", "M", "L"] }];
    const fb: EventFormField[] = [...DEFAULT_FIELDS, { id: "bimbi", type: "checkbox", label: "Porto bambini", required: false }];
    const a = await makeEvent({}, fa);
    const b = await makeEvent({}, fb);
    expect(reasonOf(await reg(a.id, person()))).toBe("invalid"); // taglia required on A
    okOf(await reg(a.id, person({ taglia: "M" })));
    okOf(await reg(b.id, person({ bimbi: "on" }))); // no taglia needed on B
    expect(reasonOf(await reg(b.id, person({ taglia: "M", bimbi: "" })))).toBe("ok"); // unknown key ignored
    const [ra] = await regsOf(a.id);
    const [rb] = await regsOf(b.id);
    expect(ra!.answers!.map((x) => x.label)).toContain("Taglia maglietta");
    expect(rb!.answers!.map((x) => x.label)).toContain("Porto bambini");
    expect(rb!.answers!.map((x) => x.label)).not.toContain("Taglia maglietta");
  });
  it("editing the form creates a NEW version; old registrations keep version, labels and values", async () => {
    const e = await makeEvent({}, [...DEFAULT_FIELDS, { id: "note", type: "text", label: "Note per noi", required: false }]);
    const first = okOf(await reg(e.id, person({ note: "vegetariano" })));
    const v1 = (await getLatestFormVersion(e.id))!;
    const saved = await saveFormFields(e.id, [...DEFAULT_FIELDS, { id: "note", type: "text", label: "Allergie (RINOMINATO)", required: true }, { id: "extra", type: "text", label: "Nuovo campo", required: true }], "open");
    expect(saved.created).toBe(true);
    expect(saved.version.version).toBe(v1.version + 1);
    // saving the same thing again is a no-op
    expect((await saveFormFields(e.id, saved.version.fields, "open")).created).toBe(false);
    const [row] = await regsOf(e.id);
    expect(row!.id).toBe(first.registrationId);
    expect(row!.formVersionId).toBe(v1.id);
    expect(row!.answers).toContainEqual({ fieldId: "note", label: "Note per noi", value: "vegetariano" });
    // old version still readable, untouched
    const [oldV] = await db.select().from(schema.eventFormVersions).where(eq(schema.eventFormVersions.id, v1.id));
    expect(oldV!.fields.find((f) => f.id === "note")!.label).toBe("Note per noi");
    // new submissions follow the new version
    expect(reasonOf(await reg(e.id, person({ note: "x" })))).toBe("invalid"); // 'extra' now required
    const second = okOf(await reg(e.id, person({ note: "noci", extra: "ok" })));
    const rows = await regsOf(e.id);
    expect(rows.find((r) => r.id === second.registrationId)!.formVersionId).toBe(saved.version.id);
  });
  it("a visitor holding an outdated form is refused (form_outdated), not silently accepted", async () => {
    const e = await makeEvent();
    const v1 = (await getLatestFormVersion(e.id))!;
    await saveFormFields(e.id, [...DEFAULT_FIELDS, { id: "nuovo", type: "text", label: "Nuovo", required: true }], "open");
    expect(reasonOf(await register({ eventId: e.id, formVersionId: v1.id, values: person(), skipEmails: true }))).toBe("form_outdated");
  });
});

describe("T9 / Example F - past, closed, hidden, draft, not-yet-open events refuse registration (server side)", () => {
  it("past event: no registration", async () => {
    const e = await makeEvent({ startsAt: Date.now() - 2 * DAY });
    expect(await reg(e.id)).toMatchObject({ ok: false, reason: "past", message: DEFAULT_MESSAGES.past });
    expect(await regsOf(e.id)).toHaveLength(0);
    const p = await getPublicEvent(e.slug);
    expect(p).not.toBeNull(); // history stays visible
    expect(p!.state).toBe("past");
  });
  it("manually closed / closed by date / not yet open", async () => {
    const manual = await makeEvent({ registrationManuallyClosed: true });
    expect(await reg(manual.id)).toMatchObject({ ok: false, reason: "closed", message: DEFAULT_MESSAGES.closed });
    const byDate = await makeEvent({ registrationClosesAt: Date.now() - 1000 });
    expect(reasonOf(await reg(byDate.id))).toBe("closed");
    const early = await makeEvent({ registrationOpensAt: Date.now() + DAY });
    expect(reasonOf(await reg(early.id))).toBe("not_yet_open");
    for (const e of [manual, byDate, early]) expect(await regsOf(e.id)).toHaveLength(0);
  });
  it("hidden and draft events: not public and not registrable", async () => {
    const hidden = await makeEvent({ status: "hidden" });
    const draft = await makeEvent({ status: "draft" });
    for (const e of [hidden, draft]) {
      expect(await getPublicEvent(e.slug)).toBeNull();
      expect(reasonOf(await reg(e.id))).toBe("not_found");
      expect(await regsOf(e.id)).toHaveLength(0);
    }
    const listing = await listPublicEvents();
    const slugs = [...listing.upcoming, ...listing.past].map((c) => c.slug);
    expect(slugs).not.toContain(hidden.slug);
    expect(slugs).not.toContain(draft.slug);
    expect((await getHomeEvents(50)).map((c) => c.slug)).not.toContain(hidden.slug);
  });
  it("event that closes while full/open reflects live in availability", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 1 });
    expect(await getAvailability(e.slug)).toEqual({ state: "open", remaining: 1 });
    okOf(await reg(e.id));
    expect(await getAvailability(e.slug)).toEqual({ state: "full", remaining: 0 });
    await db.update(schema.events).set({ status: "hidden" }).where(eq(schema.events.id, e.id));
    expect(await getAvailability(e.slug)).toBeNull();
  });
});

describe("T10 - concurrency, duplicates, retries", () => {
  it("the same person submitting 6 times at once -> one registration", async () => {
    const e = await makeEvent();
    const v = person({ email: "dup@example.org" });
    const res = await Promise.all(Array.from({ length: 6 }, () => reg(e.id, v)));
    expect(res.filter((r) => r.ok)).toHaveLength(1);
    expect(res.filter((r) => !r.ok).every((r) => reasonOf(r) === "duplicate")).toBe(true);
    expect(await regsOf(e.id)).toHaveLength(1);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(1);
  });
  it("a failed duplicate does not leak a seat (rolled back with the transaction)", async () => {
    const e = await makeEvent({ registrationMode: "limited", capacity: 3 });
    const v = person({ email: "leak@example.org" });
    await Promise.all([reg(e.id, v), reg(e.id, v), reg(e.id, v)]);
    expect((await getEvent(e.id)).seatsConfirmed).toBe(1);
    await expectCountersMatch(e.id);
  });
  it("retry: no duplicate registrations and no duplicate emails (idempotent outbox)", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    const e = await makeEvent();
    const v = person({ email: "retry@example.org" });
    const first = okOf(await register({ eventId: e.id, values: v }));
    const calls = sendMail.mock.calls.length;
    expect(calls).toBeGreaterThanOrEqual(1);
    // client retry of the whole submit
    expect(reasonOf(await register({ eventId: e.id, values: v }))).toBe("duplicate");
    // server-side retry of the email step
    await sendRegistrationEmails(first.registrationId, "created");
    await sendRegistrationEmails(first.registrationId, "created");
    expect(sendMail.mock.calls.length).toBe(calls);
    const outbox = await db.select().from(schema.emailOutbox);
    const mine = outbox.filter((o) => o.idempotencyKey.includes(first.registrationId));
    expect(new Set(mine.map((o) => o.idempotencyKey)).size).toBe(mine.length);
    expect(mine.some((o) => o.idempotencyKey === `registration_confirmed:${first.registrationId}:confirmed`)).toBe(true);
    // decision emails are idempotent too
    await cancel(first.registrationId);
    await sendRegistrationEmails(first.registrationId, "cancelled");
    expect(mine.length).toBeLessThanOrEqual((await db.select().from(schema.emailOutbox)).filter((o) => o.idempotencyKey.includes(first.registrationId)).length);
    const cancelMails = (await db.select().from(schema.emailOutbox)).filter((o) => o.idempotencyKey === `registration_cancelled:${first.registrationId}:cancelled`);
    expect(cancelMails).toHaveLength(1);
  });
  it("without SMTP the outbox says not_configured (no fake success) and registration still works", async () => {
    const e = await makeEvent();
    const r = okOf(await register({ eventId: e.id, values: person() }));
    const rows = (await db.select().from(schema.emailOutbox)).filter((o) => o.idempotencyKey.includes(r.registrationId));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((o) => o.status === "not_configured")).toBe(true);
  });
  it("mixed storm: registrations + cancels + approvals keep counters exact and never negative", async () => {
    const e = await makeEvent({ registrationMode: "approval", capacity: 6, pendingHoldsSeats: true });
    const first = [];
    for (let i = 0; i < 6; i++) first.push(okOf(await reg(e.id)));
    await Promise.all([
      ...first.slice(0, 3).map((r) => approve(r.registrationId, { skipEmails: true })),
      ...first.slice(3, 5).map((r) => cancel(r.registrationId, { skipEmails: true })),
      reject(first[5]!.registrationId, { skipEmails: true }),
      ...Array.from({ length: 6 }, () => reg(e.id)),
    ]);
    await expectCountersMatch(e.id);
  });
});

describe("admin services", () => {
  const valid = (over: Record<string, unknown> = {}) => {
    const r = parseEventInput({ title: "Evento admin", startsAt: "2027-03-01T18:00", status: "published", ctaType: "registration", registrationMode: "limited", capacity: "10", ...over });
    if (!r.ok) throw new Error(JSON.stringify(r.errors));
    return r.data;
  };
  it("saveEvent creates the event + form v1, updates create new versions only when the form changes", async () => {
    const created = await saveEvent(null, valid({ title: "Evento admin uno" }));
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect((await getLatestFormVersion(created.id))!.version).toBe(1);
    const extra: EventFormField[] = [...DEFAULT_FIELDS, { id: "c_abc", type: "text", label: "Altro", required: false }];
    const r2 = parseEventInput({ title: "Evento admin uno", startsAt: "2027-03-01T18:00", status: "published", ctaType: "registration", registrationMode: "limited", capacity: "10", formFields: JSON.stringify(extra) });
    if (!r2.ok) throw new Error(JSON.stringify(r2.errors));
    expect((await saveEvent(created.id, r2.data)).ok).toBe(true);
    expect((await getLatestFormVersion(created.id))!.version).toBe(2);
    expect((await saveEvent(created.id, r2.data)).ok).toBe(true);
    expect((await getLatestFormVersion(created.id))!.version).toBe(2);
  });
  it("slug must be unique", async () => {
    await saveEvent(null, valid({ title: "Slug A", slug: "slug-condiviso" }));
    const dup = await saveEvent(null, valid({ title: "Slug B", slug: "slug-condiviso" }));
    expect(dup).toMatchObject({ ok: false, fieldErrors: { slug: expect.any(String) } });
  });
  it("guards: capacity below assigned seats, toggling holds with pending requests", async () => {
    const c = await saveEvent(null, valid({ title: "Guard", registrationMode: "approval", capacity: "5", pendingHoldsSeats: "on" }));
    if (!c.ok) throw new Error("create failed");
    const a = okOf(await reg(c.id));
    await approve(a.registrationId, { skipEmails: true });
    okOf(await reg(c.id)); // pending, holding
    expect(await saveEvent(c.id, valid({ title: "Guard", registrationMode: "approval", capacity: "1", pendingHoldsSeats: "on" }))).toMatchObject({ ok: false, fieldErrors: { capacity: expect.any(String) } });
    expect(await saveEvent(c.id, valid({ title: "Guard", registrationMode: "approval", capacity: "5" }))).toMatchObject({ ok: false, fieldErrors: { pendingHoldsSeats: expect.any(String) } });
    expect((await saveEvent(c.id, valid({ title: "Guard 2", registrationMode: "approval", capacity: "9", pendingHoldsSeats: "on" }))).ok).toBe(true);
  });
  it("duplicate = draft copy with its own form, zero registrations; delete refuses active registrations", async () => {
    const c = await saveEvent(null, valid({ title: "Originale", registrationMode: "open" }));
    if (!c.ok) throw new Error("x");
    okOf(await reg(c.id));
    const copyId = (await duplicateEvent(c.id))!;
    const copy = await getEvent(copyId);
    expect(copy).toMatchObject({ status: "draft", seatsConfirmed: 0, featured: false });
    expect(copy.slug).not.toBe((await getEvent(c.id)).slug);
    expect(await regsOf(copyId)).toHaveLength(0);
    expect((await getLatestFormVersion(copyId))!.fields.map((f) => f.id)).toEqual(["name", "email", "phone"]);
    expect(await deleteEvent(c.id)).toMatchObject({ ok: false, reason: "has_registrations", active: 1 });
    expect(await deleteEvent(copyId)).toMatchObject({ ok: true });
    expect(await db.select().from(schema.events).where(eq(schema.events.id, copyId))).toHaveLength(0);
    // history-only registrations (cancelled) do not block deletion
    const regs = await regsOf(c.id);
    await cancel(regs[0]!.id, { skipEmails: true });
    expect(await deleteEvent(c.id)).toMatchObject({ ok: true, removedRegistrations: 1 });
  });
  it("listAdminEvents: counters per status and CSV export with snapshot answers", async () => {
    const e = await makeEvent({ title: "Con CSV", registrationMode: "approval" }, [...DEFAULT_FIELDS, { id: "nota", type: "text", label: "Nota", required: false }]);
    const a = okOf(await reg(e.id, person({ name: "=cmd|calc", nota: "ciao, \"mondo\"" })));
    okOf(await reg(e.id));
    await approve(a.registrationId, { skipEmails: true });
    const row = (await listAdminEvents({})).find((r) => r.event.id === e.id)!;
    expect(row.counts).toMatchObject({ confirmed: 1, pending: 1 });
    const csv = await registrationsCsv({ eventId: e.id });
    expect(csv).toContain("'=cmd|calc");
    expect(csv).toContain('"ciao, ""mondo"""');
    expect(csv.split("\r\n").filter(Boolean)).toHaveLength(3);
  });
  it("home cards: upcoming only, featured first", async () => {
    const f = await makeEvent({ title: "Evidenza", featured: true, startsAt: Date.now() + 50 * DAY });
    const soon = await makeEvent({ title: "Presto", startsAt: Date.now() + 1 * DAY });
    await makeEvent({ title: "Vecchio", startsAt: Date.now() - 5 * DAY });
    const cards = await getHomeEvents(50);
    const ids = cards.map((c) => c.id);
    expect(ids.indexOf(f.id)).toBeLessThan(ids.indexOf(soon.id));
    expect(cards.every((c) => !c.isPast)).toBe(true);
    expect(cards.find((c) => c.id === soon.id)!.registrationLabel).toBe("Iscrizioni aperte");
    expect(newId()).toBeTruthy();
  });
});
