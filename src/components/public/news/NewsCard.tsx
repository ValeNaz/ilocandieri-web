// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable; implementation will be replaced.
import type { NewsCardData } from "@/lib/news/public";

export function NewsCard(_props: { news: NewsCardData; headingLevel?: 2 | 3 }) {
  return null;
}
