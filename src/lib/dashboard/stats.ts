import { and, asc, eq, gte, sql } from "drizzle-orm";
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
