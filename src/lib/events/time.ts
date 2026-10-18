/** Europe/Rome <-> epoch ms helpers for `<input type="datetime-local">` values (no tz in the string). */
const TZ = "Europe/Rome";
const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function wallClock(ms: number) {
  const o: Record<string, number> = {};
  for (const p of parts.formatToParts(ms)) if (p.type !== "literal") o[p.type] = Number(p.value);
  return o as { year: number; month: number; day: number; hour: number; minute: number };
}

/** Offset (minutes, Rome ahead of UTC) at the given instant. */
function offsetMinutes(ms: number): number {
  const w = wallClock(ms);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
  return Math.round((asUtc - Math.floor(ms / 60000) * 60000) / 60000);
}

/** epoch ms -> "YYYY-MM-DDTHH:mm" in Rome local time. */
export function msToRomeLocal(ms: number): string {
  const w = wallClock(ms);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(w.year, 4)}-${p(w.month)}-${p(w.day)}T${p(w.hour)}:${p(w.minute)}`;
}

/** "YYYY-MM-DDTHH:mm" (Rome local) -> epoch ms, or null when malformed. */
export function romeLocalToMs(value: string | null | undefined): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec((value ?? "").trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const off1 = offsetMinutes(guess);
  let t = guess - off1 * 60000;
  const off2 = offsetMinutes(t);
  if (off2 !== off1) t = guess - off2 * 60000;
  // Reject impossible dates (e.g. 31 February) that Date.UTC silently rolls over.
  const back = new Date(guess);
  if (back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return t;
}
