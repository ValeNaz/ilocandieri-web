import { desc, eq, like, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { mediaUrl } from "@/lib/storage";

export type MediaOptionRow = { id: string; url: string; alt: string };

export async function listMediaOptions(): Promise<MediaOptionRow[]> {
  const rows = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));
  return rows.map((m) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt }));
}

export type MediaUsage = { label: string }[];

/**
 * Where a media row is referenced: page blocks (JSON), pages OG image, site SEO default, news covers/OG/gallery,
 * events covers. Used to block deletion of images still in use.
 */
export async function getMediaUsage(mediaId: string): Promise<MediaUsage> {
  const out: MediaUsage = [];
  const blocks = await db
    .select({ key: schema.pages.key, title: schema.pages.title })
    .from(schema.pageBlocks)
    .innerJoin(schema.pages, eq(schema.pages.id, schema.pageBlocks.pageId))
    .where(like(schema.pageBlocks.data, `%"${mediaId}"%`));
  for (const b of new Map(blocks.map((x) => [x.key, x])).values()) out.push({ label: `Pagina «${b.title}»` });
  const og = await db.select({ title: schema.pages.title }).from(schema.pages).where(eq(schema.pages.ogImageId, mediaId));
  for (const p of og) out.push({ label: `Immagine di condivisione della pagina «${p.title}»` });
  const [seo] = await db.select().from(schema.settings).where(eq(schema.settings.key, "seo_defaults"));
  if (seo && (seo.value as { ogImageId?: string | null }).ogImageId === mediaId) out.push({ label: "Immagine di condivisione predefinita del sito" });
  const news = await db.select({ title: schema.news.title }).from(schema.news).where(or(eq(schema.news.coverId, mediaId), eq(schema.news.ogImageId, mediaId)));
  for (const n of news) out.push({ label: `News «${n.title}»` });
  const gallery = await db.select({ id: schema.newsImages.newsId }).from(schema.newsImages).where(eq(schema.newsImages.mediaId, mediaId));
  if (gallery.length) out.push({ label: `Galleria di ${gallery.length} news` });
  const events = await db.select({ title: schema.events.title }).from(schema.events).where(eq(schema.events.coverId, mediaId));
  for (const e of events) out.push({ label: `Evento «${e.title}»` });
  return out;
}

/** Best-effort pixel size from the file header (PNG, JPEG, WebP). AVIF or unknown -> nulls. */
export function imageSize(b: Buffer): { width: number; height: number } | null {
  try {
    if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1]!;
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
        i += 2 + b.readUInt16BE(i + 2);
      }
      return null;
    }
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const kind = b.toString("ascii", 12, 16);
      if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      if (kind === "VP8L") { const v = b.readUInt32LE(21); return { width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1 }; }
    }
  } catch {
    /* malformed header: ignore */
  }
  return null;
}
