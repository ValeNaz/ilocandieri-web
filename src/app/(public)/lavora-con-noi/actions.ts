"use server";

import { headers } from "next/headers";
import { getClientIp } from "@/lib/security";
import { processApplication } from "@/lib/careers/submit";

export type ApplyState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | null;

export async function submitApplicationAction(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const res = await processApplication(formData, { ip: getClientIp(await headers()) });
  if (res.ok) return { ok: true };
  return { ok: false, message: res.message, fieldErrors: res.fieldErrors };
}
