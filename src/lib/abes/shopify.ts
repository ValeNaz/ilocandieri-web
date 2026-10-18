/**
 * Shopify Storefront API provider (official GraphQL API). Active ONLY when the store domain and a
 * Storefront access token are present in the environment. Server-side only: the token is never sent
 * to the browser. Sync is explicit (admin button / scheduled job), never per-request scraping.
 *
 * Failure policy: any error leaves the cached rows untouched (last valid copy) and marks them
 * `syncStatus = 'error'`, so prices/availability stop being shown but the Home keeps working.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db, newId, schema } from "@/lib/db";
import { formatMoney, guessCategory } from "./format";
import { ABES_PRODUCT_PREFIX, normalizeAbesProductUrl, normalizeProductImageUrl } from "./url";

export type ShopifyConfig = { domain: string; token: string; apiVersion: string; collectionHandle: string | null };

export function getShopifyConfig(env: Record<string, string | undefined> = process.env): ShopifyConfig | null {
  const domain = (env.SHOPIFY_STORE_DOMAIN || env.ABES_SHOPIFY_DOMAIN || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const token = (env.SHOPIFY_STOREFRONT_TOKEN || env.ABES_SHOPIFY_STOREFRONT_TOKEN || "").trim();
  if (!domain || !token) return null;
  if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(domain)) return null;
  return {
    domain,
    token,
    apiVersion: (env.SHOPIFY_API_VERSION || "2025-07").trim(),
    collectionHandle: (env.SHOPIFY_COLLECTION_HANDLE || "").trim() || null,
  };
}

// ---------- GraphQL ----------
const PRODUCT_FIELDS = `
  id handle title productType onlineStoreUrl availableForSale
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  variants(first: 50) { nodes { availableForSale price { amount currencyCode } } }
`;

export const PRODUCTS_QUERY = `query AbesProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } }
}`;
export const COLLECTION_QUERY = `query AbesCollection($handle: String!, $first: Int!, $after: String) {
  collection(handle: $handle) { products(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } } }
}`;

type Money = { amount: string; currencyCode: string };
export type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  productType?: string | null;
  onlineStoreUrl?: string | null;
  availableForSale?: boolean;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: { minVariantPrice: Money; maxVariantPrice: Money } | null;
  variants?: { nodes: { availableForSale: boolean; price: Money }[] } | null;
};

export type MappedProduct = {
  externalId: string;
  handle: string;
  title: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  category: string | null;
  priceText: string | null;
  available: boolean | null;
};

/** "Da 3,50 €" when variants have different prices, "3,50 €" otherwise. */
export function priceLabel(node: ShopifyProductNode): string | null {
  const variantPrices = (node.variants?.nodes ?? []).map((v) => Number(v.price.amount)).filter(Number.isFinite);
  const cur = node.priceRange?.minVariantPrice.currencyCode ?? node.variants?.nodes[0]?.price.currencyCode ?? "EUR";
  let min: number;
  let max: number;
  if (node.priceRange) {
    min = Number(node.priceRange.minVariantPrice.amount);
    max = Number(node.priceRange.maxVariantPrice.amount);
  } else if (variantPrices.length) {
    min = Math.min(...variantPrices);
    max = Math.max(...variantPrices);
  } else return null;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const f = formatMoney(min, cur);
  return min === max ? f : `Da ${f}`;
}

