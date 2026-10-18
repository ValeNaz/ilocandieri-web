import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db as defaultDb, newId, schema, type Db } from "@/lib/db";
import { sendRegistrationEmails } from "./emails";
import { buildAnswers, ensureFormVersion, parseSubmission } from "./forms";
import { messageFor, stateMessage } from "./messages";
import { getRegistrationState, holdsSeats, seatsRemaining, type EventRow, type RegistrationRow } from "./state";
import { isUniqueViolation, runTx, TxAbort, type Tx } from "./tx";

const E = schema.events;
const R = schema.registrations;

export type RegisterInput = {
  eventId: string;
  /** Version of the form the visitor saw. When it is not the latest, the submission is refused (form_outdated). */
  formVersionId?: string | null;
  /** Raw values keyed by form field id. */
  values: Record<string, unknown>;
  ipHash?: string | null;
  /** Timestamp of the privacy notice acknowledgement (public form); stored in the answers snapshot. */
  privacyAcceptedAt?: number | null;
  now?: number;
  /** Tests: skip sending emails. */
  skipEmails?: boolean;
};

export type RegisterFailureReason = "not_found" | "not_applicable" | "closed" | "not_yet_open" | "full" | "past" | "invalid" | "duplicate" | "not_enough_seats" | "form_outdated";

export type RegisterResult =
  | { ok: true; registrationId: string; status: "confirmed" | "pending"; seats: number; message: string; eventTitle: string }
  | { ok: false; reason: RegisterFailureReason; message: string; fieldErrors?: Record<string, string>; remaining?: number | null };

const fail = (reason: RegisterFailureReason, message: string, extra: { fieldErrors?: Record<string, string>; remaining?: number | null } = {}): RegisterResult => ({ ok: false, reason, message, ...extra });

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const dedupeKeyFor = (eventId: string, email: string) => `${eventId}:${normalizeEmail(email)}`;

/** Atomic seat claim. rowsAffected=0 (no row returned) = capacity would be exceeded. */
async function claimConfirmed(tx: Tx, eventId: string, n: number) {
  const rows = await tx
    .update(E)
    .set({ seatsConfirmed: sql`${E.seatsConfirmed} + ${n}` })
    .where(and(eq(E.id, eventId), or(isNull(E.capacity), sql`${E.seatsConfirmed} + ${E.seatsHeld} + ${n} <= ${E.capacity}`)))
    .returning({ id: E.id });
  return rows.length > 0;
}

async function claimHeld(tx: Tx, eventId: string, n: number) {
  const rows = await tx
    .update(E)
    .set({ seatsHeld: sql`${E.seatsHeld} + ${n}` })
    .where(and(eq(E.id, eventId), sql`${E.capacity} IS NOT NULL AND ${E.seatsConfirmed} + ${E.seatsHeld} + ${n} <= ${E.capacity}`))
    .returning({ id: E.id });
  return rows.length > 0;
}

const releaseConfirmed = (tx: Tx, eventId: string, n: number) =>
  tx.update(E).set({ seatsConfirmed: sql`MAX(0, ${E.seatsConfirmed} - ${n})` }).where(eq(E.id, eventId));

const releaseHeld = (tx: Tx, eventId: string, n: number) =>
  tx.update(E).set({ seatsHeld: sql`MAX(0, ${E.seatsHeld} - ${n})` }).where(eq(E.id, eventId));

/**
 * Create a registration. Validation is rebuilt SERVER-SIDE from the form version; capacity is claimed
 * atomically; open/limited modes confirm immediately, approval/reserved modes ALWAYS create a pending request
 * (reserved: the declared requirement is collected but never confirms by itself).
 */
