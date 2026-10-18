"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";

const input = z.object({ id: z.string().trim().min(1).max(40), status: z.enum(["new", "handled"]).optional() });

export async function setMessageStatusAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const { id, status } = input.parse(Object.fromEntries(formData));
  if (!status) return;
  await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
  await audit(user.id, "contact_message_status", "contact_message", id);
  revalidatePath(adminPaths.messages);
  revalidatePath(adminPaths.dashboard);
  await flash("success", status === "handled" ? "Messaggio segnato come gestito." : "Messaggio segnato come da gestire.");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const { id } = input.parse(Object.fromEntries(formData));
  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id));
  await audit(user.id, "contact_message_deleted", "contact_message", id);
  revalidatePath(adminPaths.messages);
  await flash("success", "Messaggio eliminato.");
  redirect(adminPaths.messages);
}
