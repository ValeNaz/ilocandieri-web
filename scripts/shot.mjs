// Design QA helper: viewport screenshots while scrolling a page of the running dev server (scroll-driven animations need real scroll).
// Usage: node scripts/shot.mjs <path> [--w 1440] [--h 900] [--every 0.8] [--max 14] [--out DIR] [--reduced] [--url http://localhost:3000]
// Prints the file paths; open them with the Read tool. Also reports horizontal overflow and console errors.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const a = process.argv.slice(2);
const path = a[0] && !a[0].startsWith("--") ? a[0] : "/";
const opt = (k, d) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : d; };
const w = +opt("w", 1440), h = +opt("h", 900), every = +opt("every", 0.8), max = +opt("max", 14);
const base = opt("url", "http://localhost:3000");
const out = opt("out", `/tmp/shots/${path.replace(/\W+/g, "_") || "home"}`);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700, reducedMotion: a.includes("--reduced") ? "reduce" : "no-preference" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await page.waitForTimeout(1800);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const files = [];
for (let i = 0, y = 0; i < max && y < total; i++, y += Math.round(h * every)) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  const f = `${out}/${String(i).padStart(2, "0")}.png`;
  await page.screenshot({ path: f });
  files.push(f);
}
const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(files.join("\n"));
console.log(`page height ${total}px · scrollWidth ${overflow.sw} vs ${overflow.cw}${overflow.sw > overflow.cw ? "  <-- HORIZONTAL OVERFLOW" : ""}`);
if (errors.length) console.log("console errors:\n" + [...new Set(errors)].join("\n"));
await browser.close();
