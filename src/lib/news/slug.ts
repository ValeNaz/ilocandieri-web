import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function taken(slug: string, excludeId?: string): Promise<boolean> {
  const where = excludeId ? and(eq(schema.news.slug, slug), ne(schema.news.id, excludeId)) : eq(schema.news.slug, slug);
  const [r] = await db.select({ id: schema.news.id }).from(schema.news).where(where).limit(1);
  return !!r;
}

/** Auto slug from a title; on collision appends -2, -3... Never returns an empty slug. */
export async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "notizia";
  if (!(await taken(base, excludeId))) return base;
  for (let i = 2; i < 500; i++) {
    const cand = `${base.slice(0, 74)}-${i}`;
    if (!(await taken(cand, excludeId))) return cand;
  }
  return `${base.slice(0, 60)}-${Date.now().toString(36)}`;
}

/** Checks an admin-typed slug. */
export async function checkCustomSlug(raw: string, excludeId?: string): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const slug = slugify(raw);
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: "Usa solo lettere, numeri e trattini." };
  if (await taken(slug, excludeId)) return { ok: false, error: "Questo indirizzo è già usato da un'altra news. Cambialo o lascia vuoto per generarlo." };
  return { ok: true, slug };
}
