import { z } from "zod";
import { sanitizeHtml } from "@/lib/security/sanitize";
import { slugify } from "@/lib/utils";
import { validateCtaTarget } from "./cta";
import { formFieldsSchema, type EventFormField } from "./forms";
import { MESSAGE_KEYS } from "./messages";
import { romeLocalToMs } from "./time";
import type { CtaType, EventRow, RegistrationMode } from "./state";

// ---------- event input ----------
const MODES = ["open", "limited", "approval", "reserved"] as const;
const CTA = ["none", "external_link", "whatsapp", "email", "contact", "registration"] as const;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number, tooLong = `Massimo ${max} caratteri.`) => z.string().trim().max(max, { error: tooLong });
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === "1" || v === true, z.boolean());
const optInt = (min: number, max: number, msg: string) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.union([z.null(), z.coerce.number({ error: msg }).int({ error: msg }).min(min, { error: msg }).max(max, { error: msg })])).optional().transform((v) => v ?? null);
const optDate = z.string().trim().optional().transform((v, ctx) => {
  if (!v) return null;
  const ms = romeLocalToMs(v);
  if (ms == null) ctx.addIssue({ code: "custom", message: "Data non valida." });
  return ms;
});
const optText = (max: number) => text(max).optional().transform((v) => v || null);

export const eventInputSchema = z
  .object({
    title: text(140).min(3, { error: "Inserisci un titolo (almeno 3 caratteri)." }),
    slug: text(80).optional().transform((v) => v ?? ""),
    summary: text(300, "La sintesi può avere al massimo 300 caratteri.").optional().transform((v) => v ?? ""),
    body: z.string().max(60000, { error: "Il testo è troppo lungo." }).optional().transform((v) => v ?? ""),
    startsAt: z.string().trim().min(1, { error: "Indica data e ora di inizio." }).transform((v, ctx) => {
      const ms = romeLocalToMs(v);
      if (ms == null) ctx.addIssue({ code: "custom", message: "Data di inizio non valida." });
      return ms ?? 0;
    }),
    endsAt: optDate,
    location: optText(200),
    coverId: optText(60),
    categoryId: optText(60),
    audience: optText(300),
    status: z.enum(["draft", "published", "hidden"], { error: "Scegli lo stato." }),
    featured: checkbox,
    ctaType: z.enum(CTA, { error: "Scegli il tipo di azione." }),
    ctaLabel: optText(40),
    ctaTarget: optText(500),
    registrationMode: z.enum(MODES).optional().or(z.literal("").transform(() => undefined)),
    capacity: optInt(1, 100000, "La capienza deve essere un numero da 1 in su."),
    maxSeatsPerRequest: optInt(1, 50, "Posti per richiesta: indica un numero da 1 a 50."),
    pendingHoldsSeats: checkbox,
    reservedCriteria: optText(600),
    registrationOpensAt: optDate,
    registrationClosesAt: optDate,
    registrationManuallyClosed: checkbox,
    privacyNote: optText(1500),
    seoTitle: optText(70),
    seoDescription: optText(200),
    whatsappText: optText(300),
    ...Object.fromEntries(MESSAGE_KEYS.map((k) => [`msg_${k}`, optText(300)])),
    formFields: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const add = (path: string, message: string) => ctx.addIssue({ code: "custom", message, path: [path] });
    if (v.slug && !SLUG_RE.test(v.slug)) add("slug", "L'indirizzo può contenere solo lettere minuscole, numeri e trattini.");
    if (v.endsAt != null && v.startsAt && v.endsAt < v.startsAt) add("endsAt", "La fine non può precedere l'inizio.");
    if (v.ctaType === "registration") {
      if (!v.registrationMode) add("registrationMode", "Scegli la modalità di iscrizione.");
      if (v.registrationMode === "limited" && v.capacity == null) add("capacity", "Per i posti limitati indica la capienza.");
      if (v.registrationMode === "reserved" && !v.reservedCriteria) add("reservedCriteria", "Indica a chi è riservato l'evento (criteri di verifica).");
      if (v.registrationMode !== "open" && v.capacity != null && (v.maxSeatsPerRequest ?? 1) > v.capacity) add("maxSeatsPerRequest", "I posti per richiesta non possono superare la capienza.");
      if (v.pendingHoldsSeats && v.registrationMode !== "open" && v.registrationMode !== "limited" && v.capacity == null) add("pendingHoldsSeats", "Per riservare i posti alle richieste in attesa serve una capienza.");
      if (v.pendingHoldsSeats && (v.registrationMode === "open" || v.registrationMode === "limited")) add("pendingHoldsSeats", "Questa opzione vale solo per eventi su approvazione o riservati.");
      if (v.registrationOpensAt != null && v.registrationClosesAt != null && v.registrationClosesAt <= v.registrationOpensAt) add("registrationClosesAt", "La chiusura deve essere successiva all'apertura.");
    } else {
      const c = validateCtaTarget(v.ctaType, v.ctaTarget);
      if (!c.ok) add("ctaTarget", c.error);
    }
  });

