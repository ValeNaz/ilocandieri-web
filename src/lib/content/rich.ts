import { renderPlaceholders } from "@/lib/email/render";
import { sanitizeHtml } from "@/lib/security";

/** Substitute {{org.*}} / {{retention.*}} / {{site.url}} tokens (values HTML-escaped), then sanitize the result. */
export function renderRichHtml(html: string, ctx: Record<string, unknown>): string {
  return sanitizeHtml(renderPlaceholders(html, ctx, true));
}

/** Sanitize rich text coming from the editor before saving it (same rules as on output). */
export const cleanRichHtml = (html: string) => sanitizeHtml(html);
