// INTERFACE CONTRACT (owner: ABES+NEWS agent). Signature must stay stable; implementation will be replaced.
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

/** Published news for Home: featured first, then most recent. */
export async function getHomeNews(_limit: number): Promise<NewsCardData[]> {
  return [];
}
