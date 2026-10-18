"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { actionError, actionOk, type ActionState } from "@/lib/actions";
import { requestPasswordReset } from "@/lib/auth/reset";
import { hashIp } from "@/lib/security/hash";
import { getClientIp } from "@/lib/security/ip";
import { rateLimit } from "@/lib/security/rateLimit";

const GENERIC_OK = "Se l'indirizzo corrisponde a un account, riceverai a breve un'email con le istruzioni. Controlla anche la cartella spam.";

export async function forgotAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email: z.string().trim().email() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Inserisci un indirizzo email valido.", { email: "Indirizzo non valido." });
  const ip = hashIp(getClientIp(await headers()));
  const rl = await rateLimit({ key: `reset:ip:${ip}`, limit: 5, windowMs: 3600_000 });
  const rlEmail = await rateLimit({ key: `reset:email:${hashIp(parsed.data.email.toLowerCase())}`, limit: 3, windowMs: 3600_000 });
  if (!rl.ok || !rlEmail.ok) return actionOk(GENERIC_OK); // do not reveal throttling per account
  await requestPasswordReset(parsed.data.email);
  return actionOk(GENERIC_OK);
}
