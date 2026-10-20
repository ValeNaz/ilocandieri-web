import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { db, newId, schema } from "@/lib/db";
import { getAllPageBlocks, getPageBlocks, findBlock, messageText } from "@/lib/content/queries";
import { PAGE_KEYS } from "@/lib/content/blocks";
import seed from "../../scripts/seed/10-content";

const ctx = () => ({ db, schema, newId, log: () => {} });

describe("content seed", () => {
  beforeAll(async () => {
    for (const key of PAGE_KEYS) await db.insert(schema.pages).values({ id: newId(), key, title: key }).onConflictDoNothing();
  });

  it("inserts valid blocks from the dossier copy, idempotently", async () => {
    await seed(ctx());
    const first = await db.select().from(schema.pageBlocks);
    expect(first.length).toBeGreaterThan(30);
    await seed(ctx());
    expect((await db.select().from(schema.pageBlocks)).length).toBe(first.length);

    for (const key of PAGE_KEYS) {
      const all = await getAllPageBlocks(key);
      const raw = await db.select().from(schema.pageBlocks).innerJoin(schema.pages, eq(schema.pages.id, schema.pageBlocks.pageId)).where(eq(schema.pages.key, key));
      expect(all.blocks.length, `all blocks of ${key} valid`).toBe(raw.length);
    }
    const home = await getPageBlocks("home");
    expect(home.blocks.map((b) => b.type)).toEqual(["hero", "intro", "pillars", "places", "abes_showcase", "events_highlight", "news_highlight", "cta"]);
    const hero = home.blocks[0]!;
    expect(hero.type === "hero" && hero.data.title).toBe("Luoghi che tornano a vivere.");
  });

  it("never overwrites admin edits and honours visibility", async () => {
    const home = await getPageBlocks("home");
    const hero = home.blocks[0]!;
    await db.update(schema.pageBlocks).set({ data: { ...hero.data, title: "Titolo modificato dall'admin" } }).where(eq(schema.pageBlocks.id, hero.id));
    await seed(ctx());
    const after = await getPageBlocks("home");
    expect(after.blocks[0]!.type === "hero" && after.blocks[0]!.data.title).toBe("Titolo modificato dall'admin");

    await db.update(schema.pageBlocks).set({ visible: false }).where(eq(schema.pageBlocks.id, hero.id));
    expect((await getPageBlocks("home")).blocks.some((b) => b.id === hero.id)).toBe(false);
    expect((await getAllPageBlocks("home")).blocks.some((b) => b.id === hero.id)).toBe(true);
  });

  it("skips blocks whose stored data is invalid instead of breaking the page", async () => {
    const news = await getAllPageBlocks("news");
    const target = news.blocks.find((b) => b.type === "section_heading")!;
    await db.update(schema.pageBlocks).set({ data: { nope: true } }).where(eq(schema.pageBlocks.id, target.id));
    const after = await getPageBlocks("news");
    expect(after.blocks.find((b) => b.id === target.id)).toBeUndefined();
    expect(after.blocks.length).toBe(news.blocks.length - 1);
  });

  it("exposes slot lookups and system messages for other modules", async () => {
    const events = await getPageBlocks("eventi");
    expect(findBlock(events, "upcoming", "section_heading")?.data.title).toBe("I prossimi appuntamenti.");
    expect(messageText(events, "state_closed")).toBe("Le iscrizioni a questo evento sono terminate.");
    const careers = await getPageBlocks("lavora-con-noi");
    expect(messageText(careers, "no_openings")).toContain("Non ci sono posizioni aperte");
  });
});

describe("media usage", () => {
  it("reports where an image is referenced (blocks, page og image) so it cannot be deleted while in use", async () => {
    const { getMediaUsage } = await import("@/lib/content/media");
    const mid = newId();
    await db.insert(schema.media).values({ id: mid, path: `2026/10/${mid}.png`, mime: "image/png", size: 10, alt: "x" });
    expect(await getMediaUsage(mid)).toEqual([]);
    const places = (await getAllPageBlocks("home")).blocks.find((b) => b.type === "places")!;
    await db.update(schema.pageBlocks).set({ data: { ...places.data, items: [{ ...(places.data as { items: object[] }).items[0], imageId: mid }] } }).where(eq(schema.pageBlocks.id, places.id));
    expect((await getMediaUsage(mid)).map((u) => u.label)).toEqual(["Pagina «home»"]);
  });
});
