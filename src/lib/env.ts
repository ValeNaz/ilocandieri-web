/** Centralised, lazy environment access. Never import secrets into client components. */

export function getAppSecret(): string {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_SECRET must be set (min 16 chars) in production.");
  }
  return "dev-only-insecure-secret-change-me";
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export const isProd = () => process.env.NODE_ENV === "production";

export function smtpConfig() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  };
}
