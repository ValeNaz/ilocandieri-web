import { sanitizeHtml, stripHtml } from "@/lib/security";

/**
 * Normalises HTML coming from the browser editor (contenteditable emits <div>/<b>/<i>) and sanitises it with the
 * shared allow-list. Used on WRITE and again on RENDER (defence in depth).
 */
export function cleanNewsBody(html: string): string {
  const normalised = html
    .replace(/<div(\s[^>]*)?>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>")
    .replace(/<b(\s[^>]*)?>/gi, "<strong>")
    .replace(/<\/b>/gi, "</strong>")
    .replace(/<i(\s[^>]*)?>/gi, "<em>")
    .replace(/<\/i>/gi, "</em>");
  return sanitizeHtml(normalised)
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<h[1-6]>(\s|&nbsp;|<br\s*\/?>)*<\/h[1-6]>/gi, "")
    .trim();
}

/** Plain-text length, used to reject "empty" bodies made only of tags. */
export const bodyTextLength = (html: string) => stripHtml(html).length;

/** Excerpt fallback from the body when the editor left the intro empty. */
export function excerptFrom(html: string, max = 180): string {
  const t = stripHtml(html);
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
