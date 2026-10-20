#!/usr/bin/env node
// Downloads the PROVISIONAL stock photos (Pexels licence) for the media slots into public/foto/provvisorie/<slot>.webp.
// They stand in until the real photos arrive (see src/content/stockPhotos.ts). Skips existing files unless --force.
// Usage: node scripts/fetch-stock-photos.mjs [--force] [--w 2000]
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const IDS = {
  "home-giardino": 11606369, "home-campo": 10855503, "chi-siamo-squadra": 12026165, "chi-siamo-lavoro": 7728082,
  "storia-prima": 3714192, "storia-dopo": 9769288, "accoglienza-casa": 2092058, "lavora-squadra": 4920234,
  "giardino-casolare": 6798463, "giardino-agrumeto": 39272521, "giardino-laboratorio": 33984942, "campo-panoramica": 34481547,
  "campo-attivita": 6203637, "tradizione-grano": 9361507, "tradizione-pane": 30632207, "abes-raccolta": 14766935,
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const w = Number(args[args.indexOf("--w") + 1]) || 2000;
const outDir = path.resolve("public/foto/provvisorie");
await mkdir(outDir, { recursive: true });
const exists = (p) => access(p).then(() => true, () => false);

// two widths: <slot>.webp (large) and <slot>-1000.webp (cards, phones), used as srcset by RealMedia
for (const [slot, id] of Object.entries(IDS)) {
  for (const [name, width] of [[slot, w], [`${slot}-1000`, 1000]]) {
    const file = path.join(outDir, `${name}.webp`);
    if (!force && (await exists(file))) { console.log(`= ${name}`); continue; }
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=${width}`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`x ${name}: HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(file, buf);
    console.log(`+ ${name} ${(buf.length / 1024).toFixed(0)} KB`);
  }
}
