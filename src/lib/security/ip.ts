/** Best-effort client IP from proxy headers (deploy behind a trusted reverse proxy). */
export function getClientIp(h: { get(name: string): string | null }): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}
