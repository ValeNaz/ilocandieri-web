"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionError, zodFieldErrors, type ActionState } from "@/lib/actions";
import { resetPasswordWithToken } from "@/lib/auth/reset";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";

const schemaReset = z
  .object({ token: z.string().min(10), password: z.string().min(1), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Le due password non coincidono." });

export async function resetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schemaReset.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  const res = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!res.ok) return actionError(res.error, { password: res.error });
  await flash("success", "Password aggiornata. Ora puoi accedere.");
  redirect(adminPaths.login);
}
