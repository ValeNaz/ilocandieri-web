import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db as defaultDb, newId, schema, type Db } from "@/lib/db";
import type { EventFormField } from "@/lib/db/schema";
import type { RegistrationMode } from "./state";

export type { EventFormField };
export type FieldType = EventFormField["type"];

export const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: "text", label: "Testo breve" },
  { type: "textarea", label: "Testo lungo" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Telefono" },
  { type: "select", label: "Elenco a scelta" },
  { type: "checkbox", label: "Casella da spuntare" },
  { type: "seats", label: "Numero di partecipanti" },
];

export const FIELD_ID_RE = /^[a-z][a-z0-9_]{0,30}$/;
export const MAX_FIELDS = 20;
/** Always present in every form (stored in dedicated columns). */
export const LOCKED_FIELD_IDS = ["name", "email"] as const;
/** Declared requirement collected for reserved events (never confirms by itself). */
export const REQUIREMENT_FIELD_ID = "requisito";
/** Answers snapshot keys that live in dedicated columns instead of `answers`. */
const COLUMN_FIELDS = new Set<string>(LOCKED_FIELD_IDS);

export const DEFAULT_FIELDS: EventFormField[] = [
  { id: "name", type: "text", label: "Nome e cognome", required: true },
  { id: "email", type: "email", label: "Email", required: true },
  { id: "phone", type: "phone", label: "Telefono", required: false },
];

export const requirementField = (): EventFormField => ({
  id: REQUIREMENT_FIELD_ID,
  type: "textarea",
  label: "Requisito di partecipazione (indica come rientri tra i destinatari)",
  required: true,
  help: "Verificheremo l'informazione prima di confermare: indicarla non garantisce la partecipazione.",
});

export const newFieldId = () => `c_${newId().slice(0, 8)}`.toLowerCase();

// ---------- Builder-side validation (admin) ----------
const fieldSchema = z.object({
  id: z.string().regex(FIELD_ID_RE, "Identificativo campo non valido."),
  type: z.enum(["text", "textarea", "email", "phone", "select", "checkbox", "seats"]),
  label: z.string().trim().min(1, "Ogni campo deve avere un'etichetta.").max(160, "Etichetta troppo lunga (max 160)."),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(80, "Opzione troppo lunga (max 80).")).max(30, "Massimo 30 opzioni.").optional(),
  min: z.number().int().min(1).max(50).optional(),
  max: z.number().int().min(1).max(50).optional(),
  help: z.string().trim().max(240, "Testo di aiuto troppo lungo (max 240).").optional(),
});

export const formFieldsSchema = z
  .array(fieldSchema)
  .min(2, "Il modulo deve contenere almeno nome ed email.")
  .max(MAX_FIELDS, `Massimo ${MAX_FIELDS} campi.`)
  .superRefine((fields, ctx) => {
    const ids = new Set<string>();
    let seats = 0;
    fields.forEach((f, i) => {
      if (ids.has(f.id)) ctx.addIssue({ code: "custom", message: "Campi duplicati.", path: [i, "id"] });
      ids.add(f.id);
      if (f.type === "select") {
        const opts = (f.options ?? []).filter(Boolean);
        if (opts.length < 2) ctx.addIssue({ code: "custom", message: `“${f.label}”: servono almeno 2 opzioni.`, path: [i, "options"] });
        if (new Set(opts.map((o) => o.toLowerCase())).size !== opts.length) ctx.addIssue({ code: "custom", message: `“${f.label}”: opzioni ripetute.`, path: [i, "options"] });
      }
      if (f.type === "seats") {
        seats += 1;
        if (f.min != null && f.max != null && f.min > f.max) ctx.addIssue({ code: "custom", message: `“${f.label}”: il minimo supera il massimo.`, path: [i, "min"] });
      }
    });
    if (seats > 1) ctx.addIssue({ code: "custom", message: "È ammesso un solo campo “numero di partecipanti”.", path: [] });
    for (const id of LOCKED_FIELD_IDS) if (!ids.has(id)) ctx.addIssue({ code: "custom", message: "Nome ed email non si possono rimuovere.", path: [] });
  });

