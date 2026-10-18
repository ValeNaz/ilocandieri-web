// INTERFACE CONTRACT (owner: ABES+NEWS agent). Signature must stay stable.
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { displayTitle } from "./format";

export type ShowcaseProduct = {
  id: string;
  title: string;
  url: string; // https://abes.bio/products/...
  imageUrl: string | null;
  imageAlt: string;
  category: string | null;
  priceText: string | null; // only when reliable
  available: boolean | null; // only when reliable
};

const DAY = 24 * 3600_000;
/** How long a price/availability stays "reliable". Synced data ages fast; manual prices must have a recent check date. */
export const SYNC_FRESH_MS = 7 * DAY;
export const MANUAL_PRICE_FRESH_MS = 30 * DAY;

type Row = typeof schema.products.$inferSelect;

/** Pure: maps a DB row to the public shape, hiding commercial data that cannot be trusted. */
export function toShowcaseProduct(r: Row, now = Date.now()): ShowcaseProduct {
  const syncedOk = r.source === "shopify" && r.syncStatus === "ok" && !!r.lastSyncedAt && now - r.lastSyncedAt <= SYNC_FRESH_MS;
  const manualPriceOk = r.source === "manual" && !!r.priceText && !!r.priceCheckedAt && now - r.priceCheckedAt <= MANUAL_PRICE_FRESH_MS;
  return {
    id: r.id,
    title: displayTitle(r.title),
    url: r.url,
    imageUrl: r.imageUrl || null,
    // Decorative by default: the card text already names the product (avoids a duplicated announcement).
    imageAlt: r.imageAlt,
    category: r.category,
    priceText: (syncedOk || manualPriceOk) && r.priceText ? r.priceText : null,
    // Availability is only ever shown for verified synced data; manual catalogs never claim it.
    available: syncedOk ? r.available : null,
  };
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[abes] read failed", e instanceof Error ? e.message : e);
    return fallback; // a DB problem must never break the Home
  }
}

/** Products flagged for Home, visible, ordered by position. */
export async function getHomeProducts(limit: number): Promise<ShowcaseProduct[]> {
  const n = Math.max(0, Math.min(Math.floor(limit) || 0, 24));
  if (n === 0) return [];
  return safe(async () => {
    const rows = await db.select().from(schema.products)
      .where(and(eq(schema.products.visible, true), eq(schema.products.featuredHome, true)))
      .orderBy(asc(schema.products.position), asc(schema.products.createdAt)).limit(n);
    return rows.map((r) => toShowcaseProduct(r));
  }, []);
}

/** All visible products for the Shop page, ordered by position. */
export async function getShopProducts(): Promise<ShowcaseProduct[]> {
  return safe(async () => {
    const rows = await db.select().from(schema.products).where(eq(schema.products.visible, true))
      .orderBy(asc(schema.products.position), asc(schema.products.createdAt));
    return rows.map((r) => toShowcaseProduct(r));
  }, []);
}
