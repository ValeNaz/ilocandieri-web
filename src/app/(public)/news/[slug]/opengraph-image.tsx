import { getPublishedBySlug } from "@/lib/news/public";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";
import { formatDate } from "@/lib/utils";

export const alt = "News de I Locandieri";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getPublishedBySlug((await params).slug);
  return ogImage({ title: a?.title ?? "News", kicker: a ? `News · ${formatDate(a.publishedAt)}` : "News" });
}
