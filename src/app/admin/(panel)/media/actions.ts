"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getMediaUsage, imageSize } from "@/lib/content/media";
import { db, newId, schema } from "@/lib/db";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";
import { getStorage, newStoredPath, validateImage } from "@/lib/storage";

const metaSchema = z.object({
  alt: z.string().trim().min(3, "Descrivi l'immagine per chi non la vede (almeno 3 caratteri).").max(200, "Massimo 200 caratteri."),
  credit: z.string().trim().max(150, "Massimo 150 caratteri.").default(""),
});

export async function uploadMediaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const meta = metaSchema.safeParse({ alt: formData.get("alt") ?? "", credit: formData.get("credit") ?? "" });
  if (!meta.success) return actionError("Controlla i campi.", zodFieldErrors(meta.error));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return actionError("Scegli un file.", { file: "Scegli un'immagine da caricare." });
  const buffer = Buffer.from(await file.arrayBuffer());
  const valid = validateImage(buffer);
  if (!valid.ok) return actionError(valid.error, { file: valid.error });

  const relPath = newStoredPath(valid.kind.ext);
  await getStorage().put("public", relPath, buffer);
  const size = imageSize(buffer);
  const id = newId();
  await db.insert(schema.media).values({ id, path: relPath, mime: valid.kind.mime, size: buffer.length, width: size?.width ?? null, height: size?.height ?? null, alt: meta.data.alt, credit: meta.data.credit || null });
  await audit(user.id, "media_uploaded", "media", id);
  revalidatePath(adminPaths.media);
  return actionOk("Immagine caricata.");
}

export async function updateMediaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = z.string().trim().min(1).max(40).safeParse(formData.get("id"));
  const meta = metaSchema.safeParse({ alt: formData.get("alt") ?? "", credit: formData.get("credit") ?? "" });
  if (!id.success) return actionError("Immagine non valida.");
  if (!meta.success) return actionError("Controlla i campi.", zodFieldErrors(meta.error));
  const r = await db.update(schema.media).set({ alt: meta.data.alt, credit: meta.data.credit || null }).where(eq(schema.media.id, id.data)).returning({ id: schema.media.id });
  if (!r.length) return actionError("Immagine non trovata.");
  await audit(user.id, "media_updated", "media", id.data);
  revalidatePath(adminPaths.media);
  return actionOk("Descrizione salvata.");
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const id = z.string().trim().min(1).max(40).parse(formData.get("id"));
  const [m] = await db.select().from(schema.media).where(eq(schema.media.id, id));
  if (!m) return;
  const usage = await getMediaUsage(id);
  if (usage.length) {
    await flash("error", "Non puoi eliminare questa immagine: è ancora in uso. Sostituiscila prima nei punti indicati.");
    return;
  }
  await db.delete(schema.media).where(eq(schema.media.id, id));
  await getStorage().remove("public", m.path);
  await audit(user.id, "media_deleted", "media", id);
  revalidatePath(adminPaths.media);
  await flash("success", "Immagine eliminata.");
}
