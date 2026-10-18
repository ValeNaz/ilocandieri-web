/** Pure rules for news (no DB): visibility and publish dates. */

export type Visibility = { status: "draft" | "published"; publishedAt: number | null };

/** Drafts are NEVER public. Published items are public once their publication date has arrived. */
export function isPubliclyVisible(n: Visibility, now = Date.now()): boolean {
  return n.status === "published" && n.publishedAt !== null && n.publishedAt <= now;
}

/** Date to store for a save: explicit date wins; publishing without date = now; drafts keep any date. */
export function resolvePublishedAt(args: { status: "draft" | "published"; requested: number | null; previous: number | null; now?: number }): number | null {
  const now = args.now ?? Date.now();
  if (args.requested !== null) return args.requested;
  if (args.status === "published") return args.previous ?? now;
  return args.previous;
}

/** "2026-10-18T09:30" (Europe/Rome wall time from <input type=datetime-local>) -> epoch ms, or null. */
export function parseLocalDateTime(v: string): number | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  // Find the UTC instant whose Rome wall clock is y-mo-d h:mi (handles DST by one correction pass).
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = romeOffsetMs(guess);
  const t = guess - offset;
  const offset2 = romeOffsetMs(t);
  return guess - offset2;
}

function romeOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(utcMs);
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - Math.floor(utcMs / 60000) * 60000;
}

export function toLocalDateTime(ms: number | null): string {
  if (ms === null) return "";
  const p = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(ms);
  return p.replace(" ", "T");
}

/** Published but with a publication date in the future (not yet public). */
export function isScheduled(n: Visibility, now = Date.now()): boolean {
  return n.status === "published" && n.publishedAt !== null && n.publishedAt > now;
}
