"use server";

import { and, eq, gt, lt, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { isBlockType, PAGE_URLS, type PageKey } from "@/lib/content/blocks";
import { blockFieldErrors, parseBlockForm } from "@/lib/content/form";
import { db, schema } from "@/lib/db";
import { flash } from "@/lib/flash";

const idSchema = z.string().trim().min(1).max(40);

function revalidatePage(pageKey: string) {
  revalidatePath(PAGE_URLS[pageKey as PageKey] ?? "/");
  revalidatePath("/admin", "layout");
}

async function loadBlock(id: string) {
  const [row] = await db
    .select({ block: schema.pageBlocks, pageKey: schema.pages.key })
    .from(schema.pageBlocks)
    .innerJoin(schema.pages, eq(schema.pages.id, schema.pageBlocks.pageId))
    .where(eq(schema.pageBlocks.id, id));
  return row ?? null;
}

/** Save the texts/images/CTAs of one block (validated per block type). */
export async function saveBlockAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return actionError("Blocco non valido.");
  const row = await loadBlock(id.data);
  if (!row || !isBlockType(row.block.type)) return actionError("Blocco non trovato.");
  const parsed = parseBlockForm(row.block.type, formData, (row.block.data ?? {}) as Record<string, unknown>);
  if (!parsed.success) return actionError("Controlla i campi evidenziati.", blockFieldErrors(parsed.error));
  await db.update(schema.pageBlocks).set({ data: parsed.data, updatedAt: Date.now() }).where(eq(schema.pageBlocks.id, id.data));
  await audit(user.id, "block_saved", "page_block", id.data);
  revalidatePage(row.pageKey);
  return actionOk("Salvato. La modifica è già visibile sul sito.");
}

export async function toggleBlockAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const row = await loadBlock(id);
  if (!row) return;
  await db.update(schema.pageBlocks).set({ visible: !row.block.visible, updatedAt: Date.now() }).where(eq(schema.pageBlocks.id, id));
  await audit(user.id, row.block.visible ? "block_hidden" : "block_shown", "page_block", id);
  revalidatePage(row.pageKey);
  await flash("success", row.block.visible ? "Sezione nascosta: non compare più sul sito." : "Sezione di nuovo visibile sul sito.");
}

/** Swap position with the neighbour above/below. */
export async function moveBlockAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const dir = z.enum(["up", "down"]).parse(formData.get("dir"));
  const row = await loadBlock(id);
  if (!row) return;
  const { block } = row;
  const [other] = await db
    .select()
    .from(schema.pageBlocks)
    .where(and(eq(schema.pageBlocks.pageId, block.pageId), dir === "up" ? lt(schema.pageBlocks.position, block.position) : gt(schema.pageBlocks.position, block.position)))
    .orderBy(dir === "up" ? desc(schema.pageBlocks.position) : asc(schema.pageBlocks.position))
    .limit(1);
  if (!other) return;
  await db.transaction(async (tx) => {
    await tx.update(schema.pageBlocks).set({ position: other.position }).where(eq(schema.pageBlocks.id, block.id));
    await tx.update(schema.pageBlocks).set({ position: block.position }).where(eq(schema.pageBlocks.id, other.id));
  });
  await audit(user.id, "block_moved", "page_block", id);
  revalidatePage(row.pageKey);
}

const seoSchema = z.object({
  pageId: idSchema,
  seoTitle: z.string().trim().max(70, "Massimo 70 caratteri.").default(""),
  seoDescription: z.string().trim().max(200, "Massimo 200 caratteri.").default(""),
  ogImageId: z.string().trim().max(40).default(""),
});

export async function savePageSeoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = seoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.id, d.pageId));
  if (!page) return actionError("Pagina non trovata.");
  if (d.ogImageId) {
    const [m] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.id, d.ogImageId));
    if (!m) return actionError("L'immagine scelta non esiste più.", { ogImageId: "Immagine non trovata." });
  }
  await db.update(schema.pages).set({ seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null, ogImageId: d.ogImageId || null, updatedAt: Date.now() }).where(eq(schema.pages.id, d.pageId));
  await audit(user.id, "page_seo_saved", "page", d.pageId);
  revalidatePage(page.key);
  return actionOk("Impostazioni SEO salvate.");
}
