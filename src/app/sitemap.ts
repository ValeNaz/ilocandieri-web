import type { MetadataRoute } from "next";
import { db, schema } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { paths } from "@/lib/paths";
import { listPublishedForSitemap } from "@/lib/news/public";
import { getPublishedEventSlugs } from "@/lib/events/public";

export const dynamic = "force-dynamic";

/** Institutional pages + published news/events (drafts and hidden items never listed). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pageRows = await db.select({ key: schema.pages.key, updatedAt: schema.pages.updatedAt }).from(schema.pages);
  const updated = new Map(pageRows.map((p) => [p.key, new Date(p.updatedAt)]));
  const staticPages: [string, string, MetadataRoute.Sitemap[number]["changeFrequency"], number][] = [
    [paths.home, "home", "weekly", 1],
    [paths.about, "chi-siamo", "monthly", 0.8],
    [paths.shop, "shop", "monthly", 0.8],
    [paths.events, "eventi", "weekly", 0.8],
    [paths.news, "news", "weekly", 0.8],
    [paths.careers, "lavora-con-noi", "monthly", 0.6],
    [paths.contacts, "contatti", "yearly", 0.6],
    [paths.privacy, "privacy", "yearly", 0.2],
    [paths.cookies, "cookie", "yearly", 0.2],
  ];
  const entries: MetadataRoute.Sitemap = staticPages.map(([path, key, changeFrequency, priority]) => ({
    url: `${base}${path}`,
    lastModified: updated.get(key as never),
    changeFrequency,
    priority,
  }));

  const [news, events] = await Promise.all([
    listPublishedForSitemap(),
    getPublishedEventSlugs(),
  ]);
  for (const n of news) entries.push({ url: `${base}${paths.newsItem(n.slug)}`, lastModified: new Date(n.updatedAt), changeFrequency: "monthly", priority: 0.6 });
  for (const e of events) entries.push({ url: `${base}${paths.event(e.slug)}`, lastModified: new Date(e.updatedAt), changeFrequency: "weekly", priority: 0.6 });
  return entries;
}
