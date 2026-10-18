import { beforeEach, describe, expect, it } from "vitest";
import { cleanNewsBody, excerptFrom } from "@/lib/news/body";
import { isPubliclyVisible, isScheduled, parseLocalDateTime, resolvePublishedAt, toLocalDateTime } from "@/lib/news/core";
import { db, newId, schema } from "@/lib/db";
import { createCategory, deleteCategory, listCategories, listNewsAdmin } from "@/lib/news/admin";
import { getHomeNews, getPublishedBySlug, getRelatedNews, listPublishedForSitemap, listPublishedNews, listPublicCategories } from "@/lib/news/public";
import { checkCustomSlug, uniqueSlug } from "@/lib/news/slug";

const mk = async (o: Partial<typeof schema.news.$inferInsert> & { slug: string }) => {
  const id = newId();
  await db.insert(schema.news).values({ id, title: o.slug, body: "<p>Testo</p>", status: "draft", ...o });
  return id;
};

beforeEach(async () => {
  await db.delete(schema.news);
  await db.delete(schema.newsCategories);
});

describe("slug", () => {
  it("is generated readable from the title and unique on collisions", async () => {
    expect(await uniqueSlug("Un'estate all'Orto: è già qui!")).toBe("un-estate-all-orto-e-gia-qui");
    await mk({ slug: "festa-del-raccolto" });
    expect(await uniqueSlug("Festa del raccolto")).toBe("festa-del-raccolto-2");
    await mk({ slug: "festa-del-raccolto-2" });
    expect(await uniqueSlug("Festa del raccolto")).toBe("festa-del-raccolto-3");
    expect(await uniqueSlug("!!!")).toBe("notizia");
  });
  it("a news does not collide with itself; custom slugs are validated", async () => {
    const id = await mk({ slug: "mia-news" });
    expect(await uniqueSlug("Mia news", id)).toBe("mia-news");
    expect(await checkCustomSlug("Mia News", id)).toEqual({ ok: true, slug: "mia-news" });
    expect((await checkCustomSlug("mia-news")).ok).toBe(false);
    expect((await checkCustomSlug("   ")).ok).toBe(false);
  });
});

describe("drafts are never public", () => {
  it("visibility rule", () => {
    const now = 1000;
    expect(isPubliclyVisible({ status: "draft", publishedAt: 10 }, now)).toBe(false);
    expect(isPubliclyVisible({ status: "draft", publishedAt: null }, now)).toBe(false);
    expect(isPubliclyVisible({ status: "published", publishedAt: 10 }, now)).toBe(true);
    expect(isPubliclyVisible({ status: "published", publishedAt: 5000 }, now)).toBe(false);
    expect(isScheduled({ status: "published", publishedAt: 5000 }, now)).toBe(true);
  });

  it("every public query excludes drafts and scheduled items", async () => {
    const now = Date.now();
    await mk({ slug: "bozza", status: "draft", publishedAt: now - 1000, featured: true });
    await mk({ slug: "futura", status: "published", publishedAt: now + 86400_000 });
    await mk({ slug: "pubblicata", status: "published", publishedAt: now - 1000 });
    expect(await getPublishedBySlug("bozza")).toBeNull();
    expect(await getPublishedBySlug("futura")).toBeNull();
    expect((await getPublishedBySlug("pubblicata"))?.title).toBe("pubblicata");
    expect((await listPublishedNews()).items.map((n) => n.slug)).toEqual(["pubblicata"]);
    expect((await getHomeNews(5)).map((n) => n.slug)).toEqual(["pubblicata"]);
    expect((await listPublishedForSitemap()).map((n) => n.slug)).toEqual(["pubblicata"]);
    expect((await getRelatedNews({ id: "x", categorySlug: null })).map((n) => n.slug)).toEqual(["pubblicata"]);
    expect((await listNewsAdmin()).length).toBe(3); // admin still sees everything
    expect((await listNewsAdmin({ status: "draft" })).map((n) => n.slug)).toEqual(["bozza"]);
  });

  it("Home: featured first, then most recent; empty -> []", async () => {
    expect(await getHomeNews(3)).toEqual([]);
    const now = Date.now();
    await mk({ slug: "vecchia-evidenza", status: "published", publishedAt: now - 9000, featured: true });
    await mk({ slug: "recente", status: "published", publishedAt: now - 10 });
    expect((await getHomeNews(3)).map((n) => n.slug)).toEqual(["vecchia-evidenza", "recente"]);
    expect(await getHomeNews(0)).toEqual([]);
  });

  it("pagination and category filter", async () => {
    const cat = await createCategory("Progetti");
    if (!cat.ok) throw new Error("cat");
    const now = Date.now();
    for (let i = 0; i < 11; i++) await mk({ slug: `n-${i}`, status: "published", publishedAt: now - i * 1000, categoryId: i < 4 ? cat.id : null });
    const p1 = await listPublishedNews({ page: 1 });
    expect(p1).toMatchObject({ total: 11, pages: 2, page: 1 });
    expect(p1.items.length).toBe(9);
    expect((await listPublishedNews({ page: 2 })).items.length).toBe(2);
    expect((await listPublishedNews({ page: 99 })).page).toBe(2);
    expect((await listPublishedNews({ categorySlug: "progetti" })).total).toBe(4);
    expect(await listPublicCategories()).toEqual([{ name: "Progetti", slug: "progetti", count: 4 }]);
  });

  it("deleting a category keeps the news", async () => {
    const cat = await createCategory("Eventi");
    if (!cat.ok) throw new Error("cat");
    await mk({ slug: "x", categoryId: cat.id });
    await deleteCategory(cat.id);
    expect((await listNewsAdmin()).length).toBe(1);
    expect(await listCategories()).toEqual([]);
    expect((await createCategory("eventi")).ok).toBe(true);
    expect((await createCategory("EVENTI")).ok).toBe(false);
  });
});