export type EventInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  startsAt: number;
  endsAt: number | null;
  location: string | null;
  coverId: string | null;
  categoryId: string | null;
  audience: string | null;
  status: EventRow["status"];
  featured: boolean;
  ctaType: CtaType;
  ctaLabel: string | null;
  ctaTarget: string | null;
  registrationMode: RegistrationMode | null;
  capacity: number | null;
  maxSeatsPerRequest: number;
  pendingHoldsSeats: boolean;
  reservedCriteria: string | null;
  reservedVerification: "manual" | null;
  registrationOpensAt: number | null;
  registrationClosesAt: number | null;
  registrationManuallyClosed: boolean;
  privacyNote: string | null;
  successMessage: Record<string, string> | null;
  seoTitle: string | null;
  seoDescription: string | null;
  fields: EventFormField[] | null;
};

export type ParsedEventInput = { ok: true; data: EventInput } | { ok: false; errors: Record<string, string> };

export function parseEventInput(raw: Record<string, unknown>): ParsedEventInput {
  const res = eventInputSchema.safeParse(raw);
  if (!res.success) {
    const errors: Record<string, string> = {};
    for (const i of res.error.issues) {
      const k = String(i.path[0] ?? "_");
      if (!(k in errors)) errors[k] = i.message;
    }
    return { ok: false, errors };
  }
  const v = res.data as Record<string, unknown> & z.output<typeof eventInputSchema>;
  const isReg = v.ctaType === "registration";
  const mode = isReg ? ((v.registrationMode as RegistrationMode | undefined) ?? null) : null;

  let ctaTarget: string | null = null;
  if (!isReg) {
    const c = validateCtaTarget(v.ctaType, v.ctaTarget);
    ctaTarget = c.ok ? c.value : null;
  }

  const messages: Record<string, string> = {};
  for (const k of MESSAGE_KEYS) {
    const m = v[`msg_${k}`] as string | null;
    if (m) messages[k] = m;
  }
  if (v.whatsappText && v.ctaType === "whatsapp") messages.whatsappText = v.whatsappText;

  let fields: EventFormField[] | null = null;
  if (isReg) {
    if (v.formFields) {
      let parsedJson: unknown;
      try { parsedJson = JSON.parse(v.formFields); } catch { return { ok: false, errors: { formFields: "Il modulo non è leggibile, ricarica la pagina." } }; }
      const f = formFieldsSchema.safeParse(parsedJson);
      if (!f.success) return { ok: false, errors: { formFields: f.error.issues[0]?.message ?? "Modulo non valido." } };
      fields = f.data as EventFormField[];
    }
  }

  const hasCapacity = isReg && mode !== "open" && v.capacity != null;
  return {
    ok: true,
    data: {
      title: v.title,
      slug: v.slug || slugify(v.title),
      summary: v.summary,
      body: v.body ? sanitizeHtml(v.body) : "",
      startsAt: v.startsAt,
      endsAt: v.endsAt,
      location: v.location,
      coverId: v.coverId,
      categoryId: v.categoryId,
      audience: v.audience,
      status: v.status,
      featured: v.featured,
      ctaType: v.ctaType,
      ctaLabel: v.ctaType === "none" ? null : v.ctaLabel,
      ctaTarget,
      registrationMode: mode,
      capacity: hasCapacity ? v.capacity : null,
      maxSeatsPerRequest: isReg ? (v.maxSeatsPerRequest ?? 1) : 1,
      pendingHoldsSeats: isReg && hasCapacity && (mode === "approval" || mode === "reserved") ? v.pendingHoldsSeats : false,
      reservedCriteria: isReg && mode === "reserved" ? v.reservedCriteria : null,
      reservedVerification: isReg && mode === "reserved" ? "manual" : null,
      registrationOpensAt: isReg ? v.registrationOpensAt : null,
      registrationClosesAt: isReg ? v.registrationClosesAt : null,
      registrationManuallyClosed: isReg ? v.registrationManuallyClosed : false,
      privacyNote: isReg ? v.privacyNote : null,
      successMessage: Object.keys(messages).length ? messages : null,
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      fields,
    },
  };
}
