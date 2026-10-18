"use server";

import { headers } from "next/headers";
import { submitContact } from "@/lib/content/contact";
import { getClientIp } from "@/lib/security";

export type ContactState = { ok: boolean; message: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | null;

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const res = await submitContact(formData, getClientIp(await headers()));
  if (res.ok) return res;
  // React resets uncontrolled forms after an action: echo the (non-sensitive) values back so people do not retype.
  const values = Object.fromEntries(["name", "email", "subject", "message"].map((k) => [k, String(formData.get(k) ?? "").slice(0, 3000)]));
  return { ...res, values };
}
