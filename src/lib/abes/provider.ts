import { getShopifyConfig } from "./shopify";

export type ProviderStatus =
  | { kind: "shopify"; label: string; domain: string; collection: string | null }
  | { kind: "manual"; label: string; reason: "not_configured" };

/** Which source feeds the showcase. Manual is always available; Shopify only with both env vars set. */
export function getProviderStatus(env: Record<string, string | undefined> = process.env): ProviderStatus {
  const c = getShopifyConfig(env);
  if (c) return { kind: "shopify", label: "Shopify collegato (sincronizzazione ufficiale)", domain: c.domain, collection: c.collectionHandle };
  return { kind: "manual", label: "Catalogo manuale", reason: "not_configured" };
}