/**
 * Enforce structural invariants no matter what the client sent: name + email first and locked,
 * reserved events always collect the declared requirement, no stray option/limit properties.
 */
export function normalizeFields(input: EventFormField[], mode: RegistrationMode | null): EventFormField[] {
  const byId = new Map(input.map((f) => [f.id, f]));
  const name = { ...DEFAULT_FIELDS[0]!, ...pick(byId.get("name")), id: "name", type: "text" as const, required: true };
  const email = { ...DEFAULT_FIELDS[1]!, ...pick(byId.get("email")), id: "email", type: "email" as const, required: true };
  const rest = input.filter((f) => !COLUMN_FIELDS.has(f.id));
  if (mode === "reserved" && !rest.some((f) => f.id === REQUIREMENT_FIELD_ID)) rest.unshift(requirementField());
  const clean = rest.map((f) => {
    const out: EventFormField = { id: f.id, type: f.type, label: f.label.trim(), required: !!f.required };
    if (f.id === REQUIREMENT_FIELD_ID && mode === "reserved") {
      out.type = "textarea";
      out.required = true;
    }
    if (out.type === "select") out.options = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
    if (out.type === "seats") {
      out.min = f.min ?? 1;
      if (f.max != null) out.max = f.max;
    }
    if (f.help?.trim()) out.help = f.help.trim();
    return out;
  });
  return [name, email, ...clean];
}
function pick(f?: EventFormField) {
  return f ? { label: f.label, help: f.help } : {};
}

// ---------- Submission-side validation (public, built from the form VERSION) ----------
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const noControl = (s: string) => !CONTROL_CHARS.test(s);

function textSchema(f: EventFormField, max: number) {
  const base = z.string({ error: "Compila questo campo." }).trim().max(max, { error: `Massimo ${max} caratteri.` }).refine(noControl, { error: "Caratteri non validi." });
  return f.required ? base.min(1, { error: "Campo obbligatorio." }) : base;
}

function fieldSchemaFor(f: EventFormField, ctx: { maxSeats: number }): z.ZodType {
  switch (f.type) {
    case "text":
      return textSchema(f, f.id === "name" ? 120 : 200).pipe(f.id === "name" ? z.string().min(2, { error: "Inserisci nome e cognome." }) : z.string());
    case "textarea":
      return textSchema(f, 2000);
    case "email": {
      const email = z.string({ error: "Inserisci un indirizzo email." }).trim().max(254, { error: "Indirizzo troppo lungo." }).pipe(z.email({ error: "Indirizzo email non valido." }));
      return f.required ? email : z.union([z.literal(""), email]);
    }
    case "phone": {
      const phone = z
        .string({ error: "Inserisci un numero di telefono." })
        .trim()
        .regex(/^\+?[0-9][0-9 ().\/-]{4,24}$/, { error: "Numero di telefono non valido." })
        .refine((v) => {
          const d = v.replace(/\D/g, "").length;
          return d >= 6 && d <= 15;
        }, { error: "Numero di telefono non valido." });
      return f.required ? phone : z.union([z.literal(""), phone]);
    }
    case "select": {
      const options = (f.options ?? []).filter(Boolean);
      const choice = z.string().refine((v) => options.includes(v), { error: "Scegli una delle opzioni." });
      return f.required ? choice : z.union([z.literal(""), choice]);
    }
    case "checkbox":
      return f.required ? z.literal(true, { error: "Per proseguire devi spuntare questa casella." }) : z.boolean();
    case "seats": {
      const min = Math.max(1, f.min ?? 1);
      const max = Math.max(min, Math.min(f.max ?? ctx.maxSeats, ctx.maxSeats));
      return z.number({ error: "Indica un numero valido." }).int({ error: "Indica un numero intero." }).min(min, { error: `Indica almeno ${min}.` }).max(max, { error: `Puoi richiedere al massimo ${max} ${max === 1 ? "posto" : "posti"} per volta.` });
    }
  }
}

