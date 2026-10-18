"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { actionError, actionOk, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { recount } from "@/lib/events/registrations";
import { deleteCategory, deleteEvent, duplicateEvent, saveCategory, saveEvent } from "@/lib/events/service";
import { parseEventInput } from "@/lib/events/validation";
import { flash } from "@/lib/flash";
import { adminPaths, paths } from "@/lib/paths";

const idSchema = z.object({ id: z.string().regex(/^[a-z0-9]{10,40}$/) });

function touchPublic(slug?: string) {
  revalidatePath(paths.events);
  if (slug) revalidatePath(paths.event(slug));
  revalidatePath(paths.home);
}

export async function saveEventAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const raw = Object.fromEntries(formData);
  const idRaw = typeof raw.id === "string" && raw.id ? raw.id : null;
  if (idRaw && !idSchema.safeParse({ id: idRaw }).success) return actionError("Evento non valido.");

  const parsed = parseEventInput(raw);
  if (!parsed.ok) return actionError("Controlla i campi evidenziati.", parsed.errors);

  const res = await saveEvent(idRaw, parsed.data);
  if (!res.ok) return actionError(res.message, res.fieldErrors);

  await audit(user.id, idRaw ? "event_saved" : "event_created", "event", res.id);
  touchPublic(parsed.data.slug);
  if (!idRaw) {
    await flash("success", "Evento creato. Ora puoi completarlo e pubblicarlo.");
    redirect(adminPaths.event(res.id));
  }
  revalidatePath(adminPaths.event(res.id));
  return actionOk("Evento salvato.");
}

export async function duplicateEventAction(formData: FormData) {
  const user = await requireAdmin();
  const p = idSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.events);
  const newId = await duplicateEvent(p.data.id);
  if (!newId) {
    await flash("error", "Evento non trovato.");
    redirect(adminPaths.events);
  }
  await audit(user.id, "event_duplicated", "event", newId);
  await flash("success", "Copia creata come bozza: controlla data e testi prima di pubblicarla.");
  redirect(adminPaths.event(newId));
}

export async function deleteEventAction(formData: FormData) {
  const user = await requireAdmin();
  const p = idSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.events);
  const [ev] = await db.select({ slug: schema.events.slug }).from(schema.events).where(eq(schema.events.id, p.data.id));
  const res = await deleteEvent(p.data.id);
  if (!res.ok) {
    await flash("error", res.message);
    redirect(res.reason === "has_registrations" ? adminPaths.event(p.data.id) : adminPaths.events);
  }
  await audit(user.id, "event_deleted", "event", p.data.id);
  touchPublic(ev?.slug);
  await flash("success", "Evento eliminato.");
  redirect(adminPaths.events);
}

const statusSchema = idSchema.extend({ to: z.enum(["draft", "published", "hidden"]) });
export async function setEventStatusAction(formData: FormData) {
  const user = await requireAdmin();
  const p = statusSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.events);
  const [ev] = await db.update(schema.events).set({ status: p.data.to, updatedAt: Date.now() }).where(eq(schema.events.id, p.data.id)).returning({ slug: schema.events.slug });
  await audit(user.id, `event_${p.data.to}`, "event", p.data.id);
  touchPublic(ev?.slug);
  await flash("success", p.data.to === "published" ? "Evento pubblicato." : p.data.to === "hidden" ? "Evento nascosto: non è più visibile ai visitatori." : "Evento riportato in bozza.");
  redirect(adminPaths.events);
}

const closeSchema = idSchema.extend({ closed: z.enum(["1", "0"]), back: z.string().optional() });
export async function setRegistrationsClosedAction(formData: FormData) {
  const user = await requireAdmin();
  const p = closeSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.events);
  const [ev] = await db.update(schema.events).set({ registrationManuallyClosed: p.data.closed === "1", updatedAt: Date.now() }).where(eq(schema.events.id, p.data.id)).returning({ slug: schema.events.slug });
  await audit(user.id, p.data.closed === "1" ? "event_registrations_closed" : "event_registrations_reopened", "event", p.data.id);
  touchPublic(ev?.slug);
  await flash("success", p.data.closed === "1" ? "Iscrizioni chiuse." : "Iscrizioni riaperte.");
  redirect(p.data.back === "edit" ? adminPaths.event(p.data.id) : adminPaths.events);
}

export async function recountAction(formData: FormData) {
  const user = await requireAdmin();
  const p = idSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.events);
  const r = await recount(p.data.id);
  await audit(user.id, "event_recount", "event", p.data.id);
  const changed = r && (r.previous.seatsConfirmed !== r.seatsConfirmed || r.previous.seatsHeld !== r.seatsHeld);
  await flash("success", changed ? "Contatori dei posti riallineati." : "I contatori erano già corretti.");
  redirect(adminPaths.event(p.data.id));
}

// ---------- categories ----------
export async function saveCategoryAction(formData: FormData) {
  const user = await requireAdmin();
  const idRaw = String(formData.get("id") ?? "");
  const id = idRaw && /^[a-z0-9]{10,40}$/.test(idRaw) ? idRaw : null;
  const res = await saveCategory(id, String(formData.get("name") ?? ""));
  if (!res.ok) await flash("error", res.message);
  else {
    await audit(user.id, id ? "event_category_renamed" : "event_category_created", "event_category", id ?? undefined);
    await flash("success", id ? "Categoria rinominata." : "Categoria aggiunta.");
    revalidatePath(paths.events);
  }
  redirect(adminPaths.eventCategories);
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireAdmin();
  const p = idSchema.safeParse(Object.fromEntries(formData));
  if (p.success) {
    await deleteCategory(p.data.id);
    await audit(user.id, "event_category_deleted", "event_category", p.data.id);
    await flash("success", "Categoria eliminata. Gli eventi che la usavano restano senza categoria.");
    revalidatePath(paths.events);
  }
  redirect(adminPaths.eventCategories);
}

