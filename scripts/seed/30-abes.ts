/**
 * Real ABES products from the public catalogue snapshot of 2026-10-18 (docs/abes-catalog-snapshot-2026-10-18.json).
 * Source: manual -> no price and no availability badge (nothing declared as "fresh").
 * Idempotent: rows are matched by URL and never overwritten, so admin edits survive re-seeding.
 * Handles are authoritative; some titles on abes.bio do not match their handle (see notes).
 */
import type { SeedFn } from "../seed-types";

const CDN = "https://cdn.shopify.com/s/files/1/0830/7612/0899/files/";

type Item = { handle: string; title: string; image: string; category: string; home: boolean; visible?: boolean };

// Order = position. First 8 are shown in Home: preserves, legumes, flours, Tumminia pasta.
const ITEMS: Item[] = [
  { handle: "caponata-melanzane", title: "CAPONATA SICILIANA", image: "IMG_8170.jpg?v=1717750049", category: "Conserve", home: true },
  { handle: "cipollata-in-agrodolce", title: "CIPOLLATA IN AGRODOLCE", image: "PHOTO-2024-06-06-19-13-28.jpg?v=1726739183", category: "Conserve", home: true },
  { handle: "pate-di-peperoncini", title: "PATÉ DI PEPERONCINI - 180 gr", image: "IMG_8171_02f2da0f-803c-46df-ad49-317367b41014.jpg?v=1717698256", category: "Conserve", home: true },
  { handle: "sugo-di-pomodoro-al-basilico-biogico-440-gr", title: "SUGO DI POMODORO AL BASILICO BIOLOGICO - 440 GR", image: "Sugo_pronto_al_basilico.png?v=1769678223", category: "Sughi e passate", home: true },
  // NOTE: the handle "pate-di-melanzane" is the page titled "PASSATA DI POMODORO BIO - 680 gr" on abes.bio (verified 2026-10-18).
  { handle: "pate-di-melanzane", title: "PASSATA DI POMODORO BIO - 680 gr", image: "Piccolada446ml_8b03470f-ef55-4379-b291-4c4c83279ac0.png?v=1726741885", category: "Sughi e passate", home: true },
  { handle: "ceci-400-gr", title: "Ceci 400 GR", image: "Ceci_400_gr_con_etichetta.png?v=1762163883", category: "Legumi", home: true },
  { handle: "farina-di-ceci-1-kg", title: "FARINA DI CECI 1 KG", image: "farina_di_ceci_SFONDO.jpg?v=1769681099", category: "Farine", home: true },
  { handle: "pasta-busiate-varieta-tumminia-500-gr", title: "PASTA BUSIATE VARIETA' TUMMINIA - 500 GR", image: "Busiate_SFONDO_CONTADINO_RITAGLIATA.jpg?v=1769772443", category: "Pasta", home: true },
  { handle: "pasta-abbracci-varieta-tumminia-500-gr", title: "PASTA ABBRACCI VARIETA' TUMMINIA - 500 GR", image: "Abbracci_CON_SFONDO.jpg?v=1769772483", category: "Pasta", home: false },
  { handle: "semolato-di-tumminia", title: "Semolato di Tumminia 1 KG", image: "FarinaTumminia.jpg?v=1727696717", category: "Farine", home: false },
  // Gift basket: real product, hidden until the cooperative decides to show seasonal items.
  { handle: "ceste-delle-feste", title: "Ceste delle Feste ABES", image: "CestaPiccola.png?v=1744974922", category: "Idee regalo", home: false, visible: false },
  // NOTE: handle "passata-di-pomodoro" is titled just "Ceci" on abes.bio, with a generic photo and no clear product: kept hidden, to be reviewed with ABES.
  { handle: "passata-di-pomodoro", title: "Ceci", image: "ABES_Castelvetrano-3.jpg?v=1743428107", category: "Legumi", home: false, visible: false },
  // Excluded on purpose: "sostieni-abes" (donation, not a product).
];

const seed: SeedFn = async ({ db, schema, newId, log }) => {
  const existing = await db.select({ url: schema.products.url }).from(schema.products);
  const have = new Set(existing.map((r) => r.url));
  let position = existing.length;
  let n = 0;
  const now = Date.now();
  for (const [i, it] of ITEMS.entries()) {
    const url = `https://abes.bio/products/${it.handle}`;
    if (have.has(url)) continue;
    await db.insert(schema.products).values({
      id: newId(), source: "manual", handle: it.handle, title: it.title, url, imageUrl: `${CDN}${it.image}`, imageAlt: "",
      category: it.category, priceText: null, priceCheckedAt: null, available: null,
      visible: it.visible ?? true, featuredHome: it.home, position: existing.length === 0 ? i : position++,
      syncStatus: null, lastSyncedAt: null, createdAt: now, updatedAt: now,
    }).onConflictDoNothing();
    n++;
  }
  log(`abes products: ${n} inserted`);
};

export default seed;
