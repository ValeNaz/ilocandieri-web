import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getSetting } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage";

/** Absolute URL of a media row used as social image, or undefined. */
export async function ogImageFor(mediaId: string | null | undefined) {
  if (!mediaId) return undefined;
  const [m] = await db.select().from(schema.media).where(eq(schema.media.id, mediaId));
  if (!m) return undefined;
  return { url: `${getSiteUrl()}${mediaUrl(m.path)}`, width: m.width ?? undefined, height: m.height ?? undefined, alt: m.alt || undefined };
}

/**
 * Metadata for an institutional page from the `pages` table (title/description/og image editable in admin):
 * canonical, Open Graph and Twitter card. Falls back to the site-wide SEO defaults.
 */
export async function pageMetadata(key: (typeof schema.pages.$inferSelect)["key"], path: string): Promise<Metadata> {
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  const seo = await getSetting("seo_defaults");
  const title = page?.seoTitle || page?.title || seo.siteName;
  const description = page?.seoDescription || seo.description || undefined;
  const img = await ogImageFor(page?.ogImageId ?? seo.ogImageId);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${getSiteUrl()}${path}`, siteName: seo.siteName, locale: "it_IT", type: "website", ...(img ? { images: [img] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(img ? { images: [img.url] } : {}) },
  };
}

export const noIndex: Metadata = { robots: { index: false, follow: false, nocache: true } };
