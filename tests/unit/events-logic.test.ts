import { describe, expect, it } from "vitest";
import { buildCta, normalizeWhatsappNumber, validateCtaTarget } from "@/lib/events/cta";
import { toCsv } from "@/lib/events/csv";
import { DEFAULT_FIELDS, formFieldsSchema, normalizeFields, parseSubmission, type EventFormField } from "@/lib/events/forms";
import { DEFAULT_MESSAGES, MODE_COPY, messageFor, stateMessage } from "@/lib/events/messages";
import { getRegistrationState, seatsRemaining, type StateInput } from "@/lib/events/state";
import { msToRomeLocal, romeLocalToMs } from "@/lib/events/time";
import { parseEventInput } from "@/lib/events/validation";

const NOW = Date.UTC(2026, 10, 1, 10, 0);
const H = 3600_000;
const base: StateInput = {
  status: "published", ctaType: "registration", registrationMode: "open", startsAt: NOW + 48 * H, endsAt: null, capacity: null,
  seatsConfirmed: 0, seatsHeld: 0, registrationOpensAt: null, registrationClosesAt: null, registrationManuallyClosed: false,
};

describe("getRegistrationState (pure)", () => {
  it("open / not_applicable", () => {
    expect(getRegistrationState(base, NOW)).toBe("open");
    expect(getRegistrationState({ ...base, ctaType: "external_link" }, NOW)).toBe("not_applicable");
    expect(getRegistrationState({ ...base, ctaType: "none" }, NOW)).toBe("not_applicable");
    expect(getRegistrationState({ ...base, registrationMode: null }, NOW)).toBe("not_applicable");
  });
  it("past uses endsAt when present, startsAt otherwise", () => {
    expect(getRegistrationState({ ...base, startsAt: NOW - H }, NOW)).toBe("past");
    expect(getRegistrationState({ ...base, startsAt: NOW - H, endsAt: NOW + H }, NOW)).toBe("open");
  });
  it("manual close, close date, open date", () => {
    expect(getRegistrationState({ ...base, registrationManuallyClosed: true }, NOW)).toBe("closed");
    expect(getRegistrationState({ ...base, registrationClosesAt: NOW }, NOW)).toBe("closed");
    expect(getRegistrationState({ ...base, registrationClosesAt: NOW + H }, NOW)).toBe("open");
    expect(getRegistrationState({ ...base, registrationOpensAt: NOW + H }, NOW)).toBe("not_yet_open");
    expect(getRegistrationState({ ...base, registrationOpensAt: NOW }, NOW)).toBe("open");
  });
  it("full counts confirmed + held seats", () => {
    expect(getRegistrationState({ ...base, capacity: 5, seatsConfirmed: 4 }, NOW)).toBe("open");
    expect(getRegistrationState({ ...base, capacity: 5, seatsConfirmed: 5 }, NOW)).toBe("full");
    expect(getRegistrationState({ ...base, capacity: 5, seatsConfirmed: 3, seatsHeld: 2 }, NOW)).toBe("full");
    expect(seatsRemaining({ capacity: 5, seatsConfirmed: 9, seatsHeld: 0 })).toBe(0);
    expect(seatsRemaining({ capacity: null, seatsConfirmed: 9, seatsHeld: 0 })).toBeNull();
  });
  it("draft / hidden events are never open", () => {
    expect(getRegistrationState({ ...base, status: "draft" }, NOW)).toBe("closed");
    expect(getRegistrationState({ ...base, status: "hidden" }, NOW)).toBe("closed");
  });
});