/** Returns null for items that cannot be shown safely (no usable handle/URL). The URL is ALWAYS the abes.bio canonical one. */
export function mapShopifyProduct(node: ShopifyProductNode): MappedProduct | null {
  if (!node.handle || !node.title) return null;
  let url = `${ABES_PRODUCT_PREFIX}${node.handle}`;
  if (node.onlineStoreUrl) {
    const n = normalizeAbesProductUrl(node.onlineStoreUrl);
    if (n.ok) url = n.url;
  }
  const check = normalizeAbesProductUrl(url);
  if (!check.ok) return null;
  const img = node.featuredImage?.url ? normalizeProductImageUrl(node.featuredImage.url) : null;
  const anyVariantAvailable = node.variants?.nodes.some((v) => v.availableForSale);
  return {
    externalId: node.id,
    handle: check.handle,
    title: node.title.trim(),
    url: check.url,
    imageUrl: img && img.ok ? img.url : "",
    imageAlt: node.featuredImage?.altText?.trim() || node.title.trim(),
    category: node.productType?.trim() || guessCategory(node.title),
    priceText: priceLabel(node),
    available: typeof node.availableForSale === "boolean" ? node.availableForSale : anyVariantAvailable ?? null,
  };
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Fetch every product (paginated, max 5 pages of 50) from the configured collection or the whole store. */
export async function fetchShopifyProducts(config: ShopifyConfig, fetchImpl: FetchLike = fetch): Promise<ShopifyProductNode[]> {
  const endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
  const out: ShopifyProductNode[] = [];
  let after: string | null = null;
  for (let page = 0; page < 5; page++) {
    const body = config.collectionHandle
      ? { query: COLLECTION_QUERY, variables: { handle: config.collectionHandle, first: 50, after } }
      : { query: PRODUCTS_QUERY, variables: { first: 50, after } };
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": config.token },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Shopify ha risposto ${res.status}.`);
    const json = (await res.json()) as {
      data?: Record<string, unknown> | null;
      errors?: { message: string }[];
    };
    if (json.errors?.length) throw new Error(`Shopify: ${json.errors[0]!.message}`);
    const conn = (config.collectionHandle
      ? (json.data as { collection?: { products: Conn } | null } | null | undefined)?.collection?.products
      : (json.data as { products?: Conn } | null | undefined)?.products) as Conn | undefined;
    if (!conn) throw new Error(config.collectionHandle ? "Collezione non trovata." : "Risposta Shopify non valida.");
    out.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}
type Conn = { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProductNode[] };

export type SyncResult = { ok: true; created: number; updated: number; removed: number } | { ok: false; error: string };

/**
 * Sync the local cache. Editorial flags (visible, featuredHome, position) of existing rows are preserved;
 * products that disappeared from the source are hidden with syncStatus 'removed' (and restored if they return).
 */
export async function syncShopify(opts: { config?: ShopifyConfig | null; fetchImpl?: FetchLike; now?: number } = {}): Promise<SyncResult> {
  const config = opts.config === undefined ? getShopifyConfig() : opts.config;
  if (!config) return { ok: false, error: "Shopify non è configurato." };
  const now = opts.now ?? Date.now();

  let mapped: MappedProduct[];
  try {
    const nodes = await fetchShopifyProducts(config, opts.fetchImpl);
    mapped = nodes.map(mapShopifyProduct).filter((p): p is MappedProduct => !!p);
    if (nodes.length > 0 && mapped.length === 0) throw new Error("Nessun prodotto valido nella risposta.");
  } catch (e) {
    // Keep the last valid copy; just flag it so stale prices/availability are not displayed.
    await db.update(schema.products).set({ syncStatus: "error", updatedAt: now }).where(eq(schema.products.source, "shopify"));
    const msg = e instanceof Error ? e.message : "Errore sconosciuto.";
    return { ok: false, error: msg.replace(config.token, "***") };
  }

  let created = 0, updated = 0, removed = 0;
  await db.transaction(async (tx) => {
    const existing = await tx.select().from(schema.products);
    const byUrl = new Map(existing.map((r) => [r.url, r]));
    let nextPos = existing.reduce((m, r) => Math.max(m, r.position), -1) + 1;
    const seen = new Set<string>();
    for (const p of mapped) {
      seen.add(p.url);
      const row = byUrl.get(p.url);
      if (row) {
        await tx.update(schema.products).set({
          source: "shopify", externalId: p.externalId, handle: p.handle, title: p.title,
          imageUrl: p.imageUrl || row.imageUrl, imageAlt: row.imageAlt || p.imageAlt,
          category: row.category || p.category, priceText: p.priceText, priceCheckedAt: now, available: p.available,
          visible: row.syncStatus === "removed" ? true : row.visible,
          syncStatus: "ok", lastSyncedAt: now, updatedAt: now,
        }).where(eq(schema.products.id, row.id));
        updated++;
      } else {
        await tx.insert(schema.products).values({
          id: newId(), source: "shopify", externalId: p.externalId, handle: p.handle, title: p.title, url: p.url,
          imageUrl: p.imageUrl, imageAlt: p.imageAlt, category: p.category, priceText: p.priceText, priceCheckedAt: now,
          available: p.available, visible: !!p.imageUrl, featuredHome: false, position: nextPos++, syncStatus: "ok", lastSyncedAt: now, createdAt: now, updatedAt: now,
        });
        created++;
      }
    }
    const gone = existing.filter((r) => r.source === "shopify" && !seen.has(r.url)).map((r) => r.id);
    if (gone.length) {
      await tx.update(schema.products).set({ visible: false, syncStatus: "removed", updatedAt: now }).where(and(inArray(schema.products.id, gone)));
      removed = gone.length;
    }
  }, { behavior: "immediate" });
  return { ok: true, created, updated, removed };
}
