import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { cache } from "react";
import { imageSize } from "@/lib/content/media";
import { db, schema } from "@/lib/db";
import { mediaSlot, parseMediaSlotsSetting, resolveMediaSource, type LibraryImage, type MediaSlotId, type MediaSlotsSettings, type ResolvedMedia, type SlotFiles } from "@/lib/media-slots";
import { getSetting } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage";

const PUBLIC = path.join(process.cwd(), "public", "reali");
const find = (name: string, exts: string[]) => exts.map((e) => `${name}.${e}`).find((f) => existsSync(path.join(PUBLIC, f)));

const sizes = new Map<string, { mtime: number; size: { width: number; height: number } | null }>();
function fileSize(file: string) {
  const full = path.join(PUBLIC, file);
  try {
    const mtime = statSync(full).mtimeMs;
    const hit = sizes.get(file);
    if (hit && hit.mtime === mtime) return hit.size;
    const size = imageSize(readFileSync(full));
    sizes.set(file, { mtime, size });
    return size;
  } catch {
    return null;
  }
}

/** Files dropped by hand in public/reali for a slot: `<id>.(webp|jpg|jpeg|png)`, `<id>.(mp4|webm)`, `<id>-poster.(webp|jpg|jpeg)`. */
export function slotFiles(id: MediaSlotId): SlotFiles {
  const out: SlotFiles = {};
  const photo = find(id, ["webp", "jpg", "jpeg", "png"]);
  if (photo) { out.photo = `/reali/${photo}`; out.photoSize = fileSize(photo); }
  if (mediaSlot(id).kind === "video") {
    const video = find(id, ["mp4", "webm"]);
    const poster = find(`${id}-poster`, ["webp", "jpg", "jpeg"]);
    if (video) out.video = `/reali/${video}`;
    if (poster) out.poster = `/reali/${poster}`;
  }
  return out;
}

/** Admin assignments + the library images they point to (one query per request). */
export const getMediaSlotAssignments = cache(async (): Promise<{ entries: MediaSlotsSettings; images: Map<string, LibraryImage> }> => {
  const entries = parseMediaSlotsSetting(await getSetting("mediaSlots"));
  const ids = [...new Set(Object.values(entries).map((e) => e?.mediaId).filter((v): v is string => !!v))];
  const images = new Map<string, LibraryImage>();
  if (ids.length) {
    const rows = await db.select().from(schema.media).where(inArray(schema.media.id, ids));
    for (const m of rows) images.set(m.id, { url: mediaUrl(m.path), alt: m.alt, width: m.width, height: m.height, credit: m.credit });
  }
  return { entries, images };
});

export const showMediaPlaceholders = () => process.env.NODE_ENV !== "production" || process.env.SHOW_MEDIA_SLOTS === "1";

export async function resolveSlot(id: MediaSlotId, opts: { caption?: string; showPlaceholder?: boolean } = {}): Promise<ResolvedMedia | null> {
  const { entries, images } = await getMediaSlotAssignments();
  const entry = entries[id] ?? null;
  return resolveMediaSource({
    slot: mediaSlot(id),
    entry,
    image: entry?.mediaId ? images.get(entry.mediaId) ?? null : null,
    files: slotFiles(id),
    caption: opts.caption,
    showPlaceholder: opts.showPlaceholder ?? showMediaPlaceholders(),
  });
}

/** For the /crediti page: slots showing a library image, with the author entered in Media ("Crediti / autore"). */
export async function listRealMediaCredits(): Promise<{ id: MediaSlotId; page: string; section: string; credit: string | null; caption: string }[]> {
  const { entries, images } = await getMediaSlotAssignments();
  return (Object.entries(entries) as [MediaSlotId, NonNullable<MediaSlotsSettings[MediaSlotId]>][])
    .filter(([, e]) => e.mediaId && images.has(e.mediaId))
    .map(([id, e]) => ({ id, page: mediaSlot(id).page, section: mediaSlot(id).section, credit: images.get(e.mediaId!)?.credit ?? null, caption: e.caption }));
}
