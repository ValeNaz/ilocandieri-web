"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { db, newId, schema } from "@/lib/db";
import { flash } from "@/lib/flash";
import { cleanNewsBody, bodyTextLength } from "@/lib/news/body";
import { parseLocalDateTime, resolvePublishedAt } from "@/lib/news/core";
import { createCategory, deleteCategory, getNewsRow, renameCategory } from "@/lib/news/admin";
import { newsInputSchema, categoryNameSchema } from "@/lib/news/schema";
import { checkCustomSlug, uniqueSlug } from "@/lib/news/slug";
import { adminPaths, paths } from "@/lib/paths";
import { isUploaded, saveImageUpload } from "@/lib/uploads";

const editPath = (id: string) => `${adminPaths.news}/${id}`;

function touchPublic(slug?: string) {
  revalidatePath(paths.home);
  revalidatePath(paths.news);
  if (slug) revalidatePath(paths.newsItem(slug));
}

async function mediaExists(id: string) {
  const [m] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.id, id));
  return !!m;
}

export async function saveNewsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = id ? await getNewsRow(id) : null;
  if (id && !existing) return actionError("Questa news non esiste più.");

  const parsed = newsInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi evidenziati.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  const fe: Record<string, string> = {};

  // Slug: custom (validated) > keep existing > auto from title.
  let slug: string;
  if (d.slug) {
    const c = await checkCustomSlug(d.slug, existing?.id);
    if (!c.ok) return actionError("Controlla i campi evidenziati.", { slug: c.error });
    slug = c.slug;
  } else slug = existing?.slug ?? (await uniqueSlug(d.title));

  const body = cleanNewsBody(d.body);
  const status: "draft" | "published" = d.intent === "publish" ? "published" : d.intent === "unpublish" ? "draft" : existing?.status ?? "draft";
  if (status === "published" && bodyTextLength(body) < 1 && !d.excerpt) fe.body = "Prima di pubblicare scrivi almeno l'introduzione o il testo.";

  let requested: number | null = null;
  if (d.publishedAtLocal) {
    requested = parseLocalDateTime(d.publishedAtLocal);
    if (requested === null) fe.publishedAtLocal = "Data non valida.";
  }

  // Category
  let categoryId: string | null = null;
  if (d.categoryId) {
    const [c] = await db.select({ id: schema.newsCategories.id }).from(schema.newsCategories).where(eq(schema.newsCategories.id, d.categoryId));
    if (!c) fe.categoryId = "Categoria non trovata.";
    else categoryId = c.id;
  }

  // Cover
  let coverId: string | null = existing?.coverId ?? null;
  const coverFile = formData.get("coverFile");
  const pickedCover = String(formData.get("coverPick") ?? "");
  if (formData.get("removeCover") === "on") coverId = null;
  if (isUploaded(coverFile)) {
    const up = await saveImageUpload(coverFile, { alt: d.coverAlt });
    if (!up.ok) fe.coverFile = up.error;
    else coverId = up.mediaId;
  } else if (pickedCover && (await mediaExists(pickedCover))) coverId = pickedCover;
  if (coverId && d.coverAlt) await db.update(schema.media).set({ alt: d.coverAlt }).where(eq(schema.media.id, coverId));
  if (coverId && status === "published") {
    const [m] = await db.select({ alt: schema.media.alt }).from(schema.media).where(eq(schema.media.id, coverId));
    if (!m?.alt?.trim()) fe.coverAlt = "Descrivi la foto di copertina prima di pubblicare (per chi non la vede).";
  }

  // Social image
  let ogImageId: string | null = existing?.ogImageId ?? null;
  const ogFile = formData.get("ogFile");
  if (formData.get("removeOg") === "on") ogImageId = null;
  if (isUploaded(ogFile)) {
    const up = await saveImageUpload(ogFile, { alt: d.seoTitle || d.title });
    if (!up.ok) fe.ogFile = up.error;
    else ogImageId = up.mediaId;
  }

  // New gallery uploads (validated before anything is written to the news row)
  const newGallery: string[] = [];
  for (const f of formData.getAll("galleryFiles")) {
    if (!isUploaded(f)) continue;
    const up = await saveImageUpload(f, { alt: "" });
    if (!up.ok) { fe.galleryFiles = up.error; break; }
    newGallery.push(up.mediaId);
  }

  if (Object.keys(fe).length) return actionError("Controlla i campi evidenziati.", fe);

  const now = Date.now();
  const publishedAt = resolvePublishedAt({ status, requested, previous: existing?.publishedAt ?? null, now });
  const values = {
    slug, title: d.title, excerpt: d.excerpt, body, coverId, categoryId, status, featured: d.featured, publishedAt,
    seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null, ogImageId, updatedAt: now,
  };

  let newsId = existing?.id ?? "";
  if (existing) await db.update(schema.news).set(values).where(eq(schema.news.id, existing.id));
  else {
    newsId = newId();
    await db.insert(schema.news).values({ id: newsId, ...values, createdAt: now });
  }

  // Existing gallery: alt text, removal, order
  if (existing) {
    const rows = await db.select({ mediaId: schema.newsImages.mediaId }).from(schema.newsImages).where(eq(schema.newsImages.newsId, newsId));
    const remove = new Set(formData.getAll("galleryRemove").map(String));
    for (const r of rows) {
      if (remove.has(r.mediaId)) {
        await db.delete(schema.newsImages).where(and(eq(schema.newsImages.newsId, newsId), eq(schema.newsImages.mediaId, r.mediaId)));
        continue;
      }
      const alt = formData.get(`galleryAlt_${r.mediaId}`);
      if (typeof alt === "string") await db.update(schema.media).set({ alt: alt.trim().slice(0, 200) }).where(eq(schema.media.id, r.mediaId));
      const pos = Number(formData.get(`galleryPos_${r.mediaId}`));
      if (Number.isFinite(pos)) await db.update(schema.newsImages).set({ position: Math.trunc(pos) }).where(and(eq(schema.newsImages.newsId, newsId), eq(schema.newsImages.mediaId, r.mediaId)));
    }
  }
  if (newGallery.length) {
    const rows = await db.select({ p: schema.newsImages.position }).from(schema.newsImages).where(eq(schema.newsImages.newsId, newsId));
    let pos = rows.reduce((m, r) => Math.max(m, r.p), 0) + 1;
    for (const mediaId of newGallery) await db.insert(schema.newsImages).values({ newsId, mediaId, position: pos++ });
  }

  await audit(user.id, existing ? `news_${d.intent === "save" ? "updated" : d.intent === "publish" ? "published" : "unpublished"}` : "news_created", "news", newsId);
  touchPublic(slug);
  if (existing && existing.slug !== slug) revalidatePath(paths.newsItem(existing.slug));
  await flash("success", d.intent === "publish" ? "News pubblicata." : d.intent === "unpublish" ? "News riportata in bozza: non è più visibile." : newGallery.length ? "Salvato. Descrivi le nuove immagini della galleria." : "Salvato.");
  redirect(editPath(newsId));
}

