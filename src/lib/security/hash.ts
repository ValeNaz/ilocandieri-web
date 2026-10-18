import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAppSecret } from "@/lib/env";

export const sha256Hex = (v: string) => createHash("sha256").update(v).digest("hex");

export const hmacHex = (v: string) => createHmac("sha256", getAppSecret()).update(v).digest("hex");

/** Random URL-safe token (default 32 bytes). */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * One-way keyed hash of an IP address: usable for rate limiting / abuse detection
 * without storing the raw IP. Truncated to 32 hex chars.
 */
export function hashIp(ip: string | null | undefined): string {
  return hmacHex(`ip:${(ip || "unknown").trim().toLowerCase()}`).slice(0, 32);
}
