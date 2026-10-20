// Contrast audit (design QA): SVG shapes that vanish on (or weakly contrast with) what is right behind them, and text contrast.
// node scripts/contrast-audit.mjs <outdir> [width] [/path1,/path2]  (dev server on :3101). Writes report-<width>.json.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const out = process.argv[2]; const width = +(process.argv[3] || 1440); const only = process.argv[4];
mkdirSync(out, { recursive: true });
const pages = ["/", "/chi-siamo", "/accoglienza", "/luoghi", "/luoghi/giardino-delle-arance", "/luoghi/campo-polivalente", "/storia", "/tradizione", "/abes", "/lavora-con-noi", "/eventi", "/news", "/shop", "/contatti", "/crediti", "/privacy", "/cookie-policy", "/pagina-che-non-esiste"];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
const report = [];
for (const path of only ? only.split(",") : pages) {
  const p = await ctx.newPage();
  await p.goto("http://localhost:3101" + path, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: "*{pointer-events:auto!important} [data-nextjs-toast],nextjs-portal{display:none!important}" });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(60); }
  const found = await p.evaluate(async () => {
    const NAMES = { "rgb(241, 104, 66)": "orange", "rgb(241, 204, 38)": "yellow", "rgb(10, 125, 95)": "green", "rgb(255, 255, 255)": "white" };
    const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, bb] = m.slice(0, 3).map((v) => { v = +v / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bb; };
    const ratio = (a, c) => { const x = lum(a), y = lum(c); if (x == null || y == null) return 21; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const name = (c) => NAMES[c] ?? (lum(c) != null && lum(c) < 0.05 ? "ink" : c);
    const SHAPES = "path,circle,rect,ellipse,polygon";
    const isShape = (e) => e instanceof SVGGeometryElement;
    const fillOf = (e) => { const cs = getComputedStyle(e); if (cs.fill === "none" || cs.fill.startsWith("url") || cs.visibility === "hidden" || +cs.fillOpacity === 0) return null; return cs.fill; };
    const objectOf = (e) => { let n = e, last = null; while (n && n.tagName !== "svg") { if (n.tagName === "g" && n.hasAttribute("transform")) last = n; n = n.parentElement; } return last; };
    const bgOf = (el) => { for (let n = el; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c; } return "rgb(255, 255, 255)"; };
    const below = (x, y, self) => {
      const list = document.elementsFromPoint(x, y); const i = list.indexOf(self); if (i < 0) return null;
      // occluded by something opaque above? skip the point
      for (const a of list.slice(0, i)) { if (isShape(a) && fillOf(a) && objectOf(a) !== objectOf(self)) return null; }
      for (const e of list.slice(i + 1)) {
        if (isShape(e)) { const f = fillOf(e); if (!f) continue; if (objectOf(e) && objectOf(e) === objectOf(self)) return "same-object"; return f; }
        if (!(e instanceof SVGElement)) { const c = getComputedStyle(e).backgroundColor; if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c; if (e === document.body || e === document.documentElement) return bgOf(e); continue; }
      }
      return bgOf(self.ownerSVGElement);
    };
    const res = [];
    for (const el of document.querySelectorAll(SHAPES)) {
      if (el.closest("header,[data-site-header],footer")) continue;
      const fill = fillOf(el); if (!fill) continue;
      if (+getComputedStyle(el).opacity < 0.5) continue;
      const r = el.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
      const y0 = r.top + scrollY; if (r.width * r.height > innerWidth * 900 * 0.5) continue; // hills/backgrounds
      const svg = el.ownerSVGElement; if (!svg) continue;
      const counts = {}; let n = 0;
      scrollTo(0, Math.max(0, y0 - 300));
      const rr = el.getBoundingClientRect(); const m = el.getScreenCTM(); if (!m) continue; const inv = m.inverse();
      for (let i = 1; i < 6; i++) for (let j = 1; j < 6; j++) {
        const x = rr.left + (rr.width * i) / 6, y = rr.top + (rr.height * j) / 6;
        if (y < 0 || y > innerHeight) continue;
        const pt = new DOMPoint(x, y).matrixTransform(inv);
        let inside = false; try { inside = el.isPointInFill(pt); } catch {}
        if (!inside) continue;
        const bg = below(x, y, el); if (!bg || bg === "same-object") continue;
        const k = name(bg); counts[k] = (counts[k] || 0) + 1; n++;
      }
      if (n < 3) continue;
      const f = name(fill);
      const [top, c] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      const share = c / n;
      if (share < 0.6) continue;
      const bgc = Object.entries(NAMES).find(([, v]) => v === top)?.[0] ?? (top === "ink" ? "rgb(10,20,18)" : top);
      const cr = ratio(fill, bgc);
      const small = rr.width * rr.height < 3600;
      const kind = f === top ? "SAME" : cr < 1.6 && small ? "WEAK" : null;
      if (!kind) continue;
      const sec = el.closest("section,[id]");
      const scene = el.closest("[aria-label],[role=img]")?.getAttribute("aria-label")?.slice(0, 70) || el.ownerSVGElement?.getAttribute("viewBox");
      const chain = []; for (let n = el.parentElement; n && n.tagName !== "svg" && chain.length < 5; n = n.parentElement) chain.push(n.tagName + (n.getAttribute("class") ? "." + n.getAttribute("class").split(" ").join(".") : "") + (n.getAttribute("transform") ? `[${n.getAttribute("transform").slice(0, 30)}]` : ""));
      const html = el.outerHTML.slice(0, 160);
      res.push({ kind, fill: f, on: top, ratio: +cr.toFixed(2), share: +share.toFixed(2), tag: el.tagName, cls: String(el.getAttribute("class") || ""), d: (el.getAttribute("d") || "").slice(0, 50), section: sec?.id || sec?.className?.slice?.(0, 40) || "", scene, chain: chain.join(" < "), html, x: Math.round(rr.left + rr.width / 2), y: Math.round(y0 + rr.height / 2), w: Math.round(rr.width), h: Math.round(rr.height) });
    }
    // text contrast
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      if (el.closest("svg,[aria-hidden=true],nextjs-portal,script,style")) continue;
      const cs = getComputedStyle(el); if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
      const rr = el.getBoundingClientRect(); if (!rr.width || !rr.height) continue;
      // background: element under the text box centre that is not the text itself
      scrollTo(0, Math.max(0, rr.top + scrollY - 300)); const r2 = el.getBoundingClientRect();
      const list = document.elementsFromPoint(r2.left + Math.min(8, r2.width / 2), r2.top + r2.height / 2);
      let bg = null;
      for (const e of list) { if (e === el || el.contains(e)) { const c = getComputedStyle(e).backgroundColor; if (e !== el && c !== "rgba(0, 0, 0, 0)") { bg = c; break; } if (e === el && c !== "rgba(0, 0, 0, 0)") { bg = c; break; } continue; } if (isShape(e) && fillOf(e)) { bg = fillOf(e); break; } if (!(e instanceof SVGElement)) { bg = bgOf(e); break; } }
      if (!bg) continue;
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700; const large = size >= 24 || (size >= 18.66 && bold);
      const cr = ratio(cs.color, bg); const need = large ? 3 : 4.5;
      if (cr < need) texts.push({ text: t.textContent.trim().slice(0, 40), color: name(cs.color), bg: name(bg), ratio: +cr.toFixed(2), need, size, y: Math.round(r2.top + scrollY) });
    }
    return { shapes: res, texts };
  });
  report.push({ path, ...found });
  console.log(path, "shapes:", found.shapes.length, "texts:", found.texts.length);
  await p.close();
}
writeFileSync(`${out}/report-${width}.json`, JSON.stringify(report, null, 1));
await b.close();
