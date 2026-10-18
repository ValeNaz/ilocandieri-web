// INTERFACE CONTRACT (owner: ABES+NEWS agent): getHomeNews + NewsCardData signatures stay stable.
import { and, desc, eq, lte, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mediaUrl } from "@/lib/storage";
import { cleanNewsBody, excerptFrom } from "./body";

export type NewsCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: number;
  coverUrl: string | null;
  coverAlt: string;
  categoryName: string | null;
};

export type NewsImage = { id: string; url: string; alt: string; credit: string | null };
export type NewsArticleData = NewsCardData & {
  body: string;
  categorySlug: string | null;
  featured: boolean;
  gallery: NewsImage[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  updatedAt: number;
  status: "draft" | "published";
};

/** The ONLY visibility rule for the public site: published AND publication date reached. Drafts never pass. */
export const publicNewsWhere = (now = Date.now()): SQL =>
  and(eq(schema.news.status, "published"), lte(schema.news.publishedAt, now))!;

type NewsRow = typeof schema.news.$inferSelect;

async function mediaById(id: string | null) {
  if (!id) return null;
  const [m] = await db.select().from(schema.media).where(eq(schema.media.id, id));
  return m ?? null;
}

async function galleryOf(newsId: string): Promise<NewsImage[]> {
  const rows = await db
    .select({ m: schema.media, pos: schema.newsImages.position })
    .from(schema.newsImages)
    .innerJoin(schema.media, eq(schema.media.id, schema.newsImages.mediaId))
    .where(eq(schema.newsImages.newsId, newsId))
    .orderBy(schema.newsImages.position);
  return rows.map(({ m }) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt, credit: m.credit }));
}

/** Row -> full article. Works for drafts too (used by the admin preview, which checks auth itself). */
export async function toArticle(row: NewsRow): Promise<NewsArticleData> {
  const [cover, og, cat, gallery] = await Promise.all([
    mediaById(row.coverId),
    mediaById(row.ogImageId),
    row.categoryId ? db.select().from(schema.newsCategories).where(eq(schema.newsCategories.id, row.categoryId)).then((r) => r[0] ?? null) : null,
    galleryOf(row.id),
  ]);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || excerptFrom(row.body) || null,
    publishedAt: row.publishedAt ?? row.createdAt,
    coverUrl: cover ? mediaUrl(cover.path) : null,
    coverAlt: cover?.alt ?? "",
    categoryName: cat?.name ?? null,
    categorySlug: cat?.slug ?? null,
    body: cleanNewsBody(row.body),
    featured: row.featured,
    gallery,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogImageUrl: og ? mediaUrl(og.path) : null,
    updatedAt: row.updatedAt,
    status: row.status,
  };
}

async function toCards(rows: { n: NewsRow; cover: typeof schema.media.$inferSelect | null; cat: typeof schema.newsCategories.$inferSelect | null }[]): Promise<NewsCardData[]> {
  return rows.map(({ n, cover, cat }) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt || excerptFrom(n.body) || null,
    publishedAt: n.publishedAt ?? n.createdAt,
    coverUrl: cover ? mediaUrl(cover.path) : null,
    coverAlt: cover?.alt ?? "",
    categoryName: cat?.name ?? null,
  }));
}

function cardsQuery() {
  return db
    .select({ n: schema.news, cover: schema.media, cat: schema.newsCategories })
    .from(schema.news)
    .leftJoin(schema.media, eq(schema.media.id, schema.news.coverId))
    .leftJoin(schema.newsCategories, eq(schema.newsCategories.id, schema.news.categoryId));
}

/** Published news for Home: featured first, then most recent. */
export async function getHomeNews(limit: number): Promise<NewsCardData[]> {
  const n = Math.max(0, Math.min(Math.floor(limit) || 0, 12));
  if (n === 0) return [];
  try {
    const rows = await cardsQuery().where(publicNewsWhere()).orderBy(desc(schema.news.featured), desc(schema.news.publishedAt)).limit(n);
    return toCards(rows);
  } catch (e) {
    console.error("[news] home read failed", e instanceof Error ? e.message : e);
    return [];
  }
}

export const NEWS_PER_PAGE = 9;

export type NewsListResult = { items: NewsCardData[]; total: number; page: number; pages: number };

export async function listPublishedNews(opts: { page?: number; categorySlug?: string | null; perPage?: number } = {}): Promise<NewsListResult> {
  const perPage = opts.perPage ?? NEWS_PER_PAGE;
  let where: SQL = publicNewsWhere();
  if (opts.categorySlug) where = and(where, eq(schema.newsCategories.slug, opts.categorySlug))!;
  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.news)
    .leftJoin(schema.newsCategories, eq(schema.newsCategories.id, schema.news.categoryId))
    .where(where);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Math.floor(opts.page ?? 1) || 1), pages);
  const rows = await cardsQuery().where(where).orderBy(desc(schema.news.publishedAt), desc(schema.news.createdAt)).limit(perPage).offset((page - 1) * perPage);
  return { items: await toCards(rows), total, page, pages };
}

/** Most recent featured, published article (lead story of /news). */
export async function getFeaturedLead(): Promise<NewsCardData | null> {
  const rows = await cardsQuery().where(and(publicNewsWhere(), eq(schema.news.featured, true))!).orderBy(desc(schema.news.publishedAt)).limit(1);
  return (await toCards(rows))[0] ?? null;
}

/** Categories that have at least one public article (for the filter). */
export async function listPublicCategories(): Promise<{ name: string; slug: string; count: number }[]> {
  const rows = await db
    .select({ name: schema.newsCategories.name, slug: schema.newsCategories.slug, count: sql<number>`count(*)` })
    .from(schema.news)
    .innerJoin(schema.newsCategories, eq(schema.newsCategories.id, schema.news.categoryId))
    .where(publicNewsWhere())
    .groupBy(schema.newsCategories.id)
    .orderBy(schema.newsCategories.name);
  return rows;
}

/** A public article by slug. Drafts / future-dated / unknown -> null (callers answer 404). */
export async function getPublishedBySlug(slug: string): Promise<NewsArticleData | null> {
  const [row] = await db.select().from(schema.news).where(and(eq(schema.news.slug, slug), publicNewsWhere())!).limit(1);
  return row ? toArticle(row) : null;
}

/** Same category first, then most recent. Never includes the article itself or non-public items. */
export async function getRelatedNews(article: { id: string; categorySlug: string | null }, limit = 3): Promise<NewsCardData[]> {
  const base = and(publicNewsWhere(), sql`${schema.news.id} <> ${article.id}`)!;
  const out: NewsCardData[] = [];
  if (article.categorySlug) {
    const same = await cardsQuery().where(and(base, eq(schema.newsCategories.slug, article.categorySlug))!).orderBy(desc(schema.news.publishedAt)).limit(limit);
    out.push(...(await toCards(same)));
  }
  if (out.length < limit) {
    const have = new Set(out.map((o) => o.id));
    const more = await cardsQuery().where(base).orderBy(desc(schema.news.publishedAt)).limit(limit + have.size);
    for (const c of await toCards(more)) if (!have.has(c.id) && out.length < limit) out.push(c);
  }
  return out;
}

/** For sitemap.ts (CONTENT): only public articles. */
export async function listPublishedForSitemap(): Promise<{ slug: string; updatedAt: number }[]> {
  const rows = await db.select({ slug: schema.news.slug, updatedAt: schema.news.updatedAt }).from(schema.news).where(publicNewsWhere());
  return rows;
}
