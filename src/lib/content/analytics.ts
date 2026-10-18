/** Validation helpers for analytics settings (pure). Empty value = integration disabled. */
export const GA_ID_RE = /^G-[A-Z0-9]{4,20}$/;
export const GSC_TOKEN_RE = /^[A-Za-z0-9_-]{20,120}$/;

/** Returns a safe GA4 measurement id, or "" when missing/invalid (nothing is loaded in that case). */
export function safeGaId(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return GA_ID_RE.test(s) ? s : "";
}

/** Accepts the bare token or the full `<meta ... content="TOKEN">` pasted from Search Console. */
export function extractSearchConsoleToken(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  const m = /content\s*=\s*["']([^"']+)["']/i.exec(s);
  const token = (m?.[1] ?? s).trim();
  return GSC_TOKEN_RE.test(token) ? token : "";
}
