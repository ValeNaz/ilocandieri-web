export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** URL-safe slug (Italian accents folded). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
const dateTimeFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
export const formatDate = (ms: number | Date) => dateFmt.format(ms);
export const formatDateTime = (ms: number | Date) => dateTimeFmt.format(ms);
