import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const color = (name: string): string => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`token ${name} not found`);
  return m[1]!;
};
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

// [foreground, background, minimum ratio] - WCAG AA: 4.5 normal text, 3 for large text / UI.
const PAIRS: [string, string, number][] = [
  ["ink", "paper", 4.5], ["ink", "card", 4.5], ["ink", "paper-deep", 4.5], ["ink-soft", "paper", 4.5], ["ink-soft", "card", 4.5], ["ink-soft", "paper-deep", 4.5],
  ["white", "terracotta", 4.5], ["white", "terracotta-deep", 4.5], ["terracotta-deep", "paper", 4.5], ["terracotta-deep", "terracotta-soft", 4.5], ["terracotta", "paper", 4.5],
  ["ink", "terracotta-soft", 4.5], ["ink", "sage-soft", 4.5], ["olive-deep", "sage-soft", 4.5], ["white", "olive", 4.5],
  ["paper", "ink", 4.5], ["sage", "ink", 4.5], ["arancio", "ink", 3], ["white", "danger", 4.5], ["danger", "danger-soft", 4.5], ["danger", "card", 4.5],
  ["success", "success-soft", 4.5], ["warning", "warning-soft", 4.5], ["ink", "success-soft", 4.5], ["ink", "danger-soft", 4.5],
  ["paper", "olive-deep", 4.5], ["sage", "olive-deep", 4.5], ["ink", "paper", 4.5], ["terracotta-deep", "card", 4.5], ["terracotta-deep", "paper-deep", 4.5], ["terracotta-deep", "sage-soft", 4.5], // CONTENT module blocks
  ["line-strong", "paper", 3], ["line-strong", "card", 3], // UI component boundaries (WCAG 1.4.11)
];

describe("design tokens - WCAG AA contrast", () => {
  for (const [fg, bg, min] of PAIRS) {
    it(`${fg} on ${bg} >= ${min}`, () => {
      const f = fg === "white" ? "#ffffff" : color(fg);
      expect(ratio(f, color(bg))).toBeGreaterThanOrEqual(min);
    });
  }
});
