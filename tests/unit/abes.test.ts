import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { importFromAbesUrl, moveProduct, listProducts } from "@/lib/abes/admin";
import { displayTitle, formatMoney } from "@/lib/abes/format";
import { getProviderStatus } from "@/lib/abes/provider";
import { getHomeProducts, getShopProducts, toShowcaseProduct } from "@/lib/abes/public";
import { productInputSchema } from "@/lib/abes/schema";
import { getShopifyConfig, mapShopifyProduct, priceLabel, syncShopify, type ShopifyConfig, type ShopifyProductNode } from "@/lib/abes/shopify";
import { normalizeAbesProductUrl, normalizeProductImageUrl } from "@/lib/abes/url";
import { db, newId, schema } from "@/lib/db";

const CFG: ShopifyConfig = { domain: "abes-test.myshopify.com", token: "tok_secret_123", apiVersion: "2025-07", collectionHandle: null };

const node = (over: Partial<ShopifyProductNode> & { handle: string }): ShopifyProductNode => ({
  id: `gid://shopify/Product/${over.handle}`,
  title: over.handle.toUpperCase(),
  availableForSale: true,
  featuredImage: { url: `https://cdn.shopify.com/s/files/1/x/files/${over.handle}.jpg?v=1`, altText: null },
  priceRange: { minVariantPrice: { amount: "3.5", currencyCode: "EUR" }, maxVariantPrice: { amount: "3.5", currencyCode: "EUR" } },
  variants: { nodes: [{ availableForSale: true, price: { amount: "3.5", currencyCode: "EUR" } }] },
  ...over,
});

const okResponse = (nodes: ShopifyProductNode[]) =>
  new Response(JSON.stringify({ data: { products: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } } }), { status: 200 });

beforeEach(async () => {
  await db.delete(schema.products);
});

describe("ABES url validation", () => {
  it("accepts product pages and canonicalises them", () => {
    for (const u of ["https://abes.bio/products/caponata-melanzane", "https://www.abes.bio/products/caponata-melanzane/?variant=1#x", "https://abes.bio/collections/all/products/caponata-melanzane"]) {
      const r = normalizeAbesProductUrl(u);
      expect(r).toEqual({ ok: true, url: "https://abes.bio/products/caponata-melanzane", handle: "caponata-melanzane" });
    }
  });
  it("rejects home, catalogue, other hosts, http and look-alikes", () => {
    for (const u of ["", "https://abes.bio/", "https://abes.bio/collections/all", "http://abes.bio/products/x", "https://evil.example/products/x", "https://abes.bio.evil.example/products/x", "https://abes.bio@evil.example/products/x", "javascript:alert(1)", "https://abes.bio/products/"]) {
      expect(normalizeAbesProductUrl(u).ok, u).toBe(false);
    }
  });
  it("restricts images to the Shopify CDN or our own media", () => {
    expect(normalizeProductImageUrl("//cdn.shopify.com/s/files/a.jpg?v=1").ok).toBe(true);
    expect(normalizeProductImageUrl("/media/2026/10/abc.jpg").ok).toBe(true);
    expect(normalizeProductImageUrl("https://evil.example/a.jpg").ok).toBe(false);
    expect(normalizeProductImageUrl("http://cdn.shopify.com/a.jpg").ok).toBe(false);
    expect(normalizeProductImageUrl("/media/../../etc/passwd").ok).toBe(false);
  });
  it("form schema rejects non-product URLs and canonicalises valid ones", () => {
    const base = { title: "Caponata", visible: "on" };
    expect(productInputSchema.safeParse({ ...base, url: "https://abes.bio/collections/all" }).success).toBe(false);
    const ok = productInputSchema.safeParse({ ...base, url: "https://www.abes.bio/products/caponata-melanzane?x=1" });
    expect(ok.success && ok.data.url).toBe("https://abes.bio/products/caponata-melanzane");
  });
});

describe("display helpers", () => {
  it("normalises UPPERCASE titles for display only", () => {
    expect(displayTitle("CAPONATA SICILIANA")).toBe("Caponata Siciliana");
    expect(displayTitle("SUGO DI POMODORO AL BASILICO BIOLOGICO - 440 GR")).toBe("Sugo di Pomodoro al Basilico Biologico - 440 gr");
    expect(displayTitle("PASTA BUSIATE VARIETA' TUMMINIA - 500 GR")).toBe("Pasta Busiate Varietà Tumminia - 500 gr");
    expect(displayTitle("Semolato di Tumminia 1 KG")).toBe("Semolato di Tumminia 1 kg");
    expect(displayTitle("PASSATA DI POMODORO BIO - 680 gr")).toBe("Passata di Pomodoro BIO - 680 gr");
    expect(displayTitle("Ceste delle Feste ABES")).toBe("Ceste delle Feste ABES");
  });
  it("formats euro", () => expect(formatMoney("3.5").replace(/\s/g, " ")).toBe("3,50 €"));
});

