"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { db, newId, schema } from "@/lib/db";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";
import { getSetting, setSetting } from "@/lib/settings";
import { slugify } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/lib/careers/constants";
import { deleteApplication, isRetentionSet, purgeApplicationsOlderThan, setApplicationStatus } from "@/lib/careers/admin";

const idSchema = z.string().min(1).max(64);

export async function setStatusAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const parsed = z.object({ id: idSchema, status: z.enum(APPLICATION_STATUSES) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    await flash("error", "Stato non valido.");
    redirect(adminPaths.applications);
  }
  const ok = await setApplicationStatus(parsed.data.id, parsed.data.status);
  if (ok) await audit(user.id, "application_status", "application", parsed.data.id);
  await flash(ok ? "success" : "error", ok ? "Stato aggiornato." : "Candidatura non trovata.");
  redirect(adminPaths.application(parsed.data.id));
}

export async function deleteApplicationAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(Object.fromEntries(formData));
  if (parsed.success) {
    const n = await deleteApplication(parsed.data.id);
    if (n > 0) await audit(user.id, "application_deleted", "application", parsed.data.id);
    await flash(n > 0 ? "success" : "error", n > 0 ? "Candidatura e CV eliminati." : "Candidatura non trovata.");
  }
  redirect(adminPaths.applications);
}

export async function saveRetentionAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const num = z.coerce.number().int().min(0).max(3650);
  const a = num.safeParse(formData.get("applicationsDays") || 0);
  const r = num.safeParse(formData.get("pastRegistrationsDays") || 0);
  if (!a.success || !r.success) {
    await flash("error", "Inserisci un numero di giorni valido (0 = non impostato).");
    redirect(adminPaths.applications);
  }
  const current = await getSetting("retention");
  await setSetting("retention", { ...current, applicationsDays: a.data, pastRegistrationsDays: r.data });
  await audit(user.id, "retention_saved", "settings", "retention");
  await flash("success", "Tempi di conservazione salvati.");
  redirect(adminPaths.applications);
}

export async function purgeOldApplicationsAction(): Promise<void> {
  const user = await requireAdmin();
  const { applicationsDays } = await getSetting("retention");
  if (!isRetentionSet(applicationsDays)) {
    await flash("error", "Imposta prima i giorni di conservazione.");
    redirect(adminPaths.applications);
  }
  const n = await purgeApplicationsOlderThan(applicationsDays);
  await audit(user.id, "applications_purged", "application", String(n));
  await flash("success", n === 1 ? "Eliminata 1 candidatura." : `Eliminate ${n} candidature.`);
  redirect(adminPaths.applications);
}

// ---------- Job openings ----------

const openingSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Scrivi il titolo della posizione.").max(120),
  description: z.string().trim().max(4000).default(""),
  status: z.enum(["draft", "open", "closed"]),
});

export async function saveOpeningAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const parsed = openingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    await flash("error", parsed.error.issues[0]?.message ?? "Controlla i campi.");
    redirect(adminPaths.openings);
  }
  const { id, title, description, status } = parsed.data;
  if (id) {
    await db.update(schema.jobOpenings).set({ title, description, status }).where(eq(schema.jobOpenings.id, id));
    await audit(user.id, "opening_saved", "job_opening", id);
  } else {
    const newOpeningId = newId();
    const base = slugify(title) || "posizione";
    await db.insert(schema.jobOpenings).values({ id: newOpeningId, slug: `${base}-${newOpeningId.slice(0, 6)}`, title, description, status });
    await audit(user.id, "opening_created", "job_opening", newOpeningId);
  }
  await flash("success", "Posizione salvata.");
  redirect(adminPaths.openings);
}

export async function deleteOpeningAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const parsed = z.object({ id: idSchema }).safeParse(Object.fromEntries(formData));
  if (parsed.success) {
    await db.delete(schema.jobOpenings).where(eq(schema.jobOpenings.id, parsed.data.id));
    await audit(user.id, "opening_deleted", "job_opening", parsed.data.id);
    await flash("success", "Posizione eliminata.");
  }
  redirect(adminPaths.openings);
}
