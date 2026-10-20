import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

/** Linear sRGB (clipped to the gamut) from OKLCH. */
function oklchToLinear(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const srgbToLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** Relative luminance of a token declared as #rrggbb or oklch(L% C H). */
function luminance(name: string): number {
  if (name === "white") return 1;
  // Public room colours are declared as --c-<name>; they are addressed here as "c-<name>".
  const prop = name.startsWith("c-") ? `--${name}` : `--color-${name}`;
  const re = new RegExp(`${prop}:\\s*(?:(#[0-9a-fA-F]{6})|oklch\\(\\s*([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\s*\\))`);
  const m = re.exec(css);
  if (!m) throw new Error(`token ${name} not found`);
  const [r, g, b] = m[1]
    ? [1, 3, 5].map((i) => srgbToLinear(parseInt(m[1]!.slice(i, i + 2), 16) / 255))
    : oklchToLinear(Number(m[2]) / 100, Number(m[3]), Number(m[4]));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

// [foreground, background, minimum ratio] - WCAG AA: 4.5 normal text, 3 for large text / UI.
const PAIRS: [string, string, number][] = [
  // Public rooms (DESIGN.md colour law): text on white / orange / yellow / green fields
  ["c-ink", "c-white", 4.5], ["c-ink", "c-orange", 4.5], ["c-ink", "c-yellow", 4.5], ["c-white", "c-green", 4.5], ["c-green", "c-white", 4.5],
  ["c-yellow", "c-green", 3], ["c-orange", "c-white", 3], ["c-white", "c-ink", 4.5],
  // Body text on every paper surface
  ["ink", "paper", 4.5], ["ink", "card", 4.5], ["ink", "paper-deep", 4.5], ["ink-soft", "paper", 4.5], ["ink-soft", "card", 4.5], ["ink-soft", "paper-deep", 4.5],
  ["ink", "kraft", 4.5], ["ink", "limone", 4.5], ["ink", "sage-soft", 4.5], ["ink", "terracotta-soft", 4.5], ["ink", "cobalto-soft", 4.5], ["ink", "arancio", 4.5],
  // Buttons and the olive closing band (cream or white text on a color)
  ["paper", "terracotta", 4.5], ["white", "terracotta", 4.5], ["paper", "terracotta-deep", 4.5], ["white", "terracotta-deep", 4.5],
  ["paper", "cobalto", 4.5], ["white", "cobalto", 4.5], ["paper", "cobalto-deep", 4.5], ["white", "olive", 4.5], ["paper", "olive", 4.5], ["paper", "olive-deep", 4.5],
  ["paper", "ink", 4.5], ["limone", "ink", 4.5], ["limone", "cobalto", 4.5], ["limone", "cobalto-deep", 4.5], ["limone", "olive-deep", 4.5], ["sage", "olive-deep", 4.5], ["sage", "ink", 4.5],
  ["arancio", "ink", 3], ["arancio", "cobalto-deep", 3],
  // Accent text on paper
  ["terracotta", "paper", 4.5], ["terracotta", "card", 4.5], ["terracotta-deep", "paper", 4.5], ["terracotta-deep", "card", 4.5], ["terracotta-deep", "paper-deep", 4.5],
  ["terracotta-deep", "terracotta-soft", 4.5], ["terracotta-deep", "sage-soft", 4.5], ["terracotta-deep", "limone", 4.5], ["terracotta-deep", "kraft", 4.5],
  ["cobalto", "paper", 4.5], ["cobalto", "card", 4.5], ["cobalto", "paper-deep", 4.5], ["cobalto", "limone", 4.5], ["cobalto", "kraft", 4.5],
  ["olive-deep", "sage-soft", 4.5], ["olive-deep", "paper", 4.5], ["olive-deep", "limone", 4.5],
  // Status colours
  ["white", "danger", 4.5], ["danger", "danger-soft", 4.5], ["danger", "card", 4.5], ["success", "success-soft", 4.5], ["warning", "warning-soft", 4.5],
  ["ink", "success-soft", 4.5], ["ink", "danger-soft", 4.5],
  // Night field and citrus fills
  ["paper", "night", 4.5], ["night-soft", "night", 4.5], ["ink", "citrus", 4.5], ["ink-soft", "paper-deep", 4.5],
  ["brand-yellow", "night", 3], ["ink", "brand-yellow", 4.5], ["paper", "brand-green", 4.5],
  // UI component boundaries (WCAG 1.4.11)
  ["line-strong", "paper", 3], ["line-strong", "card", 3],
];

describe("design tokens - WCAG AA contrast", () => {
  for (const [fg, bg, min] of PAIRS) {
    it(`${fg} on ${bg} >= ${min}`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
    });
  }
});
