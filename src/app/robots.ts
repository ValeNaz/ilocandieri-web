import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

/** Admin area is never crawled (it is also served with X-Robots-Tag: noindex). Private files are not served at all. */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