export async function register(input: RegisterInput, d: Db = defaultDb): Promise<RegisterResult> {
  const now = input.now ?? Date.now();
  const [event0] = await d.select().from(E).where(eq(E.id, input.eventId));
  if (!event0 || event0.status !== "published") return fail("not_found", "Evento non trovato.");

  const precheck = checkState(event0, now);
  if (precheck) return precheck;

  const version = await ensureFormVersion(event0.id, event0.registrationMode, d);
  if (input.formVersionId && input.formVersionId !== version.id) {
    return fail("form_outdated", "Il modulo è stato aggiornato nel frattempo. Ricarica la pagina e compila di nuovo.");
  }

  const parsed = parseSubmission(version.fields, input.values, { maxSeats: Math.max(1, event0.maxSeatsPerRequest) });
  if (!parsed.ok) return fail("invalid", "Controlla i campi evidenziati.", { fieldErrors: parsed.errors });
  const v = parsed.values;

  const name = String(v.name);
  const email = String(v.email).trim();
  const seatsField = version.fields.find((f) => f.type === "seats");
  const seats = seatsField ? Number(v[seatsField.id]) : 1;
  const phoneField = version.fields.find((f) => f.type === "phone");
  const phone = phoneField && v[phoneField.id] ? String(v[phoneField.id]) : null;
  const dedupeKey = dedupeKeyFor(event0.id, email);
  const duplicateMsg = "Per questo evento risulta già una richiesta con questo indirizzo email.";

  const [dup] = await d.select({ id: R.id }).from(R).where(eq(R.dedupeKey, dedupeKey));
  if (dup) return fail("duplicate", duplicateMsg);

  const status: "confirmed" | "pending" = event0.registrationMode === "open" || event0.registrationMode === "limited" ? "confirmed" : "pending";
  const registrationId = newId();

  const outcome = await runTx<RegisterResult | "created">(async (tx) => {
    // Re-read inside the write transaction: closure/capacity changes made meanwhile are honoured.
    const [event] = await tx.select().from(E).where(eq(E.id, event0.id));
    if (!event || event.status !== "published") throw new TxAbort(fail("not_found", "Evento non trovato."));
    const again = checkState(event, now);
    if (again) throw new TxAbort(again);
    if (event.maxSeatsPerRequest < seats) throw new TxAbort(fail("invalid", "Controlla i campi evidenziati.", { fieldErrors: seatsField ? { [seatsField.id]: `Puoi richiedere al massimo ${event.maxSeatsPerRequest} posti per volta.` } : undefined }));

    let claimed = true;
    if (status === "confirmed") claimed = await claimConfirmed(tx, event.id, seats);
    else if (holdsSeats(event)) claimed = await claimHeld(tx, event.id, seats);
    else {
      // Pending without holds: soft check only (the binding check happens at approval).
      const rem = seatsRemaining(event);
      claimed = rem == null || rem >= seats;
    }
    if (!claimed) {
      const [fresh] = await tx.select().from(E).where(eq(E.id, event.id));
      const rem = fresh ? seatsRemaining(fresh) : 0;
      throw new TxAbort(notEnough(rem, fresh ?? event));
    }

    try {
      await tx.insert(R).values({
        id: registrationId,
        eventId: event.id,
        formVersionId: version.id,
        status,
        seats,
        name,
        email,
        emailNormalized: normalizeEmail(email),
        phone,
        answers: [
          ...buildAnswers(version.fields, v),
          ...(input.privacyAcceptedAt ? [{ fieldId: "_privacy", label: "Presa visione dell'informativa privacy", value: true }] : []),
        ],
        dedupeKey,
        decidedAt: status === "confirmed" ? now : null,
        ipHash: input.ipHash ?? null,
        createdAt: now,
      });
    } catch (e) {
      if (isUniqueViolation(e, "dedupe_key")) throw new TxAbort(fail("duplicate", duplicateMsg));
      throw e;
    }
    return "created";
  }, d);

  if (outcome !== "created") return outcome;

  if (!input.skipEmails) await sendRegistrationEmails(registrationId, "created", d);
  return {
    ok: true,
    registrationId,
    status,
    seats,
    eventTitle: event0.title,
    message: messageFor(event0, status === "confirmed" ? "confirmed" : "pending"),
  };
}

function checkState(event: EventRow, now: number): RegisterResult | null {
  const state = getRegistrationState(event, now);
  switch (state) {
    case "open": return null;
    case "not_applicable": return fail("not_applicable", "Per questo evento non è prevista l'iscrizione online.");
    default: return fail(state, stateMessage(event, state) ?? "Iscrizioni non disponibili.");
  }
}

function notEnough(remaining: number | null, event: EventRow): RegisterResult {
  if (!remaining || remaining <= 0) return fail("full", stateMessage(event, "full") ?? messageFor(event, "full"), { remaining: 0 });
  return fail("not_enough_seats", `Non ci sono abbastanza posti per questa richiesta: ne restano ${remaining}.`, { remaining });
}

// ---------------------------------------------------------------------------------------------
// Admin decisions
// ---------------------------------------------------------------------------------------------
export type DecideFailureReason = "not_found" | "invalid_state" | "capacity_exceeded";
export type DecideResult =
  | { ok: true; registration: RegistrationRow }
  | { ok: false; reason: DecideFailureReason; message: string };

const decideFail = (reason: DecideFailureReason, message: string): DecideResult => ({ ok: false, reason, message });

type DecideOpts = { userId?: string | null; note?: string | null; now?: number; skipEmails?: boolean };

