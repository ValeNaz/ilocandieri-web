import nodemailer from "nodemailer";
import { smtpConfig } from "@/lib/env";

export type MailMessage = { to: string; subject: string; text: string; html?: string | null };
export type MailTransport = { sendMail(msg: { from: string; to: string; subject: string; text: string; html?: string }): Promise<unknown> };

let override: MailTransport | null = null;
let cached: { key: string; transport: MailTransport } | null = null;

/** Test hook: inject a fake transport (pass null to restore). Treated as "configured". */
export function setMailTransport(t: MailTransport | null) {
  override = t;
}

export function isEmailConfigured(): boolean {
  return override !== null || smtpConfig() !== null;
}

function getTransport(): { transport: MailTransport; from: string } | null {
  if (override) return { transport: override, from: process.env.SMTP_FROM || "test@example.test" };
  const cfg = smtpConfig();
  if (!cfg) return null;
  const key = JSON.stringify(cfg);
  if (!cached || cached.key !== key) {
    cached = {
      key,
      transport: nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
      }),
    };
  }
  return { transport: cached!.transport, from: cfg.from };
}

/** Low-level send. Returns null when SMTP is not configured. Throws on SMTP errors. */
export async function sendMail(msg: MailMessage): Promise<{ sent: true } | { sent: false; reason: "not_configured" }> {
  const t = getTransport();
  if (!t) return { sent: false, reason: "not_configured" };
  await t.transport.sendMail({ ...msg, from: t.from, html: msg.html ?? undefined });
  return { sent: true };
}
