import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { getSetting } from "@/lib/settings";

/** Metadata for an institutional page from the `pages` table (title/description editable in admin). */
export async function pageMetadata(key: (typeof schema.pages.$inferSelect)["key"], path: string): Promise<Metadata> {
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  const seo = await getSetting("seo_defaults");
  const title = page?.seoTitle || page?.title || seo.siteName;
  const description = page?.seoDescription || seo.description || undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${getSiteUrl()}${path}`, siteName: seo.siteName, locale: "it_IT", type: "website" },
  };
}

export const noIndex: Metadata = { robots: { index: false, follow: false, nocache: true } };