describe("microcopy (dossier 05, exact)", () => {
  it("mode copy", () => {
    expect(MODE_COPY.open).toMatchObject({ intro: "Partecipa all'evento. Compila il modulo per iscriverti.", button: "Invia iscrizione" });
    expect(MODE_COPY.limited).toMatchObject({ intro: "Assicurati il tuo posto. La disponibilità è limitata.", button: "Prenota il tuo posto" });
    expect(MODE_COPY.reserved).toMatchObject({ intro: "Richiedi di partecipare. Verificheremo i requisiti e ti comunicheremo l'esito.", button: "Invia richiesta" });
    expect(MODE_COPY.approval).toMatchObject({ intro: "La partecipazione è soggetta a conferma dell'organizzazione.", button: "Richiedi iscrizione" });
  });
  it("state messages and overrides; pending never says confirmed", () => {
    expect(DEFAULT_MESSAGES.confirmed).toBe("La tua iscrizione è confermata. Riceverai i dettagli relativi alla partecipazione.");
    expect(DEFAULT_MESSAGES.pending).toBe("Abbiamo ricevuto la tua richiesta. La partecipazione non è ancora confermata.");
    expect(DEFAULT_MESSAGES.full).toBe("Le iscrizioni sono al completo. Al momento non sono disponibili altri posti.");
    expect(DEFAULT_MESSAGES.closed).toBe("Le iscrizioni a questo evento sono terminate.");
    expect(DEFAULT_MESSAGES.past).toBe("Questo evento si è concluso. Scopri le altre iniziative in programma.");
    expect(DEFAULT_MESSAGES.pending).not.toMatch(/è confermata/);
    const ev = { successMessage: { full: "Tutto esaurito!", junk: 1, closed: "  " }, registrationOpensAt: null };
    expect(stateMessage(ev, "full")).toBe("Tutto esaurito!");
    expect(stateMessage(ev, "closed")).toBe(DEFAULT_MESSAGES.closed);
    expect(messageFor({ successMessage: null }, "pending")).toBe(DEFAULT_MESSAGES.pending);
  });
});

describe("time (Europe/Rome)", () => {
  it("round-trips across DST", () => {
    for (const s of ["2026-01-15T18:30", "2026-07-15T18:30", "2026-03-29T12:00", "2026-10-25T12:00"]) {
      expect(msToRomeLocal(romeLocalToMs(s)!)).toBe(s);
    }
    expect(romeLocalToMs("2026-07-15T18:30")).toBe(Date.UTC(2026, 6, 15, 16, 30));
    expect(romeLocalToMs("2026-01-15T18:30")).toBe(Date.UTC(2026, 0, 15, 17, 30));
    expect(romeLocalToMs("2026-02-31T10:00")).toBeNull();
    expect(romeLocalToMs("boh")).toBeNull();
  });
});

describe("CTA validation and links", () => {
  it("external link: https only", () => {
    expect(validateCtaTarget("external_link", "https://example.org/x")).toMatchObject({ ok: true });
    for (const bad of ["http://example.org", "javascript:alert(1)", "example.org", "https://u:p@example.org", "", "ftp://x.it", "data:text/html,x"]) {
      expect(validateCtaTarget("external_link", bad).ok).toBe(false);
    }
  });
  it("whatsapp number normalisation and wa.me link with text", () => {
    expect(normalizeWhatsappNumber("+39 331 8586827")).toBe("393318586827");
    expect(normalizeWhatsappNumber("331 8586827")).toBe("393318586827");
    expect(normalizeWhatsappNumber("0039 331 8586827")).toBe("393318586827");
    expect(normalizeWhatsappNumber("abc")).toBeNull();
    const cta = buildCta({ ctaType: "whatsapp", ctaLabel: "Scrivici", ctaTarget: "393318586827", title: "Cena sociale", successMessage: null });
    expect(cta).toMatchObject({ kind: "link", label: "Scrivici", external: true });
    expect((cta as { href: string }).href).toBe(`https://wa.me/393318586827?text=${encodeURIComponent("Ciao! Vorrei avere informazioni sull'evento «Cena sociale».")}`);
    const custom = buildCta({ ctaType: "whatsapp", ctaLabel: null, ctaTarget: "393318586827", title: "X", successMessage: { whatsappText: "Ciao a tutti" } });
    expect((custom as { href: string }).href).toBe("https://wa.me/393318586827?text=Ciao%20a%20tutti");
  });
  it("email, contact, none", () => {
    expect(validateCtaTarget("email", "info@example.org")).toEqual({ ok: true, value: "info@example.org" });
    expect(validateCtaTarget("email", "non-una-email").ok).toBe(false);
    const mail = buildCta({ ctaType: "email", ctaLabel: "Scrivici", ctaTarget: "info@example.org", title: "Cena", successMessage: null });
    expect((mail as { href: string }).href).toMatch(/^mailto:info@example\.org\?subject=/);
    expect(buildCta({ ctaType: "contact", ctaLabel: null, ctaTarget: null, title: "x", successMessage: null })).toMatchObject({ href: "/contatti" });
    expect(buildCta({ ctaType: "none", ctaLabel: null, ctaTarget: null, title: "x", successMessage: null })).toEqual({ kind: "none" });
    // a corrupted stored target never becomes a clickable link
    expect(buildCta({ ctaType: "external_link", ctaLabel: null, ctaTarget: "javascript:alert(1)", title: "x", successMessage: null })).toEqual({ kind: "none" });
  });
});

