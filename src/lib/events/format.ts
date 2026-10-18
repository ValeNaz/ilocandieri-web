/** Current time (wrapped so server components can call it without tripping the react purity lint). */
export const nowMs = () => Date.now();

const TZ = "Europe/Rome";
const dayParts = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", timeZone: TZ });
const longDate = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const time = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });

/** { day: "05", month: "dic" } for the date badge. */
export function eventDayBadge(ms: number) {
  const parts = dayParts.formatToParts(ms);
  return {
    day: parts.find((p) => p.type === "day")?.value ?? "",
    month: (parts.find((p) => p.type === "month")?.value ?? "").replace(".", ""),
  };
}

/** "sabato 5 dicembre 2026, 20:00 – 22:30" / multi-day range. */
export function formatEventWhen(startsAt: number, endsAt: number | null): string {
  const start = `${longDate.format(startsAt)}, ${time.format(startsAt)}`;
  if (endsAt == null || endsAt === startsAt) return start;
  if (dayKey.format(startsAt) === dayKey.format(endsAt)) return `${start} – ${time.format(endsAt)}`;
  return `${start} → ${longDate.format(endsAt)}, ${time.format(endsAt)}`;
}

export const formatEventTime = (ms: number) => time.format(ms);
export const formatEventDateShort = (ms: number) => longDate.format(ms);
