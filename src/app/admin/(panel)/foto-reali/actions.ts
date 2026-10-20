"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";
import { isMediaSlotId, mediaSlot, parseMediaSlotsSetting, validateSlotEntry } from "@/lib/media-slots";
import { adminPaths } from "@/lib/paths";

/** Save (or clear) the real photo/video of one slot in the `mediaSlots` setting. */
export async function saveMediaSlotAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = fd.get("slotId");
  if (!isMediaSlotId(id)) return actionError("Spazio non valido.");
  const slot = mediaSlot(id);
  const r = validateSlotEntry(slot, { mediaId: fd.get("mediaId"), alt: fd.get("alt"), caption: fd.get("caption"), videoUrl: fd.get("videoUrl") });
  if (!r.ok) return actionError("Controlla i campi evidenziati.", r.fieldErrors);
  const entry = r.entry;
  if (entry?.mediaId) {
    const [m] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.id, entry.mediaId));
    if (!m) return actionError("Controlla i campi evidenziati.", { mediaId: "Immagine non trovata nella libreria." });
  }
  await db.transaction(async (tx) => {
    const [row] = await tx.select().from(schema.settings).where(eq(schema.settings.key, "mediaSlots"));
    const value = parseMediaSlotsSetting(row?.value);
    if (entry) value[id] = entry;
    else delete value[id];
    await tx.insert(schema.settings).values({ key: "mediaSlots", value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }, { behavior: "immediate" });
  await audit(user.id, "settings_saved", "settings", `mediaSlots:${id}`);
  revalidatePath("/", "layout");
  revalidatePath(adminPaths.realMedia);
  if (!entry) return actionOk("Spazio svuotato: sul sito resta il file della cartella reali, se c'è, altrimenti lo spazio non compare.");
  if (slot.kind === "video" && !entry.videoUrl && entry.mediaId) return actionOk("Salvato. Senza indirizzo del video, sul sito compare l'immagine come foto.");
  if (!entry.mediaId && !entry.videoUrl) return actionOk("Descrizione e didascalia salvate. Manca ancora la foto.");
  return actionOk("Salvato. È già visibile sul sito.");
}
