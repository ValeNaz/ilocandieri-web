/** Admin-side data access for news. Callers MUST have run requireAdmin(). */
import { and, desc, eq, like, sql, type SQL } from "drizzle-orm";
import { db, newId, schema } from "@/lib/db";
import { slugify } from "@/lib/utils";

export type NewsListItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: number | null;
  updatedAt: number;
  categoryName: string | null;
};

export async function listNewsAdmin(f: { status?: string; categoryId?: string; q?: string } = {}): Promise<NewsListItem[]> {
  const conds: SQL[] = [];
  if (f.status === "draft" || f.status === "published") conds.push(eq(schema.news.status, f.status));
  if (f.categoryId) conds.push(eq(schema.news.categoryId, f.categoryId));
  if (f.q?.trim()) conds.push(like(schema.news.title, `%${f.q.trim().replace(/[%_]/g, "")}%`));
  const rows = await db
    .select({ n: schema.news, cat: schema.newsCategories.name })
    .from(schema.news)
    .leftJoin(schema.newsCategories, eq(schema.newsCategories.id, schema.news.categoryId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(schema.news.updatedAt));
  return rows.map(({ n, cat }) => ({ id: n.id, title: n.title, slug: n.slug, status: n.status, featured: n.featured, publishedAt: n.publishedAt, updatedAt: n.updatedAt, categoryName: cat }));
}

export async function getNewsRow(id: string) {
  const [row] = await db.select().from(schema.news).where(eq(schema.news.id, id));
  return row ?? null;
}

export async function getGalleryAdmin(newsId: string) {
  return db
    .select({ id: schema.media.id, path: schema.media.path, alt: schema.media.alt, position: schema.newsImages.position })
    .from(schema.newsImages)
    .innerJoin(schema.media, eq(schema.media.id, schema.newsImages.mediaId))
    .where(eq(schema.newsImages.newsId, newsId))
    .orderBy(schema.newsImages.position);
}

export async function getMedia(id: string | null) {
  if (!id) return null;
  const [m] = await db.select().from(schema.media).where(eq(schema.media.id, id));
  return m ?? null;
}

export async function recentMedia(limit = 30) {
  return db.select({ id: schema.media.id, path: schema.media.path, alt: schema.media.alt }).from(schema.media).orderBy(desc(schema.media.createdAt)).limit(limit);
}

// ---------- categories ----------
export async function listCategories() {
  return db
    .select({ id: schema.newsCategories.id, name: schema.newsCategories.name, slug: schema.newsCategories.slug, count: sql<number>`(select count(*) from news where news.category_id = ${schema.newsCategories.id})` })
    .from(schema.newsCategories)
    .orderBy(schema.newsCategories.name);
}

async function uniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "categoria";
  for (let i = 1; i < 200; i++) {
    const cand = i === 1 ? base : `${base}-${i}`;
    const [r] = await db.select({ id: schema.newsCategories.id }).from(schema.newsCategories).where(eq(schema.newsCategories.slug, cand));
    if (!r || r.id === excludeId) return cand;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createCategory(name: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const all = await db.select().from(schema.newsCategories);
  if (all.some((c) => c.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: "Esiste già una categoria con questo nome." };
  const id = newId();
  await db.insert(schema.newsCategories).values({ id, name, slug: await uniqueCategorySlug(name) });
  return { ok: true, id };
}

export async function renameCategory(id: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const all = await db.select().from(schema.newsCategories);
  if (all.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: "Esiste già una categoria con questo nome." };
  await db.update(schema.newsCategories).set({ name, slug: await uniqueCategorySlug(name, id) }).where(eq(schema.newsCategories.id, id));
  return { ok: true };
}

/** Articles of a deleted category simply become "senza categoria" (FK set null). */
export async function deleteCategory(id: string) {
  await db.delete(schema.newsCategories).where(eq(schema.newsCategories.id, id));
}
