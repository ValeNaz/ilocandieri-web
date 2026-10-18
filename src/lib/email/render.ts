import { escapeHtml } from "@/lib/security/sanitize";

export type TemplateContext = { [key: string]: unknown };

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function lookup(ctx: TemplateContext, path: string): string {
  let cur: unknown = ctx;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[part];
  }
  if (cur == null) return "";
  if (cur instanceof Date) return cur.toISOString();
  return String(cur);
}

/** Replace `{{a.b}}` placeholders. Missing values become "". `escape` HTML-escapes values. */
export function renderPlaceholders(template: string, ctx: TemplateContext, escape = false): string {
  return template.replace(PLACEHOLDER, (_m, p: string) => {
    const v = lookup(ctx, p);
    return escape ? escapeHtml(v) : v;
  });
}

/** Placeholders referenced by a template (for admin help / validation). */
export function listPlaceholders(template: string): string[] {
  return [...new Set([...template.matchAll(PLACEHOLDER)].map((m) => m[1]!))];
}

export type RenderedEmail = { subject: string; text: string; html: string };

/**
 * Render a template (plain text body with placeholders) to subject/text/html.
 * Values are HTML-escaped in the html part; the body text itself is escaped too (templates are plain text).
 */
export function renderEmail(tpl: { subject: string; body: string }, ctx: TemplateContext): RenderedEmail {
  const subject = renderPlaceholders(tpl.subject, ctx).replace(/[\r\n]+/g, " ").trim();
  const text = renderPlaceholders(tpl.body, ctx);
  const html = renderPlaceholders(escapeHtmlKeepingPlaceholders(tpl.body), ctx, true)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 1em;line-height:1.55">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return {
    subject,
    text,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1d1a16">${html}</div>`,
  };
}

// Escape literal template text but leave `{{...}}` intact so placeholders still resolve.
function escapeHtmlKeepingPlaceholders(s: string): string {
  const parts = s.split(/(\{\{\s*[a-zA-Z0-9_.]+\s*\}\})/g);
  return parts.map((p) => (/^\{\{.*\}\}$/.test(p) ? p : escapeHtml(p))).join("");
}
