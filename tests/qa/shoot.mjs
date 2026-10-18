// QA helper (NOT part of the e2e suite): screenshots + layout audit of every public page and the main admin pages
// against the LOCAL qa server. Usage: OUT=<dir> node tests/qa/shoot.mjs
import { chromium } from "@playwright/test";
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";

const base = process.env.QA_URL || "http://localhost:3301";
const out = process.env.OUT || "../qa-screenshots/run";
mkdirSync(out, { recursive: true });
const db = createClient({ url: process.env.DATABASE_URL });
const evSlugs = (await db.execute("select slug from events where status='published' order by starts_at")).rows.map((r) => r.slug);
const newsSlugs = (await db.execute("select slug from news where status='published'")).rows.map((r) => r.slug);
const evIds = (await db.execute("select id from events order by starts_at limit 1")).rows.map((r) => r.id);

const pub = ["/", "/chi-siamo", "/shop", "/eventi", "/news", "/lavora-con-noi", "/contatti", "/privacy", "/cookie-policy", "/pagina-che-non-esiste",
  ...evSlugs.map((s) => `/eventi/${s}`), ...newsSlugs.map((s) => `/news/${s}`)];
const adm = ["/admin", "/admin/home", "/admin/pagine", "/admin/media", "/admin/prodotti", "/admin/news", "/admin/eventi", "/admin/eventi/nuovo", ...evIds.map((i) => `/admin/eventi/${i}`),
  "/admin/iscrizioni", "/admin/candidature", "/admin/messaggi", "/admin/email", "/admin/impostazioni", "/admin/profilo"];

const browser = await chromium.launch();
const sizes = [{ n: "desktop", width: 1440, height: 900, mobile: false }, { n: "mobile", width: 390, height: 844, mobile: true }, { n: "m360", width: 360, height: 740, mobile: true }];
const name = (u) => (u === "/" ? "home" : u.replace(/^\//, "").replace(/\//g, "_"));
const report = [];

async function audit(page) {
  return page.evaluate(() => {
    const h1 = document.querySelectorAll("h1").length;
    const heads = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => +h.tagName[1]);
    let skip = 0; for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skip++;
    const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).length;
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
    const over = document.documentElement.scrollWidth - window.innerWidth;
    const offenders = over > 0 ? [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 3).map((e) => e.tagName + "." + String(e.className).slice(0, 60)) : [];
    const small = [...document.querySelectorAll("a,button")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 24 || r.width < 24) && getComputedStyle(e).display !== "inline"; }).length;
    return { h1, headingSkips: skip, imgNoAlt: noAlt, brokenImgs: broken, hOverflow: over, offenders, tinyTargets: small };
  });
}

for (const s of sizes) {
  const ctx = await browser.newContext({ baseURL: base, viewport: { width: s.width, height: s.height }, isMobile: s.mobile, deviceScaleFactor: s.n === "desktop" ? 1 : 2 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  const run = async (urls, prefix) => {
    for (const u of urls) {
      if (s.n === "m360" && prefix === "adm") continue;
      const res = await page.goto(u, { waitUntil: "networkidle" });
      // scroll through the page so lazy images load before the full-page capture
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(400);
      const a = await audit(page);
      report.push({ size: s.n, url: u, status: res?.status(), ...a });
      if (s.n !== "m360") await page.screenshot({ path: `${out}/${prefix}-${name(u)}-${s.n}.png`, fullPage: true });
    }
  };
  await run(pub, "pub");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Accedi" }).click();
  await page.waitForURL(/\/admin$/);
  await run(adm, "adm");
  await ctx.close();
}
await browser.close();
const bad = report.filter((r) => r.status >= 500 || r.hOverflow > 0 || r.brokenImgs.length || r.imgNoAlt || (r.h1 !== 1 && r.status === 200));
console.log(JSON.stringify(bad, null, 1));
console.log(`audited ${report.length} page views, ${bad.length} with issues; shots in ${out}`);
