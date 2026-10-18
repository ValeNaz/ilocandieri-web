import { describe, expect, it } from "vitest";
import { isSafeHref, parseBlockData, blockSchemas, BLOCK_TYPES, BLOCK_DEFS } from "@/lib/content/blocks";
import { parseBlockForm } from "@/lib/content/form";
import { renderRichHtml } from "@/lib/content/rich";
import { extractSearchConsoleToken, safeGaId } from "@/lib/content/analytics";
import { whatsappUrl } from "@/lib/content/contact-info";

describe("CTA href validation", () => {
  it.each(["/", "/chi-siamo", "/#luoghi", "/eventi/festa-del-raccolto", "/news/una-storia", "https://abes.bio/collections/all", "mailto:info@example.org", "tel:+393318586827"])("accepts %s", (h) => {
    expect(isSafeHref(h)).toBe(true);
  });
  it.each(["javascript:alert(1)", "http://example.org", "//evil.example", "/admin", "/admin/login", "https://", "https://user:pw@example.org", "data:text/html,x", "/chi-siamo#a b", "mailto:nope", "tel:abc", "", "/eventi/Bad Slug", "https://exa mple.org"])("rejects %s", (h) => {
    expect(isSafeHref(h)).toBe(false);
  });
});

describe("block schemas", () => {
  it("every block type has a definition and editable fields only for known keys", () => {
    for (const t of BLOCK_TYPES) {
      expect(BLOCK_DEFS[t]).toBeDefined();
      const shape = Object.keys(blockSchemas[t].shape);
      for (const f of BLOCK_DEFS[t].fields) expect(shape).toContain(f.name);
    }
  });
  it("hero requires a title and validates CTAs", () => {
    expect(parseBlockData("hero", { title: "" }).success).toBe(false);
    expect(parseBlockData("hero", { title: "Ciao", primaryCta: { label: "Vai", href: "javascript:x" } }).success).toBe(false);
    const ok = parseBlockData("hero", { title: "Ciao", primaryCta: { label: "Vai", href: "/chi-siamo" } });
    expect(ok.success).toBe(true);
  });
  it("limits are enforced", () => {
    expect(parseBlockData("events_highlight", { title: "t", limit: 99 }).success).toBe(false);
    expect(parseBlockData("abes_showcase", { title: "t", ctaLabel: "a", cardCtaLabel: "b", limit: 0 }).success).toBe(false);
    expect(parseBlockData("pillars", { title: "t", items: [] }).success).toBe(false);
  });
  it("slot must be a safe identifier", () => {
    expect(parseBlockData("cta", { title: "t", slot: "ok-slot_1" }).success).toBe(true);
    expect(parseBlockData("cta", { title: "t", slot: "bad slot<" }).success).toBe(false);
  });
});

describe("block form parsing (server side source of truth)", () => {
  it("parses items, cta and keeps slot/adminNote from the stored data", () => {
    const fd = new FormData();
    fd.set("title", "  Titolo ");
    fd.set("intro", "Intro");
    fd.set("eyebrow", "");
    fd.set("items.0.title", "Uno"); fd.set("items.0.text", "a");
    fd.set("items.3.title", "Due"); fd.set("items.3.text", "b");
    fd.set("items.5.title", ""); fd.set("items.5.text", "");
    const r = parseBlockForm("pillars", fd, { slot: "cosa", adminNote: "nota" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as { title: string }).title).toBe("Titolo");
      expect((r.data as { items: { title: string }[] }).items.map((i) => i.title)).toEqual(["Uno", "Due"]);
      expect(r.data.slot).toBe("cosa");
    }
  });
  it("collapses an empty CTA to null and rejects a bad one with field errors", () => {
    const fd = new FormData();
    fd.set("title", "T"); fd.set("text", ""); fd.set("eyebrow", ""); fd.set("imageId", ""); fd.set("size", "standard");
    fd.set("primaryCta.label", ""); fd.set("primaryCta.href", "");
    fd.set("secondaryCta.label", "Vai"); fd.set("secondaryCta.href", "javascript:alert(1)");
    const r = parseBlockForm("hero", fd);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path.join(".") === "secondaryCta.href")).toBe(true);
  });
  it("sanitizes rich text on save", () => {
    const fd = new FormData();
    fd.set("title", "Privacy"); fd.set("eyebrow", "");
    fd.set("html", '<p onclick="x()">ok</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>');
    const r = parseBlockForm("rich_text", fd);
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as { html: string }).html).not.toMatch(/script|onclick|javascript:/i);
      expect((r.data as { html: string }).html).toContain("ok");
    }
  });
});

describe("rich text rendering", () => {
  it("replaces tokens with escaped values and strips dangerous markup", () => {
    const out = renderRichHtml('<p>{{org.name}}</p><img src="javascript:x" onerror="x()"><script>1</script>', { org: { name: '<b>A&B</b>' } });
    expect(out).toContain("&lt;b&gt;A&amp;B&lt;/b&gt;");
    expect(out).not.toMatch(/<script|onerror|javascript:/i);
  });
});

describe("analytics settings helpers", () => {
  it("accepts only well-formed GA4 ids", () => {
    expect(safeGaId("G-ABCD1234")).toBe("G-ABCD1234");
    expect(safeGaId("UA-123-1")).toBe("");
    expect(safeGaId("G-1'); alert(1);//")).toBe("");
    expect(safeGaId("")).toBe("");
  });
  it("extracts the Search Console token from a pasted meta tag", () => {
    const token = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEF";
    expect(extractSearchConsoleToken(`<meta name="google-site-verification" content="${token}" />`)).toBe(token);
    expect(extractSearchConsoleToken(token)).toBe(token);
    expect(extractSearchConsoleToken('"><script>')).toBe("");
  });
  it("builds wa.me links only from plausible numbers", () => {
    expect(whatsappUrl("+39 331 8586827")).toBe("https://wa.me/393318586827");
    expect(whatsappUrl("abc")).toBeNull();
    expect(whatsappUrl("")).toBeNull();
  });
});