describe("shopify provider", () => {
  it("is active only when domain AND token are present", () => {
    expect(getShopifyConfig({})).toBeNull();
    expect(getShopifyConfig({ SHOPIFY_STORE_DOMAIN: "abes.bio" })).toBeNull();
    expect(getShopifyConfig({ SHOPIFY_STOREFRONT_TOKEN: "t" })).toBeNull();
    expect(getShopifyConfig({ SHOPIFY_STORE_DOMAIN: "https://abes.bio/", SHOPIFY_STOREFRONT_TOKEN: "t" })?.domain).toBe("abes.bio");
    expect(getShopifyConfig({ SHOPIFY_STORE_DOMAIN: "evil.com/x?y", SHOPIFY_STOREFRONT_TOKEN: "t" })).toBeNull();
    expect(getProviderStatus({}).kind).toBe("manual");
    expect(getProviderStatus({ SHOPIFY_STORE_DOMAIN: "abes.bio", SHOPIFY_STOREFRONT_TOKEN: "t" }).kind).toBe("shopify");
  });

  it("shows 'Da ...' for variants with different prices and a single price otherwise", () => {
    const multi = node({ handle: "caponata-melanzane", priceRange: { minVariantPrice: { amount: "4.0", currencyCode: "EUR" }, maxVariantPrice: { amount: "8.0", currencyCode: "EUR" } } });
    expect(priceLabel(multi)?.replace(/\s/g, " ")).toBe("Da 4,00 €");
    expect(priceLabel(node({ handle: "x" }))?.replace(/\s/g, " ")).toBe("3,50 €");
  });

  it("always builds the canonical abes.bio URL from the handle, ignoring foreign onlineStoreUrl", () => {
    const m = mapShopifyProduct(node({ handle: "ceci-400-gr", onlineStoreUrl: "https://abes-test.myshopify.com/products/other" }));
    expect(m?.url).toBe("https://abes.bio/products/ceci-400-gr");
    expect(mapShopifyProduct(node({ handle: "ceci-400-gr", onlineStoreUrl: "https://abes.bio/products/ceci-400-gr" }))?.url).toBe("https://abes.bio/products/ceci-400-gr");
  });

  it("sync creates, updates, flags sold-out items and hides removed products", async () => {
    const f1 = vi.fn(async () => okResponse([node({ handle: "a" }), node({ handle: "b", availableForSale: false })]));
    const r1 = await syncShopify({ config: CFG, fetchImpl: f1 as unknown as typeof fetch, now: 1000 });
    expect(r1).toEqual({ ok: true, created: 2, updated: 0, removed: 0 });
    // token travels only in the header, never in the URL/body
    const call = f1.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe("https://abes-test.myshopify.com/api/2025-07/graphql.json");
    expect((call[1].headers as Record<string, string>)["X-Shopify-Storefront-Access-Token"]).toBe("tok_secret_123");
    expect(String(call[1].body)).not.toContain("tok_secret_123");

    const rows = await listProducts();
    expect(rows.find((r) => r.handle === "b")?.available).toBe(false);
    // editorial flags survive a re-sync
    const a = rows.find((r) => r.handle === "a")!;
    await db.update(schema.products).set({ featuredHome: true, position: 7 }).where(eq(schema.products.id, a.id));

    const r2 = await syncShopify({ config: CFG, fetchImpl: (async () => okResponse([node({ handle: "a", title: "A nuovo" })])) as unknown as typeof fetch, now: 2000 });
    expect(r2).toEqual({ ok: true, created: 0, updated: 1, removed: 1 });
    const after = await listProducts();
    const a2 = after.find((r) => r.handle === "a")!;
    expect(a2.title).toBe("A nuovo");
    expect(a2.featuredHome).toBe(true);
    expect(a2.position).toBe(7);
    const b2 = after.find((r) => r.handle === "b")!;
    expect(b2.visible).toBe(false);
    expect(b2.syncStatus).toBe("removed");

    // product comes back -> visible again
    await syncShopify({ config: CFG, fetchImpl: (async () => okResponse([node({ handle: "a" }), node({ handle: "b" })])) as unknown as typeof fetch, now: 3000 });
    const back = (await listProducts()).find((r) => r.handle === "b")!;
    expect(back.visible).toBe(true);
    expect(back.syncStatus).toBe("ok");
  });

  it("on error keeps the last valid copy, marks it as error and never exposes stale price/availability", async () => {
    const now = Date.now();
    await syncShopify({ config: CFG, fetchImpl: (async () => okResponse([node({ handle: "a" })])) as unknown as typeof fetch, now });
    const before = (await listProducts())[0]!;

    for (const failing of [
      async () => new Response("boom", { status: 500 }),
      async () => { throw new Error(`network down ${CFG.token}`); },
      async () => new Response(JSON.stringify({ errors: [{ message: "Throttled" }] }), { status: 200 }),
    ]) {
      const r = await syncShopify({ config: CFG, fetchImpl: failing as unknown as typeof fetch, now: now + 10 });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).not.toContain(CFG.token);
      const row = (await listProducts())[0]!;
      expect(row.title).toBe(before.title);
      expect(row.imageUrl).toBe(before.imageUrl);
      expect(row.visible).toBe(true);
      expect(row.syncStatus).toBe("error");
      expect(toShowcaseProduct(row, now + 20).priceText).toBeNull();
      expect(toShowcaseProduct(row, now + 20).available).toBeNull();
    }
    // the Home still gets the product
    await db.update(schema.products).set({ featuredHome: true });
    expect((await getHomeProducts(4)).map((p) => p.url)).toEqual(["https://abes.bio/products/a"]);
  });

  it("returns a clear error when not configured", async () => {
    expect(await syncShopify({ config: null })).toEqual({ ok: false, error: "Shopify non è configurato." });
  });
});

