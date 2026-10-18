"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { retryEmail } from "@/lib/email";
import { previewTemplate, restoreTemplate, saveTemplate } from "@/lib/email/admin";
import { getDefaultTemplates } from "@/lib/email/templates";
import "@/lib/email/register-all";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";

const keySchema = z.string().regex(/^[a-z0-9_]{1,60}$/);
const bodySchema = z.object({
  key: keySchema,
  subject: z.string().trim().min(3, "Scrivi l'oggetto del messaggio.").max(200, "Oggetto troppo lungo."),
  body: z.string().trim().min(10, "Scrivi il testo del messaggio.").max(8000, "Testo troppo lungo."),
});

export async function saveTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = bodySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  await saveTemplate(parsed.data.key, parsed.data.subject, parsed.data.body);
  await audit(user.id, "email_template_saved", "email_template", parsed.data.key);
  return actionOk("Modello salvato.");
}

export type PreviewState = { subject: string; text: string } | null;

export async function previewTemplateAction(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  await requireAdmin();
  const subject = String(formData.get("subject") ?? "").slice(0, 200);
  const body = String(formData.get("body") ?? "").slice(0, 8000);
  const r = previewTemplate(subject, body);
  return { subject: r.subject, text: r.text };
}

export async function restoreTemplateAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const key = keySchema.safeParse(formData.get("key"));
  if (!key.success || !getDefaultTemplates()[key.data]) {
    await flash("error", "Per questo messaggio non esiste un testo originale da ripristinare.");
    redirect(adminPaths.email);
  }
  await restoreTemplate(key.data);
  await audit(user.id, "email_template_restored", "email_template", key.data);
  await flash("success", "Testo originale ripristinato.");
  redirect(adminPaths.emailTemplate(key.data));
}

export async function retryEmailAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const id = z.string().min(1).max(64).safeParse(formData.get("id"));
  if (!id.success) redirect(adminPaths.emailOutbox);
  const status = await retryEmail(id.data).catch(() => "failed" as const);
  await audit(user.id, "email_retry", "email_outbox", id.data);
  if (status === "sent") await flash("success", "Email inviata.");
  else if (status === "not_configured") await flash("info", "SMTP non configurato: l'email non è stata inviata.");
  else await flash("error", "Invio non riuscito. Riprova più tardi o controlla il server di posta.");
  redirect(adminPaths.emailOutboxItem(id.data));
}
