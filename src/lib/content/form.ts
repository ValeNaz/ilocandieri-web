import { z } from "zod";
import { cleanRichHtml } from "./rich";
import { blockSchemas, BLOCK_DEFS, type BlockType, type FieldSpec } from "./blocks";

type Leaf = Exclude<FieldSpec, { kind: "items" }>;

function leafValue(f: Leaf, fd: FormData, key: string): unknown {
  const raw = fd.get(key);
  const s = typeof raw === "string" ? raw : "";
  switch (f.kind) {
    case "number":
      return s.trim() === "" ? undefined : Number(s);
    case "checkbox":
      return raw === "on" || raw === "true";
    case "media":
      return s.trim() || null;
    case "cta": {
      const label = String(fd.get(`${key}.label`) ?? "").trim();
      const href = String(fd.get(`${key}.href`) ?? "").trim();
      return !label && !href ? null : { label, href };
    }
    case "html":
      return cleanRichHtml(s);
    default:
      return s;
  }
}

function fieldsToRaw(fields: FieldSpec[], fd: FormData, prefix: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const key = `${prefix}${f.name}`;
    if (f.kind === "items") {
      const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.(\\d+)\\.`);
      const idx = new Set<number>();
      for (const k of fd.keys()) {
        const m = re.exec(k);
        if (m) idx.add(Number(m[1]));
      }
      const items: Record<string, unknown>[] = [];
      for (const i of [...idx].sort((a, b) => a - b)) {
        const item = fieldsToRaw(f.fields, fd, `${key}.${i}.`);
        const allBlank = f.fields.filter((x) => x.kind === "text" || x.kind === "textarea").every((x) => String(item[x.name] ?? "").trim() === "");
        if (!allBlank) items.push(item);
      }
      out[f.name] = items;
    } else {
      out[f.name] = leafValue(f, fd, key);
    }
  }
  return out;
}

/**
 * Parse an admin block form into validated block data. `existing` supplies the non-editable keys (slot, adminNote).
 * Server-side source of truth: the client form is only a convenience.
 */
export function parseBlockForm(type: BlockType, fd: FormData, existing: Record<string, unknown> = {}) {
  const raw = fieldsToRaw(BLOCK_DEFS[type].fields, fd, "");
  if (typeof existing.slot === "string") raw.slot = existing.slot;
  if (typeof existing.adminNote === "string") raw.adminNote = existing.adminNote;
  return blockSchemas[type].safeParse(raw);
}

/** Flatten zod issues to `{ "items.0.title": "msg" }`. */
export function blockFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
