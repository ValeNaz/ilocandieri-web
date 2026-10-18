// INTERFACE CONTRACT (owner: EVENTS agent). `getHomeEvents` + `EventCardData` signatures are stable (used by the Home).
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mediaUrl } from "@/lib/storage";
import { registrationBadge } from "./messages";
import { getRegistrationState, isEventPast, seatsRemaining, type EventRow, type RegistrationState } from "./state";

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  startsAt: number;
  endsAt: number | null;
  location: string | null;
  coverUrl: string | null;
  coverAlt: string;
  categoryName: string | null;
  isPast: boolean;
  registrationLabel: string | null; // e.g. "Iscrizioni aperte", "Posti esauriti"
};

const E = schema.events;
const published = eq(E.status, "published");

const selection = {
  event: E,
  coverPath: schema.media.path,
  coverAlt: schema.media.alt,
  coverWidth: schema.media.width,
  coverHeight: schema.media.height,
  categoryName: schema.eventCategories.name,
  categorySlug: schema.eventCategories.slug,
};

type Joined = {
  event: EventRow;
  coverPath: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  categoryName: string | null;
  categorySlug: string | null;
};

function baseQuery() {
  return db
    .select(selection)
    .from(E)
    .leftJoin(schema.media, eq(schema.media.id, E.coverId))
    .leftJoin(schema.eventCategories, eq(schema.eventCategories.id, E.categoryId));
}

function toCard(r: Joined, now: number): EventCardData {
  const past = isEventPast(r.event, now);
  const state = getRegistrationState(r.event, now);
  return {
    id: r.event.id,
    slug: r.event.slug,
    title: r.event.title,
    summary: r.event.summary || null,
    startsAt: r.event.startsAt,
    endsAt: r.event.endsAt,
    location: r.event.location,
    coverUrl: r.coverPath ? mediaUrl(r.coverPath) : null,
    coverAlt: r.coverAlt || r.event.title,
    categoryName: r.categoryName,
    isPast: past,
    registrationLabel: past ? null : registrationBadge(state),
  };
}

/** "Not past" in SQL: COALESCE(ends_at, starts_at) >= now. */
const upcoming = (now: number) => gte(sql`COALESCE(${E.endsAt}, ${E.startsAt})`, now);

/** Published upcoming events for Home: featured first, then by date. */
export async function getHomeEvents(limit: number): Promise<EventCardData[]> {
  const now = Date.now();
  const rows = await baseQuery()
    .where(and(published, upcoming(now)))
    .orderBy(desc(E.featured), asc(E.startsAt))
    .limit(Math.max(0, Math.min(limit, 50)));
  return rows.map((r) => toCard(r, now));
}

export type PublicListing = {
  upcoming: EventCardData[];
  past: EventCardData[];
  categories: { slug: string; name: string }[];
  activeCategory: string | null;
  totalPublished: number;
};

export async function listPublicEvents(opts: { categorySlug?: string | null; pastLimit?: number } = {}): Promise<PublicListing> {
  const now = Date.now();
  const all = await baseQuery().where(published);
  const catMap = new Map<string, string>();
  for (const r of all) if (r.categorySlug && r.categoryName) catMap.set(r.categorySlug, r.categoryName);
  const active = opts.categorySlug && catMap.has(opts.categorySlug) ? opts.categorySlug : null;
  const rows = active ? all.filter((r) => r.categorySlug === active) : all;
  const up = rows.filter((r) => !isEventPast(r.event, now)).sort((a, b) => a.event.startsAt - b.event.startsAt);
  const past = rows.filter((r) => isEventPast(r.event, now)).sort((a, b) => b.event.startsAt - a.event.startsAt).slice(0, opts.pastLimit ?? 24);
  return {
    upcoming: up.map((r) => toCard(r, now)),
    past: past.map((r) => toCard(r, now)),
    categories: [...catMap].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name, "it")),
    activeCategory: active,
    totalPublished: all.length,
  };
}

export type PublicEvent = {
  event: EventRow;
  coverUrl: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  categoryName: string | null;
  isPast: boolean;
  state: RegistrationState;
  remaining: number | null;
};

/** Only `published` events exist for visitors: draft/hidden → null (→ 404). */
export async function getPublicEvent(slug: string, now = Date.now()): Promise<PublicEvent | null> {
  const [r] = await baseQuery().where(and(published, eq(E.slug, slug))).limit(1);
  if (!r) return null;
  return {
    event: r.event,
    coverUrl: r.coverPath ? mediaUrl(r.coverPath) : null,
    coverAlt: r.coverAlt || r.event.title,
    coverWidth: r.coverWidth,
    coverHeight: r.coverHeight,
    categoryName: r.categoryName,
    isPast: isEventPast(r.event, now),
    state: getRegistrationState(r.event, now),
    remaining: seatsRemaining(r.event),
  };
}

/** Small public payload to refresh the "posti disponibili" indicator. */
export async function getAvailability(slug: string, now = Date.now()) {
  const p = await getPublicEvent(slug, now);
  if (!p) return null;
  return { state: p.state, remaining: p.event.registrationMode === "limited" ? p.remaining : null };
}

/** For sitemap.ts (CONTENT module): published events with last update. */
export async function getPublishedEventSlugs(): Promise<{ slug: string; updatedAt: number }[]> {
  return db.select({ slug: E.slug, updatedAt: E.updatedAt }).from(E).where(published);
}