describe("public mapping and queries", () => {
  const base = { id: "p", source: "manual" as const, externalId: null, handle: "x", title: "CAPONATA SICILIANA", url: "https://abes.bio/products/x", imageUrl: "https://cdn.shopify.com/a.jpg", imageAlt: "", category: "Conserve", priceText: "4,00 €", priceCheckedAt: null as number | null, available: true as boolean | null, visible: true, featuredHome: true, position: 0, syncStatus: null as string | null, lastSyncedAt: null as number | null, createdAt: 0, updatedAt: 0 };
  const now = 1_800_000_000_000;

  it("manual data: no availability ever, price only with a recent verification date", () => {
    expect(toShowcaseProduct(base, now)).toMatchObject({ title: "Caponata Siciliana", priceText: null, available: null });
    expect(toShowcaseProduct({ ...base, priceCheckedAt: now - 5 * 86400_000 }, now).priceText).toBe("4,00 €");
    expect(toShowcaseProduct({ ...base, priceCheckedAt: now - 60 * 86400_000 }, now).priceText).toBeNull();
    expect(toShowcaseProduct({ ...base, priceCheckedAt: now - 5 * 86400_000 }, now).available).toBeNull();
  });
  it("synced data: price/availability only when fresh and ok", () => {
    const s = { ...base, source: "shopify" as const, syncStatus: "ok", lastSyncedAt: now - 3600_000 };
    expect(toShowcaseProduct(s, now)).toMatchObject({ priceText: "4,00 €", available: true });
    expect(toShowcaseProduct({ ...s, lastSyncedAt: now - 30 * 86400_000 }, now)).toMatchObject({ priceText: null, available: null });
  });

  it("Home/Shop only return visible products in position order; hidden ones disappear", async () => {
    const mk = (handle: string, position: number, o: Partial<typeof base> = {}) => db.insert(schema.products).values({ ...base, id: newId(), handle, url: `https://abes.bio/products/${handle}`, position, createdAt: position, updatedAt: position, ...o });
    await mk("c", 2); await mk("a", 0); await mk("b", 1, { visible: false }); await mk("d", 3, { featuredHome: false });
    expect((await getHomeProducts(10)).map((p) => p.url.split("/").pop())).toEqual(["a", "c"]);
    expect((await getHomeProducts(1)).length).toBe(1);
    expect((await getShopProducts()).map((p) => p.url.split("/").pop())).toEqual(["a", "c", "d"]);
  });

  it("moveProduct swaps neighbours and keeps positions gap-free", async () => {
    for (const [i, h] of ["a", "b", "c"].entries()) await db.insert(schema.products).values({ ...base, id: newId(), handle: h, url: `https://abes.bio/products/${h}`, position: i * 5 });
    const rows = await listProducts();
    await moveProduct(rows[2]!.id, "up");
    expect((await listProducts()).map((r) => [r.handle, r.position])).toEqual([["a", 0], ["c", 1], ["b", 2]]);
    expect(await moveProduct(rows[0]!.id, "up")).toBe(false);
  });
});

describe("one-off import from abes.bio", () => {
  const js = (o: object, status = 200) => (async () => new Response(JSON.stringify(o), { status })) as unknown as typeof fetch;
  it("prefills title and image and only contacts abes.bio/products/<handle>.js", async () => {
    const spy = vi.fn(js({ title: "CECI 400 GR", handle: "ceci-400-gr", featured_image: "//cdn.shopify.com/s/files/a.png?v=2" }));
    const r = await importFromAbesUrl("https://abes.bio/products/ceci-400-gr?utm=1", spy);
    expect(spy.mock.calls[0]![0]).toBe("https://abes.bio/products/ceci-400-gr.js");
    expect(r).toMatchObject({ ok: true, product: { title: "CECI 400 GR", imageUrl: "https://cdn.shopify.com/s/files/a.png?v=2", url: "https://abes.bio/products/ceci-400-gr", category: "Legumi" } });
  });
  it("refuses other hosts without any request, handles 404 and mismatching documents", async () => {
    const spy = vi.fn();
    expect((await importFromAbesUrl("https://evil.example/products/x", spy as unknown as typeof fetch)).ok).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    expect((await importFromAbesUrl("https://abes.bio/products/nope", js({}, 404))).ok).toBe(false);
    expect((await importFromAbesUrl("https://abes.bio/products/x", js({ title: "Altro", handle: "y" }))).ok).toBe(false);
  });
});
