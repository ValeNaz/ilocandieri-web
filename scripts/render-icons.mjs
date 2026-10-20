// Renders the original logo to the PNG icons (apple-icon 180, icon 32) and a 512px PNG used by the OG images. Run: node scripts/render-icons.mjs
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
const svg = readFileSync("public/brand/logo-originale.svg", "utf8");
const b = await chromium.launch();
const shot = async (size, pad, out, bg = "#ffffff") => {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:${bg}"><div style="width:${size}px;height:${size}px;display:grid;place-items:center"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" style="width:${size - pad * 2}px;height:${size - pad * 2}px"></div></body></html>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, omitBackground: bg === "transparent" });
  await p.close();
};
await shot(180, 18, "src/app/apple-icon.png");
await shot(32, 1, "src/app/icon.png", "transparent");
await shot(512, 0, "public/brand/logo-512.png", "transparent");
await b.close();