function coerceRaw(f: EventFormField, raw: unknown): unknown {
  if (f.type === "checkbox") return raw === true || raw === "on" || raw === "true" || raw === "1";
  if (f.type === "seats") {
    if (typeof raw === "number") return raw;
    if (typeof raw === "string" && /^\d{1,3}$/.test(raw.trim())) return Number(raw);
    return raw == null || raw === "" ? (f.min ?? 1) : Number.NaN;
  }
  if (raw == null) return "";
  return typeof raw === "string" ? raw : String(raw);
}

/** Dynamic zod schema for a given form version (keys = field ids). */
export function buildSubmissionSchema(fields: EventFormField[], ctx: { maxSeats: number }) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.id] = fieldSchemaFor(f, ctx);
  return z.object(shape).strict();
}

export type ParsedSubmission =
  | { ok: true; values: Record<string, string | number | boolean> }
  | { ok: false; errors: Record<string, string> };

/** Validate raw client input (FormData-like) against the form VERSION. Unknown keys are ignored. */
export function parseSubmission(fields: EventFormField[], raw: Record<string, unknown>, ctx: { maxSeats: number }): ParsedSubmission {
  const input: Record<string, unknown> = {};
  for (const f of fields) input[f.id] = coerceRaw(f, raw[f.id]);
  const res = buildSubmissionSchema(fields, ctx).safeParse(input);
  if (!res.success) {
    const errors: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!(key in errors)) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  return { ok: true, values: res.data as Record<string, string | number | boolean> };
}

/** Snapshot stored with the registration: label + value AS SUBMITTED (immune to later form edits). */
export function buildAnswers(fields: EventFormField[], values: Record<string, unknown>) {
  return fields
    .filter((f) => !COLUMN_FIELDS.has(f.id) && f.type !== "seats")
    .map((f) => ({ fieldId: f.id, label: f.label, value: values[f.id] ?? (f.type === "checkbox" ? false : "") }));
}

export function formatAnswerValue(v: unknown): string {
  if (v === true) return "Sì";
  if (v === false) return "No";
  if (v == null || v === "") return "—";
  return String(v);
}

// ---------- Versions ----------
export async function getLatestFormVersion(eventId: string, d: Db = defaultDb) {
  const [row] = await d.select().from(schema.eventFormVersions).where(eq(schema.eventFormVersions.eventId, eventId)).orderBy(desc(schema.eventFormVersions.version)).limit(1);
  return row ?? null;
}

const sameFields = (a: EventFormField[], b: EventFormField[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Persist the form. Editing the form = NEW version (past registrations keep pointing to the version they
 * were made with). No-op when nothing changed. Returns the (new or current) version row.
 */
export async function saveFormFields(eventId: string, fields: EventFormField[], mode: RegistrationMode | null, d: Db = defaultDb) {
  const normalized = normalizeFields(fields, mode);
  for (let attempt = 0; attempt < 5; attempt++) {
    const latest = await getLatestFormVersion(eventId, d);
    if (latest && sameFields(latest.fields, normalized)) return { version: latest, created: false };
    const id = newId();
    const inserted = await d
      .insert(schema.eventFormVersions)
      .values({ id, eventId, version: (latest?.version ?? 0) + 1, fields: normalized })
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return { version: inserted[0], created: true };
  }
  throw new Error("Impossibile salvare la versione del modulo, riprova.");
}

/** Latest version, creating the default form when the event never had one. */
export async function ensureFormVersion(eventId: string, mode: RegistrationMode | null, d: Db = defaultDb) {
  const latest = await getLatestFormVersion(eventId, d);
  if (latest) return latest;
  return (await saveFormFields(eventId, DEFAULT_FIELDS, mode, d)).version;
}