export async function setNewsStatusAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const to = formData.get("to") === "published" ? "published" : "draft";
  const row = await getNewsRow(id);
  if (!row) redirect(adminPaths.news);
  const now = Date.now();
  await db.update(schema.news).set({ status: to, publishedAt: resolvePublishedAt({ status: to, requested: null, previous: row.publishedAt, now }), updatedAt: now }).where(eq(schema.news.id, id));
  await audit(user.id, to === "published" ? "news_published" : "news_unpublished", "news", id);
  touchPublic(row.slug);
  await flash("success", to === "published" ? "News pubblicata." : "News ritirata: ora è una bozza.");
  redirect(adminPaths.news);
}

export async function deleteNewsAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const row = await getNewsRow(id);
  if (row) {
    await db.delete(schema.news).where(eq(schema.news.id, id));
    await audit(user.id, "news_deleted", "news", id);
    touchPublic(row.slug);
  }
  await flash("success", "News eliminata.");
  redirect(adminPaths.news);
}

// ---------- categories ----------
export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const p = categoryNameSchema.safeParse(formData.get("name"));
  if (!p.success) return actionError("Controlla il nome.", { name: p.error.issues[0]?.message ?? "Nome non valido." });
  const r = await createCategory(p.data);
  if (!r.ok) return actionError(r.error, { name: r.error });
  await audit(user.id, "news_category_created", "news_category", r.id);
  revalidatePath(`${adminPaths.news}/categorie`);
  await flash("success", "Categoria aggiunta.");
  redirect(`${adminPaths.news}/categorie`);
}

export async function renameCategoryAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const p = categoryNameSchema.safeParse(formData.get("name"));
  if (!p.success) { await flash("error", p.error.issues[0]?.message ?? "Nome non valido."); redirect(`${adminPaths.news}/categorie`); }
  const r = await renameCategory(id, p.data);
  if (!r.ok) await flash("error", r.error);
  else { await audit(user.id, "news_category_renamed", "news_category", id); touchPublic(); await flash("success", "Categoria rinominata."); }
  redirect(`${adminPaths.news}/categorie`);
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteCategory(id);
  await audit(user.id, "news_category_deleted", "news_category", id);
  touchPublic();
  await flash("success", "Categoria eliminata. Le news restano, senza categoria.");
  redirect(`${adminPaths.news}/categorie`);
}
