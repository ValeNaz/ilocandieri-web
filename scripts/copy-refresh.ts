/**
 * Apply scripts/copy/* to the EXISTING database: for every page block whose slot has an override, merge the override
 * into the block data (validated with the block schema). Overwrites edited text of those slots: run on purpose.
 *
 *   pnpm copy:refresh
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { parseBlockData, type BlockType, type PageKey } from "../src/lib/content/blocks";
import { createDb, schema } from "../src/lib/db";
import { COPY } from "./copy";

const { client, db } = createDb();
let n = 0;
for (const [pageKey, slots] of Object.entries(COPY)) {
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, pageKey as PageKey));
  if (!page) { console.log(`[copy] page "${pageKey}" missing`); continue; }
  const blocks = await db.select().from(schema.pageBlocks).where(eq(schema.pageBlocks.pageId, page.id));
  for (const [slot, patch] of Object.entries(slots ?? {})) {
    const b = blocks.find((x) => (x.data as { slot?: string } | null)?.slot === slot);
    if (!b) { console.log(`[copy] ${pageKey}/${slot}: no such block`); continue; }
    const merged = { ...(b.data as object), ...(patch as object) };
    const parsed = parseBlockData(b.type as BlockType, merged);
    if (!parsed.success) throw new Error(`copy: invalid ${pageKey}/${slot}: ${parsed.error.message}`);
    await db.update(schema.pageBlocks).set({ data: parsed.data }).where(eq(schema.pageBlocks.id, b.id));
    n++;
  }
}
console.log(`[copy] ${n} blocks updated`);
client.close();
