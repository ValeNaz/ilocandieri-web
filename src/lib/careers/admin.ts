import { and, desc, eq, inArray, lt, or, sql, type SQL } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import { purgeOutboxFor } from "@/lib/email/outbox";
import { getStorage } from "@/lib/storage";
import { APPLICATION_STATUSES, type ApplicationStatus } from "./constants";

const DAY_MS = 86_400_000;

export type ApplicationFilters = { status?: string; area?: string; q?: string };

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function listApplications(f: ApplicationFilters, d: Db = defaultDb, limit = 200) {
  const where: SQL[] = [];
  if (f.status && (APPLICATION_STATUSES as readonly string[]).includes(f.status)) where.push(eq(schema.applications.status, f.status as ApplicationStatus));
  if (f.area) where.push(eq(schema.applications.area, f.area));
  const q = f.q?.trim();
  if (q) {
    const pat = `%${escapeLike(q.toLowerCase())}%`;
    where.push(
      or(
        sql`lower(${schema.applications.firstName} || ' ' || ${schema.applications.lastName}) like ${pat} escape '\\'`,
        sql`lower(${schema.applications.email}) like ${pat} escape '\\'`,
        sql`lower(${schema.applications.message}) like ${pat} escape '\\'`,
      )!,
    );
  }
  return d
    .select()
    .from(schema.applications)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.applications.createdAt))
    .limit(limit);
}

export async function applicationCounts(d: Db = defaultDb) {
  const rows = await d
    .select({ status: schema.applications.status, n: sql<number>`count(*)` })
    .from(schema.applications)
    .groupBy(schema.applications.status);
  const out = { new: 0, reviewing: 0, archived: 0, total: 0 };
  for (const r of rows) {
    out[r.status] = Number(r.n);
    out.total += Number(r.n);
  }
  return out;
}

export async function getApplication(id: string, d: Db = defaultDb) {
  const [row] = await d.select().from(schema.applications).where(eq(schema.applications.id, id));
  if (!row) return null;
  let opening: { id: string; title: string } | null = null;
  if (row.openingId) {
    const [o] = await d.select({ id: schema.jobOpenings.id, title: schema.jobOpenings.title }).from(schema.jobOpenings).where(eq(schema.jobOpenings.id, row.openingId));
    opening = o ?? null;
  }
  return { ...row, opening };
}

export async function setApplicationStatus(id: string, status: ApplicationStatus, d: Db = defaultDb): Promise<boolean> {
  const r = await d.update(schema.applications).set({ status }).where(eq(schema.applications.id, id)).returning({ id: schema.applications.id });
  return r.length > 0;
}

/** Delete the row AND its private CV file. */
export async function deleteApplications(ids: string[], d: Db = defaultDb): Promise<number> {
  if (ids.length === 0) return 0;
  const rows = await d.select({ id: schema.applications.id, cvPath: schema.applications.cvPath }).from(schema.applications).where(inArray(schema.applications.id, ids));
  const storage = getStorage();
  for (const r of rows) if (r.cvPath) await storage.remove("private", r.cvPath).catch(() => {});
  await d.delete(schema.applications).where(inArray(schema.applications.id, rows.map((r) => r.id)));
  for (const r of rows) await purgeOutboxFor(r.id, d); // emails to/about the candidate hold name + address
  return rows.length;
}

export const deleteApplication = (id: string, d: Db = defaultDb) => deleteApplications([id], d);

// ---------- Retention ----------

/** A retention value is "set" only when it is a positive integer number of days. */
export const isRetentionSet = (days: unknown): days is number => typeof days === "number" && Number.isFinite(days) && days >= 1;

const cutoff = (days: number, now: number) => now - days * DAY_MS;

export async function countApplicationsOlderThan(days: number, d: Db = defaultDb, now = Date.now()): Promise<number> {
  if (!isRetentionSet(days)) return 0;
  const [r] = await d.select({ n: sql<number>`count(*)` }).from(schema.applications).where(lt(schema.applications.createdAt, cutoff(days, now)));
  return Number(r?.n ?? 0);
}

export async function purgeApplicationsOlderThan(days: number, d: Db = defaultDb, now = Date.now()): Promise<number> {
  if (!isRetentionSet(days)) return 0;
  const rows = await d.select({ id: schema.applications.id }).from(schema.applications).where(lt(schema.applications.createdAt, cutoff(days, now)));
  return deleteApplications(rows.map((r) => r.id), d);
}

/** Registrations of events already over for more than `days` days (event end, or start when no end). */
const pastEventIds = (days: number, now: number) =>
  sql`${schema.registrations.eventId} IN (SELECT id FROM events WHERE coalesce(ends_at, starts_at) < ${cutoff(days, now)})`;

export async function countPastRegistrationsOlderThan(days: number, d: Db = defaultDb, now = Date.now()): Promise<number> {
  if (!isRetentionSet(days)) return 0;
  const [r] = await d.select({ n: sql<number>`count(*)` }).from(schema.registrations).where(pastEventIds(days, now));
  return Number(r?.n ?? 0);
}

export async function purgePastRegistrationsOlderThan(days: number, d: Db = defaultDb, now = Date.now()): Promise<number> {
  if (!isRetentionSet(days)) return 0;
  const rows = await d.delete(schema.registrations).where(pastEventIds(days, now)).returning({ id: schema.registrations.id });
  return rows.length;
}

export type RetentionReport = { applications: number | null; registrations: number | null };

/** Used by scripts/retention.ts. A null value in the settings means "not set": nothing is touched. */
export async function runRetention(
  settings: { applicationsDays?: number | null; pastRegistrationsDays?: number | null },
  opts: { dryRun?: boolean; now?: number; db?: Db } = {},
): Promise<RetentionReport> {
  const d = opts.db ?? defaultDb;
  const now = opts.now ?? Date.now();
  const rep: RetentionReport = { applications: null, registrations: null };
  if (isRetentionSet(settings.applicationsDays)) {
    rep.applications = opts.dryRun ? await countApplicationsOlderThan(settings.applicationsDays, d, now) : await purgeApplicationsOlderThan(settings.applicationsDays, d, now);
  }
  if (isRetentionSet(settings.pastRegistrationsDays)) {
    rep.registrations = opts.dryRun ? await countPastRegistrationsOlderThan(settings.pastRegistrationsDays, d, now) : await purgePastRegistrationsOlderThan(settings.pastRegistrationsDays, d, now);
  }
  return rep;
}

// ---------- Job openings ----------

export async function listOpenings(d: Db = defaultDb) {
  return d.select().from(schema.jobOpenings).orderBy(desc(schema.jobOpenings.createdAt));
}
export async function listPublicOpenings(d: Db = defaultDb) {
  return d.select().from(schema.jobOpenings).where(eq(schema.jobOpenings.status, "open")).orderBy(desc(schema.jobOpenings.createdAt));
}