describe("publish dates", () => {
  it("publishing without a date uses now, keeps an earlier date, honours explicit dates", () => {
    expect(resolvePublishedAt({ status: "published", requested: null, previous: null, now: 100 })).toBe(100);
    expect(resolvePublishedAt({ status: "published", requested: null, previous: 50, now: 100 })).toBe(50);
    expect(resolvePublishedAt({ status: "published", requested: 70, previous: 50, now: 100 })).toBe(70);
    expect(resolvePublishedAt({ status: "draft", requested: null, previous: null, now: 100 })).toBeNull();
  });
  it("datetime-local round trip in Europe/Rome (summer and winter)", () => {
    for (const v of ["2026-07-15T10:30", "2026-12-15T10:30", "2026-10-25T01:30"]) expect(toLocalDateTime(parseLocalDateTime(v))).toBe(v);
    expect(new Date(parseLocalDateTime("2026-07-15T10:30")!).toISOString()).toBe("2026-07-15T08:30:00.000Z");
    expect(new Date(parseLocalDateTime("2026-12-15T10:30")!).toISOString()).toBe("2026-12-15T09:30:00.000Z");
    expect(parseLocalDateTime("garbage")).toBeNull();
  });
});

describe("body sanitisation", () => {
  it("removes scripts, handlers, javascript: links and foreign tags", () => {
    const dirty = '<p onclick="x()">Ciao <b>mondo</b><script>alert(1)</script></p><a href="javascript:alert(1)">x</a><iframe src="https://evil"></iframe><img src="http://evil/a.png" onerror="x()"><style>p{}</style>';
    const out = cleanNewsBody(dirty);
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|iframe|<style|http:\/\/evil/i);
    expect(out).toContain("<strong>mondo</strong>");
  });
  it("normalises editor output (div->p, empty blocks) and hardens links", () => {
    const out = cleanNewsBody('<div>Uno</div><div><br></div><h2>Titolo</h2><a href="https://example.org" target="_blank">l</a>');
    expect(out).toContain("<p>Uno</p>");
    expect(out).not.toContain("<div");
    expect(out).not.toMatch(/<p>\s*<\/p>/);
    expect(out).toContain('rel="noopener noreferrer"');
  });
  it("keeps same-origin media images, drops other sources", () => {
    expect(cleanNewsBody('<img src="/media/2026/10/a.jpg" alt="x">')).toContain("/media/2026/10/a.jpg");
    expect(cleanNewsBody('<img src="data:image/png;base64,AAAA">')).not.toContain("data:");
  });
  it("excerpt fallback is plain text", () => expect(excerptFrom("<p>" + "parola ".repeat(60) + "</p>", 40).endsWith("…")).toBe(true));
});
