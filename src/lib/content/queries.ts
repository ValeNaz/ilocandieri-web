import { and, asc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db, schema } from "@/lib/db";
import { mediaUrl } from "@/lib/storage";
import { isBlockType, parseBlockData, type BlockType, type ParsedBlock, type PageKey } from "./blocks";

export type ResolvedImage = { id: string; url: string; alt: string; width: number | null; height: number | null };
export type ImageMap = Record<string, ResolvedImage>;
export type PageContent = {
  page: typeof schema.pages.$inferSelect | null;
  /** Visible blocks (or all, with `includeHidden`), ordered by position, validated. Broken blocks are skipped. */
  blocks: ParsedBlock[];
  /** Media referenced by the blocks, keyed by media id. */
  images: ImageMap;
};

function collectImageIds(value: unknown, out: Set<string>) {
  if (Array.isArray(value)) return value.forEach((v) => collectImageIds(v, out));
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "imageId" && typeof v === "string" && v) out.add(v);
      else collectImageIds(v, out);
    }
  }
}

export async function resolveMedia(ids: Iterable<string>): Promise<ImageMap> {
  const list = [...new Set([...ids].filter(Boolean))];
  if (!list.length) return {};
  const rows = await db.select().from(schema.media).where(inArray(schema.media.id, list));
  return Object.fromEntries(rows.map((m) => [m.id, { id: m.id, url: mediaUrl(m.path), alt: m.alt, width: m.width, height: m.height }]));
}

async function load(key: PageKey, includeHidden: boolean): Promise<PageContent> {
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  if (!page) return { page: null, blocks: [], images: {} };
  const rows = await db
    .select()
    .from(schema.pageBlocks)
    .where(includeHidden ? eq(schema.pageBlocks.pageId, page.id) : and(eq(schema.pageBlocks.pageId, page.id), eq(schema.pageBlocks.visible, true)))
    .orderBy(asc(schema.pageBlocks.position), asc(schema.pageBlocks.id));
  const blocks: ParsedBlock[] = [];
  for (const r of rows) {
    if (!isBlockType(r.type)) continue;
    const parsed = parseBlockData(r.type as BlockType, r.data);
    if (!parsed.success) {
      console.warn(`[content] block ${r.id} (${r.type}) on page ${key} has invalid data and was skipped`);
      continue;
    }
    blocks.push({ id: r.id, type: r.type, position: r.position, visible: r.visible, data: parsed.data } as ParsedBlock);
  }
  const ids = new Set<string>();
  for (const b of blocks) collectImageIds(b.data, ids);
  return { page, blocks, images: await resolveMedia(ids) };
}

/**
 * Visible, validated blocks of an institutional page, ordered, with their images resolved.
 * Render with `<PageBlocks content={await getPageBlocks("eventi")} />` or pick single blocks with `findBlock`.
 */
export const getPageBlocks = cache((key: PageKey) => load(key, false));

/** Same as getPageBlocks but includes hidden blocks (admin preview/editing helpers). */
export const getAllPageBlocks = (key: PageKey) => load(key, true);

/** Find a block by `slot` (and optionally type) in a PageContent. */
export function findBlock<T extends BlockType>(content: Pick<PageContent, "blocks">, slot: string, type?: T): Extract<ParsedBlock, { type: T }> | undefined {
  return content.blocks.find((b) => b.data.slot === slot && (!type || b.type === type)) as Extract<ParsedBlock, { type: T }> | undefined;
}

/** Text of a `message` block by slot, or a fallback. */
export function messageText(content: Pick<PageContent, "blocks">, slot: string, fallback = ""): string {
  const b = findBlock(content, slot, "message");
  return b?.data.text || fallback;
}
