"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { approve, cancel, reject, setAdminNote } from "@/lib/events/registrations";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";

const schemaIn = z.object({
  id: z.string().regex(/^[a-z0-9]{10,40}$/),
  note: z.string().trim().max(1000).optional(),
  back: z.string().optional(),
});

/** Only ever bounce back to the registrations area (no open redirects). */
function safeBack(back: string | undefined, id: string) {
  return back && back.startsWith(adminPaths.registrations) && !back.startsWith("//") ? back : adminPaths.registration(id);
}

async function decide(kind: "approve" | "reject" | "cancel", formData: FormData) {
  const user = await requireAdmin();
  const p = schemaIn.safeParse(Object.fromEntries(formData));
  if (!p.success) {
    await flash("error", "Richiesta non valida.");
    redirect(adminPaths.registrations);
  }
  const opts = { userId: user.id, note: p.data.note || undefined };
  const res = kind === "approve" ? await approve(p.data.id, opts) : kind === "reject" ? await reject(p.data.id, opts) : await cancel(p.data.id, opts);
  if (!res.ok) {
    await flash("error", res.message);
  } else {
    await audit(user.id, `registration_${kind === "approve" ? "approved" : kind === "reject" ? "rejected" : "cancelled"}`, "registration", p.data.id);
    await flash("success", kind === "approve" ? "Richiesta approvata. L'iscritto riceve la conferma." : kind === "reject" ? "Richiesta rifiutata. L'iscritto è stato avvisato." : "Iscrizione annullata. I posti sono di nuovo disponibili.");
  }
  revalidatePath(adminPaths.registrations);
  redirect(safeBack(p.data.back, p.data.id));
}

export async function approveRegistrationAction(formData: FormData) {
  return decide("approve", formData);
}
export async function rejectRegistrationAction(formData: FormData) {
  return decide("reject", formData);
}
export async function cancelRegistrationAction(formData: FormData) {
  return decide("cancel", formData);
}

export async function saveRegistrationNoteAction(formData: FormData) {
  const user = await requireAdmin();
  const p = schemaIn.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(adminPaths.registrations);
  const ok = await setAdminNote(p.data.id, p.data.note ?? "");
  if (ok) await audit(user.id, "registration_note_saved", "registration", p.data.id);
  await flash(ok ? "success" : "error", ok ? "Nota salvata." : "Iscrizione non trovata.");
  redirect(adminPaths.registration(p.data.id));
}
