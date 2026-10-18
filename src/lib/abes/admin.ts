/** Admin-side data access for the ABES showcase. Callers MUST have run requireAdmin(). */
import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ABES_PRODUCT_PREFIX, normalizeAbesProductUrl } from "./url";
import { guessCategory } from "./format";

export type ProductRow = typeof schema.products.$inferSelect;

export async function listProducts(): Promise<ProductRow[]> {
  return db.select().from(schema.products).orderBy(asc(schema.products.position), asc(schema.products.createdAt));
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const [row] = await db.select().from(schema.products).where(eq(schema.products.id, id));
  return row ?? null;
}

export async function findProductByUrl(url: string): Promise<ProductRow | null> {
  const [row] = await db.select().from(schema.products).where(eq(schema.products.url, url));
  return row ?? null;
}

export async function nextPosition(): Promise<number> {
  const [r] = await db.select({ m: sql<number>`coalesce(max(${schema.products.position}), -1)` }).from(schema.products);
  return (r?.m ?? -1) + 1;
}

/** Swap with the neighbour and renumber positions 0..n-1 (stable, gap-free). */
export async function moveProduct(id: string, dir: "up" | "down"): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: schema.products.id }).from(schema.products).orderBy(asc(schema.products.position), asc(schema.products.createdAt));
    const i = rows.findIndex((r) => r.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return false;
    [rows[i], rows[j]] = [rows[j]!, rows[i]!];
    for (let k = 0; k < rows.length; k++) await tx.update(schema.products).set({ position: k }).where(eq(schema.products.id, rows[k]!.id));
    return true;
  }, { behavior: "immediate" });
}

export async function setFlag(id: string, flag: "visible" | "featuredHome", value: boolean) {
  await db.update(schema.products).set({ [flag]: value, updatedAt: Date.now() }).where(eq(schema.products.id, id));
}

export async function deleteProduct(id: string) {
  await db.delete(schema.products).where(eq(schema.products.id, id));
}

// ---------- one-off import from a public ABES product URL ----------
export type ImportedProduct = { handle: string; url: string; title: string; imageUrl: string; imageAlt: string; category: string | null };

/**
 * One-off, admin-triggered prefill: reads the public `<product>.js` document of a single product so the editor
 * does not retype name and photo. Only the fixed host abes.bio is contacted; nothing is stored until the admin confirms.
 */
export async function importFromAbesUrl(input: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; product: ImportedProduct } | { ok: false; error: string }> {
  const n = normalizeAbesProductUrl(input);
  if (!n.ok) return n;
  let res: Response;
  try {
    res = await fetchImpl(`${ABES_PRODUCT_PREFIX}${n.handle}.js`, { signal: AbortSignal.timeout(8000), cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    return { ok: false, error: "Non riesco a raggiungere abes.bio in questo momento. Puoi compilare i campi a mano." };
  }
  if (res.status === 404) return { ok: false, error: "Questo prodotto non esiste su abes.bio. Controlla il link." };
  if (!res.ok) return { ok: false, error: "abes.bio non ha risposto correttamente. Riprova o compila a mano." };
  let data: { title?: string; handle?: string; featured_image?: string | null; images?: string[] };
  try {
    const text = await res.text();
    if (text.length > 1_000_000) throw new Error("too large");
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "La risposta di abes.bio non è leggibile. Compila a mano." };
  }
  if (!data.title || data.handle !== n.handle) return { ok: false, error: "La pagina non corrisponde al prodotto indicato." };
  let image = data.featured_image || data.images?.[0] || "";
  if (image.startsWith("//")) image = `https:${image}`;
  return { ok: true, product: { handle: n.handle, url: n.url, title: data.title.trim(), imageUrl: image, imageAlt: data.title.trim(), category: guessCategory(data.title) } };
}


/** Number of products the Home showcase block is configured to show (owned by the Home block editor), or null. */
export async function getHomeShowcaseLimit(): Promise<number | null> {
  const rows = await db
    .select({ data: schema.pageBlocks.data, visible: schema.pageBlocks.visible })
    .from(schema.pageBlocks)
    .innerJoin(schema.pages, eq(schema.pages.id, schema.pageBlocks.pageId))
    .where(and(eq(schema.pages.key, "home"), eq(schema.pageBlocks.type, "abes_showcase")));
  const n = Number((rows[0]?.data as { limit?: unknown } | undefined)?.limit);
  return Number.isFinite(n) && n > 0 ? n : null;
}
