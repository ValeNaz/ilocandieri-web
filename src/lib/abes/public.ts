// INTERFACE CONTRACT (owner: ABES+NEWS agent). Signature must stay stable; implementation will be replaced.
export type ShowcaseProduct = {
  id: string;
  title: string;
  url: string; // https://abes.bio/products/...
  imageUrl: string | null;
  imageAlt: string;
  category: string | null;
  priceText: string | null; // only when reliable
  available: boolean | null; // only when reliable
};

/** Products flagged for Home, visible, ordered by position. */
export async function getHomeProducts(_limit: number): Promise<ShowcaseProduct[]> {
  return [];
}

/** All visible products for the Shop page, ordered by position. */
export async function getShopProducts(): Promise<ShowcaseProduct[]> {
  return [];
}
