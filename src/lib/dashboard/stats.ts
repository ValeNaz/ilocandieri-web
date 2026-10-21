import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import { smtpConfig } from "@/lib/env";
import { isEmailConfigured } from "@/lib/email/sender";
import { getSetting } from "@/lib/settings";

const count = async (q: PromiseLike<{ n: number }[]>) => Number((await q)[0]?.n ?? 0);

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

/** Reads the tables directly (independent from the other modules' functions). */
export async function getDashboardStats(d: Db = defaultDb, now = Date.now()) {
  const n = sql<number>`count(*)`;
  const [upcomingEvents, pendingRegistrations, newApplications, publishedNews, newMessages, outbox, topEvents] = await Promise.all([
    count(d.select({ n }).from(schema.events).where(and(eq(schema.events.status, "published"), gte(sql`coalesce(${schema.events.endsAt}, ${schema.events.startsAt})`, now)))),
    count(d.select({ n }).from(schema.registrations).where(eq(schema.registrations.status, "pending"))),
    count(d.select({ n }).from(schema.applications).where(eq(schema.applications.status, "new"))),
    count(d.select({ n }).from(schema.news).where(eq(schema.news.status, "published"))),
    count(d.select({ n }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new"))),
    d.select({ status: schema.emailOutbox.status, n }).from(schema.emailOutbox).groupBy(schema.emailOutbox.status),
    d
      .select({ id: schema.events.id, title: schema.events.title, startsAt: schema.events.startsAt, capacity: schema.events.capacity, confirmed: schema.events.seatsConfirmed })
      .from(schema.events)
      .where(and(eq(schema.events.status, "published"), gte(sql`coalesce(${schema.events.endsAt}, ${schema.events.startsAt})`, now)))
      .orderBy(asc(schema.events.startsAt))
      .limit(5),
  ]);
  const o = Object.fromEntries(outbox.map((r) => [r.status, Number(r.n)])) as Partial<Record<"failed" | "not_configured" | "queued" | "sent", number>>;
  return {
    upcomingEvents,
    pendingRegistrations,
    newApplications,
    publishedNews,
    newMessages,
    emailProblems: (o.failed ?? 0) + (o.not_configured ?? 0),
    emailFailed: o.failed ?? 0,
    emailNotConfigured: o.not_configured ?? 0,
    topEvents,
  };
}

/** Counts for the sidebar badges: what is waiting for someone. Cheap (four counts), read on every admin page. */
export async function getAdminBadges(d: Db = defaultDb) {
  const n = sql<number>`count(*)`;
  const [registrations, applications, messages, email] = await Promise.all([
    count(d.select({ n }).from(schema.registrations).where(eq(schema.registrations.status, "pending"))),
    count(d.select({ n }).from(schema.applications).where(eq(schema.applications.status, "new"))),
    count(d.select({ n }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new"))),
    count(d.select({ n }).from(schema.emailOutbox).where(sql`${schema.emailOutbox.status} in ('failed', 'not_configured')`)),
  ]);
  return { registrations, applications, messages, email };
}

export type ActivityItem = { kind: "registration" | "application" | "message"; id: string; who: string; what: string; at: number; fresh: boolean };

/** The latest things that arrived from the site (registrations, applications, contact messages), newest first. */
export async function getRecentActivity(d: Db = defaultDb, limit = 6): Promise<ActivityItem[]> {
  const r = schema.registrations, a = schema.applications, m = schema.contactMessages;
  const [regs, apps, msgs] = await Promise.all([
    d.select({ id: r.id, who: r.name, what: schema.events.title, at: r.createdAt, status: r.status }).from(r).innerJoin(schema.events, eq(schema.events.id, r.eventId)).orderBy(desc(r.createdAt)).limit(limit),
    d.select({ id: a.id, first: a.firstName, last: a.lastName, what: schema.jobOpenings.title, at: a.createdAt, status: a.status }).from(a).leftJoin(schema.jobOpenings, eq(schema.jobOpenings.id, a.openingId)).orderBy(desc(a.createdAt)).limit(limit),
    d.select({ id: m.id, who: m.name, what: m.subject, at: m.createdAt, status: m.status }).from(m).orderBy(desc(m.createdAt)).limit(limit),
  ]);
  return [
    ...regs.map((x) => ({ kind: "registration" as const, id: x.id, who: x.who, what: x.what, at: x.at, fresh: x.status === "pending" })),
    ...apps.map((x) => ({ kind: "application" as const, id: x.id, who: `${x.first} ${x.last}`.trim(), what: x.what ?? "Candidatura spontanea", at: x.at, fresh: x.status === "new" })),
    ...msgs.map((x) => ({ kind: "message" as const, id: x.id, who: x.who, what: x.what || "Messaggio senza oggetto", at: x.at, fresh: x.status === "new" })),
  ]
    .sort((x, y) => y.at - x.at)
    .slice(0, limit);
}

export type IntegrationState = { key: string; label: string; configured: boolean; detail: string };

/** Real configuration state, read from env/settings. Never pretends a connection is active. */
export async function getIntegrations(): Promise<IntegrationState[]> {
  const analytics = await getSetting("analytics");
  const smtp = smtpConfig();
  const shopify = Boolean(process.env.ABES_SHOPIFY_DOMAIN && process.env.ABES_SHOPIFY_STOREFRONT_TOKEN);
  return [
    {
      key: "smtp",
      label: "Invio email (SMTP)",
      configured: isEmailConfigured(),
      detail: smtp ? "Le email vengono inviate dal sito." : "Da configurare: finché manca, le email restano nel registro e non partono.",
    },
    {
      key: "shopify",
      label: "Catalogo ABES (Shopify)",
      configured: shopify,
      detail: shopify ? "Collegamento al catalogo attivo." : "Da configurare: i prodotti si gestiscono a mano nella sezione Prodotti ABES.",
    },
    {
      key: "ga",
      label: "Google Analytics",
      configured: Boolean(analytics.gaMeasurementId),
      detail: analytics.gaMeasurementId ? "Misurazione attiva (dopo il consenso ai cookie)." : "Da configurare: inserisci l'ID di misurazione in Impostazioni.",
    },
    {
      key: "gsc",
      label: "Google Search Console",
      configured: Boolean(analytics.searchConsoleVerification),
      detail: analytics.searchConsoleVerification ? "Verifica del sito inserita." : "Da configurare: inserisci il codice di verifica in Impostazioni.",
    },
  ];
}
