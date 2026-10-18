/** Display helpers. Original product names are stored untouched; these only affect what is shown. */

const SMALL = new Set(["di", "del", "della", "dei", "delle", "al", "alla", "alle", "ai", "in", "e", "con", "da", "per", "a", "il", "la", "le", "lo", "i", "dal", "dalla"]);
const KEEP_UPPER = new Set(["BIO", "ABES", "IGP", "DOP", "IGT", "DOC", "DOCG", "STG"]);
const UNITS: Record<string, string> = { KG: "kg", GR: "gr", G: "g", ML: "ml", CL: "cl", L: "l", LT: "l" };
const ACCENT: Record<string, string> = { A: "à", E: "è", I: "ì", O: "ò", U: "ù" };

function convertWord(w: string, first: boolean): string {
  const bare = w.replace(/[^\p{L}\p{N}']/gu, "");
  if (!bare || !/\p{L}/u.test(bare)) return w;
  // Only touch fully-uppercase words; mixed-case words are left as the editor wrote them.
  if (bare !== bare.toUpperCase() || bare === bare.toLowerCase()) return w;
  const up = bare.toUpperCase();
  if (KEEP_UPPER.has(up)) return w;
  if (UNITS[up]) return w.replace(bare, UNITS[up]!);
  let lower = bare.toLowerCase();
  // "VARIETA'" -> "varietà"
  const acc = /^(.*)([aeiou])'$/i.exec(lower);
  if (acc) lower = `${acc[1]}${ACCENT[acc[2]!.toUpperCase()]}`;
  const cased = !first && SMALL.has(lower) ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  return w.replace(bare, cased);
}

/** "CAPONATA SICILIANA" -> "Caponata Siciliana"; "PASTA ... - 500 GR" -> "Pasta ... - 500 gr". Mixed-case titles are unchanged. */
export function displayTitle(title: string): string {
  const t = title.trim().replace(/\s+/g, " ");
  const words = t.split(" ");
  let seenFirst = false;
  return words
    .map((w) => {
      const hasLetter = /\p{L}/u.test(w);
      const out = convertWord(w, !seenFirst);
      if (hasLetter) seenFirst = true;
      return out;
    })
    .join(" ");
}

const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
/** Format an amount string/number as euro ("3,50 €"). Non-EUR currencies fall back to Intl. */
export function formatMoney(amount: string | number, currency = "EUR"): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "";
  return currency === "EUR" ? eur.format(n) : new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(n);
}

/** Best-effort category from a product name (editable in admin). */
export function guessCategory(title: string): string | null {
  const t = title.toLowerCase();
  if (/(sostieni|donazion)/.test(t)) return null;
  if (/(ceste|cesta|box|regalo)/.test(t)) return "Idee regalo";
  if (/(pasta|busiate|abbracci|fusilli|penne)/.test(t)) return "Pasta";
  if (/(farina|semolato|semola)/.test(t)) return "Farine";
  if (/(ceci|lenticchie|fagioli|legum)/.test(t)) return "Legumi";
  if (/(sugo|passata|pelati|pomodor)/.test(t)) return "Sughi e passate";
  if (/(caponata|cipollata|paté|pate|crema|conserv|melanzane|peperoncin)/.test(t)) return "Conserve";
  return null;
}
