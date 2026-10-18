/**
 * Shared helper (ABES + News): validate an uploaded image by magic bytes, store it in the public media
 * storage and create the `media` row. Callers MUST have run requireAdmin().
 */
import { db, newId, schema } from "@/lib/db";
import { getStorage, newStoredPath, validateImage } from "@/lib/storage";

export type UploadResult = { ok: true; mediaId: string; path: string } | { ok: false; error: string };

export function isUploaded(f: FormDataEntryValue | null): f is File {
  return typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0;
}

export async function saveImageUpload(file: File, opts: { alt: string; credit?: string | null }): Promise<UploadResult> {
  const buf = Buffer.from(await file.arrayBuffer());
  const v = validateImage(buf);
  if (!v.ok) return { ok: false, error: v.error };
  const rel = newStoredPath(v.kind.ext);
  await getStorage().put("public", rel, buf);
  const id = newId();
  await db.insert(schema.media).values({ id, path: rel, mime: v.kind.mime, size: buf.length, alt: opts.alt.slice(0, 200), credit: opts.credit ?? null });
  return { ok: true, mediaId: id, path: rel };
}