/** pending -> confirmed. The capacity is checked ATOMICALLY again at this moment. */
export async function approve(registrationId: string, opts: DecideOpts = {}, d: Db = defaultDb): Promise<DecideResult> {
  const now = opts.now ?? Date.now();
  const res = await runTx<DecideResult>(async (tx) => {
    const [reg] = await tx.select().from(R).where(eq(R.id, registrationId));
    if (!reg) throw new TxAbort(decideFail("not_found", "Iscrizione non trovata."));
    if (reg.status !== "pending") throw new TxAbort(decideFail("invalid_state", "Si possono approvare solo le richieste in attesa."));
    const [event] = await tx.select().from(E).where(eq(E.id, reg.eventId));
    if (!event) throw new TxAbort(decideFail("not_found", "Evento non trovato."));

    const upd = await tx
      .update(R)
      .set({ status: "confirmed", decidedAt: now, decidedBy: opts.userId ?? null, ...(opts.note != null ? { adminNote: opts.note } : {}) })
      .where(and(eq(R.id, reg.id), eq(R.status, "pending")))
      .returning();
    if (upd.length === 0) throw new TxAbort(decideFail("invalid_state", "La richiesta è già stata gestita."));

    if (holdsSeats(event)) {
      // Seats already counted as held: move them to confirmed (cannot exceed capacity).
      await tx.update(E).set({ seatsHeld: sql`MAX(0, ${E.seatsHeld} - ${reg.seats})`, seatsConfirmed: sql`${E.seatsConfirmed} + ${reg.seats}` }).where(eq(E.id, event.id));
    } else if (!(await claimConfirmed(tx, event.id, reg.seats))) {
      const [fresh] = await tx.select().from(E).where(eq(E.id, event.id));
      const rem = fresh ? (seatsRemaining(fresh) ?? 0) : 0;
      throw new TxAbort(decideFail("capacity_exceeded", `Capienza superata: la richiesta è di ${reg.seats} ${reg.seats === 1 ? "posto" : "posti"} e ne ${rem === 1 ? "resta 1" : `restano ${rem}`}. Libera dei posti o aumenta la capienza, poi riprova.`));
    }
    return { ok: true, registration: upd[0]! };
  }, d);
  if (res.ok && !opts.skipEmails) await sendRegistrationEmails(registrationId, "approved", d);
  return res;
}

async function release(tx: Tx, event: EventRow, reg: RegistrationRow) {
  if (reg.status === "confirmed") await releaseConfirmed(tx, event.id, reg.seats);
  else if (reg.status === "pending" && holdsSeats(event)) await releaseHeld(tx, event.id, reg.seats);
}

/** pending -> rejected. Frees the dedupe key (the person may apply again) and any held seats. */
export async function reject(registrationId: string, opts: DecideOpts = {}, d: Db = defaultDb): Promise<DecideResult> {
  return finish(registrationId, "rejected", ["pending"], "Si possono rifiutare solo le richieste in attesa.", opts, d);
}

/** pending|confirmed -> cancelled. Frees the seats. */
export async function cancel(registrationId: string, opts: DecideOpts = {}, d: Db = defaultDb): Promise<DecideResult> {
  return finish(registrationId, "cancelled", ["pending", "confirmed"], "Si possono annullare solo iscrizioni in attesa o confermate.", opts, d);
}

async function finish(registrationId: string, to: "rejected" | "cancelled", from: RegistrationRow["status"][], invalidMsg: string, opts: DecideOpts, d: Db): Promise<DecideResult> {
  const now = opts.now ?? Date.now();
  const res = await runTx<DecideResult>(async (tx) => {
    const [reg] = await tx.select().from(R).where(eq(R.id, registrationId));
    if (!reg) throw new TxAbort(decideFail("not_found", "Iscrizione non trovata."));
    if (!from.includes(reg.status)) throw new TxAbort(decideFail("invalid_state", invalidMsg));
    const [event] = await tx.select().from(E).where(eq(E.id, reg.eventId));
    if (!event) throw new TxAbort(decideFail("not_found", "Evento non trovato."));
    const upd = await tx
      .update(R)
      .set({ status: to, dedupeKey: null, decidedAt: now, decidedBy: opts.userId ?? null, ...(opts.note != null ? { adminNote: opts.note } : {}) })
      .where(and(eq(R.id, reg.id), inArray(R.status, from)))
      .returning();
    if (upd.length === 0) throw new TxAbort(decideFail("invalid_state", "La richiesta è già stata gestita."));
    await release(tx, event, reg);
    return { ok: true, registration: upd[0]! };
  }, d);
  if (res.ok && !opts.skipEmails) await sendRegistrationEmails(registrationId, to === "rejected" ? "rejected" : "cancelled", d);
  return res;
}

/** Reconcile the denormalised counters from the registrations table (safety net / admin button). */
export async function recount(eventId: string, d: Db = defaultDb) {
  return runTx(async (tx) => {
    const [event] = await tx.select().from(E).where(eq(E.id, eventId));
    if (!event) return null;
    const sums = await tx
      .select({ status: R.status, seats: sql<number>`COALESCE(SUM(${R.seats}), 0)` })
      .from(R)
      .where(and(eq(R.eventId, eventId), inArray(R.status, ["confirmed", "pending"])))
      .groupBy(R.status);
    const confirmed = Number(sums.find((s) => s.status === "confirmed")?.seats ?? 0);
    const pending = Number(sums.find((s) => s.status === "pending")?.seats ?? 0);
    const held = holdsSeats(event) ? pending : 0;
    await tx.update(E).set({ seatsConfirmed: confirmed, seatsHeld: held }).where(eq(E.id, eventId));
    return { seatsConfirmed: confirmed, seatsHeld: held, previous: { seatsConfirmed: event.seatsConfirmed, seatsHeld: event.seatsHeld }, pendingSeats: pending };
  }, d);
}

export async function setAdminNote(registrationId: string, note: string, d: Db = defaultDb) {
  const rows = await d.update(R).set({ adminNote: note.trim() || null }).where(eq(R.id, registrationId)).returning({ id: R.id });
  return rows.length > 0;
}
