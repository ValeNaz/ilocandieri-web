/** Validation/normalisation of ABES product URLs and product image URLs. Pure (usable in tests and client). */

export const ABES_ORIGIN = "https://abes.bio";
export const ABES_PRODUCT_PREFIX = `${ABES_ORIGIN}/products/`;
export const ABES_CATALOG_URL = `${ABES_ORIGIN}/collections/all`;

export type UrlResult = { ok: true; url: string; handle: string } | { ok: false; error: string };

const HANDLE_RE = /^[a-z0-9][a-z0-9_%-]*$/i;

/**
 * Accepts `https://abes.bio/products/<handle>` (also www., query strings, trailing slash and the
 * `/collections/x/products/<handle>` form) and returns the canonical URL. Anything else is rejected.
 */
export function normalizeAbesProductUrl(input: string): UrlResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Inserisci l'indirizzo del prodotto su abes.bio." };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, error: "L'indirizzo non è valido. Esempio: https://abes.bio/products/caponata-melanzane" };
  }
  if (u.protocol !== "https:") return { ok: false, error: "L'indirizzo deve iniziare con https://" };
  if (u.hostname !== "abes.bio" && u.hostname !== "www.abes.bio") return { ok: false, error: "Il link deve puntare a un prodotto su abes.bio." };
  if (u.username || u.password || (u.port && u.port !== "443")) return { ok: false, error: "L'indirizzo non è valido." };
  const m = /^\/(?:collections\/[^/]+\/)?products\/([^/]+)\/?$/.exec(u.pathname);
  if (!m) return { ok: false, error: "Il link deve essere la pagina di un prodotto: https://abes.bio/products/nome-prodotto" };
  const handle = m[1]!.toLowerCase();
  if (!HANDLE_RE.test(handle)) return { ok: false, error: "L'indirizzo del prodotto non è valido." };
  return { ok: true, url: `${ABES_PRODUCT_PREFIX}${handle}`, handle };
}

export const isAbesProductUrl = (url: string) => normalizeAbesProductUrl(url).ok;

/** Image URL allowed in the showcase: Shopify CDN (https) or an image uploaded to our media library. */
export function normalizeProductImageUrl(input: string): { ok: true; url: string } | { ok: false; error: string } {
  let raw = input.trim();
  if (raw.startsWith("//")) raw = `https:${raw}`;
  if (raw.startsWith("/media/") && !raw.includes("..")) return { ok: true, url: raw };
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" && u.hostname === "cdn.shopify.com" && !u.username) return { ok: true, url: u.toString() };
  } catch {
    /* fallthrough */
  }
  return { ok: false, error: "L'immagine deve essere caricata qui oppure arrivare da cdn.shopify.com (l'indirizzo immagine di ABES)." };
}
