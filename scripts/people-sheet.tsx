/**
 * Character sheet of the illustration system's people (src/components/public/art/parts.tsx): every pose in four
 * variants plus the things they carry, drawn large on white. For checking the figure after touching parts.tsx.
 * Usage: npx tsx scripts/people-sheet.tsx out.png   (writes out.html beside it; the png needs playwright)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import { Person, type Hair, type Item, type Pose } from "../src/components/public/art/parts";

type Props = Parameters<typeof Person>[0];
const poses: Pose[] = ["stand", "walk", "cheer", "carry", "sit", "sit-table", "reach", "place", "present", "point", "wave", "kick", "bend", "climb", "dig"];
const hairs: Hair[] = ["short", "bun", "long", "curly", "cap", "none"];
const colors = ["orange", "green", "yellow"] as const;
const itemPoses: Pose[] = ["carry", "carry", "walk", "walk", "dig", "stand", "walk", "carry", "stand", "walk", "carry", "walk", "stand", "stand", "walk"];
const items: Item[] = ["crate", "basket", "suitcase", "book", "spade", "none", "suitcase", "crate", "none", "book", "basket", "suitcase", "none", "none", "book"];
const rows: { label: string; props: (i: number) => Props }[] = [
  { label: "regular", props: (i) => ({ pose: poses[i], color: colors[i % 3], build: "regular", hair: hairs[i % 6] }) },
  { label: "slim, dress", props: (i) => ({ pose: poses[i], color: colors[(i + 1) % 3], build: "slim", outfit: "dress", hair: hairs[(i + 2) % 6] }) },
  { label: "broad, apron", props: (i) => ({ pose: poses[i], color: colors[(i + 2) % 3], build: "broad", outfit: "apron", hair: hairs[(i + 4) % 6] }) },
  { label: "kid", props: (i) => ({ pose: poses[i], color: colors[(i + 1) % 3], kid: true, hair: hairs[(i + 1) % 6] }) },
  { label: "things carried", props: (i) => ({ pose: itemPoses[i], item: items[i], color: colors[i % 3], hair: hairs[i % 6], flip: i % 2 === 1 }) },
];
const cw = 120, rh = 150, w = poses.length * cw, h = rows.length * rh;
const svg = renderToStaticMarkup(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
    {rows.map((r, ri) => (
      <g key={ri} transform={`translate(0 ${ri * rh})`}>
        <text x="8" y="18" fontSize="11" fontFamily="sans-serif" fill="#333">{r.label}</text>
        {poses.map((p, i) => (
          <g key={p} transform={`translate(${i * cw + cw / 2} ${rh - 14})`}>
            <line x1="-45" y1="0" x2="45" y2="0" stroke="#ccc" />
            <text y="12" fontSize="9" fontFamily="sans-serif" fill="#888" textAnchor="middle">{ri === 4 ? items[i] : p}</text>
            <Person {...r.props(i)} />
          </g>
        ))}
      </g>
    ))}
  </svg>,
);
const out = resolve(process.argv[2] ?? "people-sheet.png");
const html = out.replace(/\.png$/, "") + ".html";
writeFileSync(html, `<!doctype html><html><head><style>:root{--c-orange:#f16842;--c-yellow:#f1cc26;--c-green:#0a7d5f;--c-white:#fff;--c-ink:oklch(19% 0.04 168)}body{margin:0;background:#fff}</style></head><body>${svg}</body></html>`);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
await page.goto(`file://${html}`);
await page.screenshot({ path: out });
await browser.close();
console.log(`${html}\n${out}`);
