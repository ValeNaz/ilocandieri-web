import { and, asc, count, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import { toCsv } from "./csv";
import { formatAnswerValue } from "./forms";
import { getRegistrationState, isEventPast, type EventRow, type RegistrationRow, type RegistrationState } from "./state";
import { formatDateTime } from "@/lib/utils";

const E = schema.events;
const R = schema.registrations;

export type EventListFilter = { status?: EventRow["status"] | null; period?: "upcoming" | "past" | null };

export type AdminEventRow = {
  event: EventRow;
  categoryName: string | null;
  state: RegistrationState;
  isPast: boolean;
  counts: { pending: number; confirmed: number; rejected: number; cancelled: number; pendingSeats: number };
};

export async function listAdminEvents(filter: EventListFilter = {}, d: Db = defaultDb, now = Date.now()): Promise<AdminEventRow[]> {
  const conds: SQL[] = [];
  if (filter.status) conds.push(eq(E.status, filter.status));
  if (filter.period === "upcoming") conds.push(gte(sql`COALESCE(${E.endsAt}, ${E.startsAt})`, now));
  if (filter.period === "past") conds.push(lt(sql`COALESCE(${E.endsAt}, ${E.startsAt})`, now));
  const rows = await d
    .select({ event: E, categoryName: schema.eventCategories.name })
    .from(E)
    .leftJoin(schema.eventCategories, eq(schema.eventCategories.id, E.categoryId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(filter.period === "past" ? desc(E.startsAt) : asc(E.startsAt));
  const grouped = await d
    .select({ eventId: R.eventId, status: R.status, n: count(), seats: sql<number>`COALESCE(SUM(${R.seats}),0)` })
    .from(R)
    .groupBy(R.eventId, R.status);
  return rows.map((r) => {
    const counts = { pending: 0, confirmed: 0, rejected: 0, cancelled: 0, pendingSeats: 0 };
    for (const g of grouped) {
      if (g.eventId !== r.event.id) continue;
      counts[g.status] = g.n;
      if (g.status === "pending") counts.pendingSeats = Number(g.seats);
    }
    return { event: r.event, categoryName: r.categoryName, state: getRegistrationState(r.event, now), isPast: isEventPast(r.event, now), counts };
  });
}

export async function getAdminEvent(id: string, d: Db = defaultDb) {
  const [e] = await d.select().from(E).where(eq(E.id, id));
  return e ?? null;
}

export type RegistrationFilter = { eventId?: string | null; status?: RegistrationRow["status"] | null; q?: string | null; limit?: number; offset?: number };

export type AdminRegistrationRow = { registration: RegistrationRow; eventTitle: string; eventSlug: string; eventStartsAt: number };

function regConds(f: RegistrationFilter): SQL[] {
  const conds: SQL[] = [];
  if (f.eventId) conds.push(eq(R.eventId, f.eventId));
  if (f.status) conds.push(eq(R.status, f.status));
  const q = f.q?.trim().toLowerCase();
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(sql`(lower(${R.name}) LIKE ${like} ESCAPE '\\' OR ${R.emailNormalized} LIKE ${like} ESCAPE '\\')`);
  }
  return conds;
}

export async function listRegistrations(f: RegistrationFilter = {}, d: Db = defaultDb): Promise<{ rows: AdminRegistrationRow[]; total: number }> {
  const where = regConds(f);
  const [{ total }] = await d.select({ total: count() }).from(R).where(where.length ? and(...where) : undefined);
  const rows = await d
    .select({ registration: R, eventTitle: E.title, eventSlug: E.slug, eventStartsAt: E.startsAt })
    .from(R)
    .innerJoin(E, eq(E.id, R.eventId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(R.createdAt))
    .limit(f.limit ?? 50)
    .offset(f.offset ?? 0);
  return { rows, total };
}

export async function getRegistrationDetail(id: string, d: Db = defaultDb) {
  const [r] = await d.select({ registration: R, event: E, version: schema.eventFormVersions.version }).from(R).innerJoin(E, eq(E.id, R.eventId)).innerJoin(schema.eventFormVersions, eq(schema.eventFormVersions.id, R.formVersionId)).where(eq(R.id, id));
  return r ?? null;
}

/** Per-status counters (registrations and seats), optionally for a single event. */
export async function registrationTotals(eventId?: string | null, d: Db = defaultDb) {
  const rows = await d
    .select({ status: R.status, n: count(), seats: sql<number>`COALESCE(SUM(${R.seats}),0)` })
    .from(R)
    .where(eventId ? eq(R.eventId, eventId) : undefined)
    .groupBy(R.status);
  const out = { pending: { n: 0, seats: 0 }, confirmed: { n: 0, seats: 0 }, rejected: { n: 0, seats: 0 }, cancelled: { n: 0, seats: 0 } };
  for (const r of rows) out[r.status] = { n: r.n, seats: Number(r.seats) };
  return out;
}

/** For the admin dashboard (CAREERS module): upcoming events, pending requests, confirmed seats. */
export async function getEventStats(d: Db = defaultDb, now = Date.now()) {
  const [{ upcoming }] = await d.select({ upcoming: count() }).from(E).where(and(eq(E.status, "published"), gte(sql`COALESCE(${E.endsAt}, ${E.startsAt})`, now)));
  const totals = await registrationTotals(null, d);
  return { upcomingEvents: upcoming, pendingRegistrations: totals.pending.n, confirmedRegistrations: totals.confirmed.n, confirmedSeats: totals.confirmed.seats };
}

export const REGISTRATION_STATUSES = ["pending", "confirmed", "rejected", "cancelled"] as const;
const STATUS_IT: Record<RegistrationRow["status"], string> = { pending: "In attesa", confirmed: "Confermata", rejected: "Rifiutata", cancelled: "Annullata" };

/** CSV of registrations (all answers flattened as "Etichetta: valore"). */
export async function registrationsCsv(f: RegistrationFilter = {}, d: Db = defaultDb): Promise<string> {
  const { rows } = await listRegistrations({ ...f, limit: 100000, offset: 0 }, d);
  const labels: string[] = [];
  for (const r of rows) for (const a of r.registration.answers ?? []) if (!labels.includes(a.label)) labels.push(a.label);
  return toCsv(
    ["Evento", "Data evento", "Stato", "Posti", "Nome", "Email", "Telefono", "Ricevuta il", "Nota interna", ...labels],
    rows.map(({ registration: r, eventTitle, eventStartsAt }) => [
      eventTitle,
      formatDateTime(eventStartsAt),
      STATUS_IT[r.status],
      r.seats,
      r.name,
      r.email,
      r.phone ?? "",
      formatDateTime(r.createdAt),
      r.adminNote ?? "",
      ...labels.map((l) => formatAnswerValue(r.answers?.find((a) => a.label === l)?.value ?? "")),
    ]),
  );
}