describe("dynamic form validation (server side, built from the version)", () => {
  const fields: EventFormField[] = [
    ...DEFAULT_FIELDS,
    { id: "gruppo", type: "select", label: "Gruppo", required: true, options: ["A", "B"] },
    { id: "note", type: "textarea", label: "Note", required: false },
    { id: "consenso", type: "checkbox", label: "Accetto", required: true },
    { id: "posti", type: "seats", label: "Quante persone", required: true, min: 1, max: 4 },
  ];
  const ok = { name: "Ada Lovelace", email: "ada@example.org", phone: "", gruppo: "A", note: "", consenso: "on", posti: "2" };
  it("accepts valid input and coerces types", () => {
    const r = parseSubmission(fields, ok, { maxSeats: 3 });
    expect(r).toMatchObject({ ok: true, values: { gruppo: "A", consenso: true, posti: 2 } });
  });
  it("rejects missing/invalid fields with per-field messages", () => {
    const r = parseSubmission(fields, { ...ok, email: "no", gruppo: "Z", consenso: "", name: "A" }, { maxSeats: 3 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["consenso", "email", "gruppo", "name"]);
  });
  it("seats are bounded by field max AND event maxSeatsPerRequest", () => {
    expect(parseSubmission(fields, { ...ok, posti: "4" }, { maxSeats: 3 }).ok).toBe(false);
    expect(parseSubmission(fields, { ...ok, posti: "3" }, { maxSeats: 3 }).ok).toBe(true);
    expect(parseSubmission(fields, { ...ok, posti: "0" }, { maxSeats: 3 }).ok).toBe(false);
    expect(parseSubmission(fields, { ...ok, posti: "-1" }, { maxSeats: 3 }).ok).toBe(false);
    expect(parseSubmission(fields, { ...ok, posti: "1.5" }, { maxSeats: 3 }).ok).toBe(false);
    expect(parseSubmission(fields, { ...ok, posti: "abc" }, { maxSeats: 3 }).ok).toBe(false);
  });
  it("ignores unknown keys and rejects control characters", () => {
    const r = parseSubmission(fields, { ...ok, evil: "x", status: "confirmed" }, { maxSeats: 3 });
    expect(r.ok && "evil" in r.values).toBe(false);
    expect(parseSubmission(fields, { ...ok, name: "Ada\u0000 Lovelace" }, { maxSeats: 3 }).ok).toBe(false);
  });
  it("builder schema: requires name+email, unique ids, select options, one seats field", () => {
    expect(formFieldsSchema.safeParse(DEFAULT_FIELDS).success).toBe(true);
    expect(formFieldsSchema.safeParse(DEFAULT_FIELDS.slice(1)).success).toBe(false);
    expect(formFieldsSchema.safeParse([...DEFAULT_FIELDS, { id: "x", type: "select", label: "S", required: false, options: ["solo"] }]).success).toBe(false);
    expect(formFieldsSchema.safeParse([...DEFAULT_FIELDS, { id: "name", type: "text", label: "dup", required: false }]).success).toBe(false);
    const s = { type: "seats", label: "n", required: true } as const;
    expect(formFieldsSchema.safeParse([...DEFAULT_FIELDS, { id: "a", ...s }, { id: "b", ...s }]).success).toBe(false);
  });
  it("normalizeFields keeps name/email first+locked and forces the requirement field on reserved events", () => {
    const messy = [{ id: "x", type: "text", label: "X", required: false, options: ["no"] }, { id: "email", type: "text", label: "Mail", required: false }] as EventFormField[];
    const n = normalizeFields(messy, "reserved");
    expect(n.map((f) => f.id)).toEqual(["name", "email", "requisito", "x"]);
    expect(n[1]).toMatchObject({ type: "email", required: true, label: "Mail" });
    expect(n.find((f) => f.id === "requisito")).toMatchObject({ required: true });
    expect(n.find((f) => f.id === "x")?.options).toBeUndefined();
  });
});

describe("event input validation (admin)", () => {
  const valid = { title: "Cena sociale", startsAt: "2026-12-05T20:00", status: "draft", ctaType: "none" };
  it("accepts a minimal event and generates the slug", () => {
    const r = parseEventInput(valid);
    expect(r.ok && r.data.slug).toBe("cena-sociale");
  });
  it("rejects bad URLs / phone / email targets", () => {
    expect(parseEventInput({ ...valid, ctaType: "external_link", ctaTarget: "http://x.it" }).ok).toBe(false);
    expect(parseEventInput({ ...valid, ctaType: "whatsapp", ctaTarget: "12" }).ok).toBe(false);
    expect(parseEventInput({ ...valid, ctaType: "email", ctaTarget: "x" }).ok).toBe(false);
    const wa = parseEventInput({ ...valid, ctaType: "whatsapp", ctaTarget: "+39 331 8586827" });
    expect(wa.ok && wa.data.ctaTarget).toBe("393318586827");
  });
  it("registration rules: limited needs capacity, reserved needs criteria, hold needs capacity, end>=start", () => {
    const reg = { ...valid, ctaType: "registration" };
    expect(parseEventInput({ ...reg }).ok).toBe(false); // no mode
    expect(parseEventInput({ ...reg, registrationMode: "limited" }).ok).toBe(false);
    expect(parseEventInput({ ...reg, registrationMode: "limited", capacity: "20" }).ok).toBe(true);
    expect(parseEventInput({ ...reg, registrationMode: "reserved" }).ok).toBe(false);
    expect(parseEventInput({ ...reg, registrationMode: "reserved", reservedCriteria: "Partner" }).ok).toBe(true);
    expect(parseEventInput({ ...reg, registrationMode: "approval", pendingHoldsSeats: "on" }).ok).toBe(false);
    expect(parseEventInput({ ...reg, registrationMode: "approval", pendingHoldsSeats: "on", capacity: "5" }).ok).toBe(true);
    expect(parseEventInput({ ...reg, registrationMode: "limited", capacity: "2", maxSeatsPerRequest: "3" }).ok).toBe(false);
    expect(parseEventInput({ ...valid, endsAt: "2026-12-05T19:00" }).ok).toBe(false);
    expect(parseEventInput({ ...reg, registrationMode: "open", registrationOpensAt: "2026-12-02T10:00", registrationClosesAt: "2026-12-01T10:00" }).ok).toBe(false);
  });
  it("open mode drops capacity; non-registration events drop registration settings", () => {
    const r = parseEventInput({ ...valid, ctaType: "registration", registrationMode: "open", capacity: "10" });
    expect(r.ok && r.data.capacity).toBeNull();
    const r2 = parseEventInput({ ...valid, ctaType: "contact", registrationMode: "limited", capacity: "10" });
    expect(r2.ok && [r2.data.registrationMode, r2.data.capacity]).toEqual([null, null]);
  });
  it("body: rich text is sanitized on save (no scripts, no inline handlers)", () => {
    const r = parseEventInput({ ...valid, body: '<p onclick="x()">Ciao</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>' });
    expect(r.ok && r.data.body).toBe("<p>Ciao</p><a>x</a>");
  });
});

describe("csv", () => {
  it("defuses formula injection and quotes properly", () => {
    const out = toCsv(["a", "b"], [["=SUM(A1)", 'he said "hi", ok'], ["+1", "@x"]]);
    expect(out).toContain("'=SUM(A1)");
    expect(out).toContain('"he said ""hi"", ok"');
    expect(out).toContain("'+1,'@x");
  });
});
