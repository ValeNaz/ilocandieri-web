import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li",
  "h2", "h3", "h4", "a", "img", "figure", "figcaption", "hr", "code", "pre",
];

/**
 * Sanitize rich-text HTML coming from the admin editor (defence in depth: also applied on output of
 * untrusted sources). Only safe tags/attributes; links forced to rel="noopener noreferrer";
 * images limited to same-origin /media/ or https.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const out: Record<string, string> = { ...attribs };
        if (out.target === "_blank" || /^https?:/i.test(out.href ?? "")) out.rel = "noopener noreferrer";
        return { tagName, attribs: out };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
    exclusiveFilter: (frame) => {
      // Drop images with non-https, non-/media/ sources (relative /media/ paths have no scheme).
      if (frame.tag === "img") {
        const src = frame.attribs.src ?? "";
        return !(src.startsWith("/media/") || /^https:\/\//i.test(src));
      }
      return false;
    },
  });
}

/** Strip every tag: plain-text version (for excerpts / email text). */
export function stripHtml(html: string): string {
  return sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

/** Escape text for safe insertion in HTML. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
