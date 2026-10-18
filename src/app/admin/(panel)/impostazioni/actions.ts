"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { extractSearchConsoleToken, GA_ID_RE } from "@/lib/content/analytics";
import { db, schema } from "@/lib/db";
import { getSetting, setSetting } from "@/lib/settings";
import { eq } from "drizzle-orm";

const fail = (e: z.ZodError) => actionError("Controlla i campi evidenziati.", zodFieldErrors(e));
const done = async (userId: string, key: string, msg: string) => {
  await audit(userId, "settings_saved", "settings", key);
  revalidatePath("/", "layout");
  return actionOk(msg);
};

const httpsUrl = z.string().trim().max(300).refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/i.test(v), "Inserisci un indirizzo che inizia con https://");
const emailOpt = z.string().trim().max(160).refine((v) => v === "" || z.email().safeParse(v).success, "Email non valida.");
const VERIFY_FIELDS = ["phone", "address", "email", "whatsapp", "vatId"] as const;

const orgSchema = z.object({
  name: z.string().trim().min(2, "Scrivi il nome della cooperativa.").max(120),
  phone: z.string().trim().max(30).refine((v) => v === "" || /^[+\d][\d\s().-]{5,}$/.test(v), "Numero non valido."),
  email: emailOpt,
  address: z.string().trim().max(200),
  whatsapp: z.string().trim().max(30).refine((v) => v === "" || (() => { const d = v.replace(/\D/g, ""); return d.length >= 8 && d.length <= 15; })(), "Inserisci il numero con prefisso internazionale, es. +39 331 1234567."),
  vatId: z.string().trim().max(30),
  facebook: httpsUrl, instagram: httpsUrl, linkedin: httpsUrl, youtube: httpsUrl,
  footerLine: z.string().trim().min(1, "Scrivi la frase del footer.").max(160),
});

export async function saveOrgAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = orgSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const current = await getSetting("org");
  const toVerify = VERIFY_FIELDS.filter((f) => fd.get(`verify_${f}`) === "on");
  const social: Record<string, string> = {};
  for (const k of ["facebook", "instagram", "linkedin", "youtube"] as const) if (d[k]) social[k] = d[k];
  await setSetting("org", { ...current, name: d.name, phone: d.phone, email: d.email, address: d.address, whatsapp: d.whatsapp, vatId: d.vatId, social, toVerify: [...toVerify] });
  const footer = await getSetting("footer");
  await setSetting("footer", { ...footer, line: d.footerLine });
  return done(user.id, "org", "Recapiti salvati.");
}

const emailList = z.string().max(2000).transform((v) => v.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))
  .refine((l) => l.length <= 10, "Massimo 10 indirizzi.").refine((l) => l.every((e) => z.email().safeParse(e).success), "Uno degli indirizzi non è valido.");
const notifSchema = z.object({ registrationsTo: emailList, applicationsTo: emailList, contactsTo: emailList });

export async function saveNotificationsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = notifSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error);
  await setSetting("notifications", parsed.data);
  return done(user.id, "notifications", "Destinatari delle notifiche salvati.");
}

const analyticsSchema = z.object({
  gaMeasurementId: z.string().trim().toUpperCase().refine((v) => v === "" || GA_ID_RE.test(v), "L'ID deve avere il formato G-XXXXXXXXXX."),
  searchConsoleVerification: z.string().trim().max(500),
});
export async function saveAnalyticsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = analyticsSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error);
  const token = extractSearchConsoleToken(parsed.data.searchConsoleVerification);
  if (parsed.data.searchConsoleVerification && !token) return actionError("Controlla i campi evidenziati.", { searchConsoleVerification: "Codice non valido: incolla solo il valore di «content» del tag meta fornito da Google." });
  await setSetting("analytics", { gaMeasurementId: parsed.data.gaMeasurementId, searchConsoleVerification: token });
  return done(user.id, "analytics", parsed.data.gaMeasurementId ? "Salvato. Google Analytics verrà caricato solo ai visitatori che danno il consenso." : "Salvato. Nessuno strumento di misurazione è attivo.");
}

const retentionSchema = z.object({
  applicationsDays: z.coerce.number().int().min(30, "Minimo 30 giorni.").max(3650, "Massimo 3650 giorni."),
  pastRegistrationsDays: z.coerce.number().int().min(30, "Minimo 30 giorni.").max(3650, "Massimo 3650 giorni."),
});
export async function saveRetentionAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = retentionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error);
  await setSetting("retention", parsed.data);
  return done(user.id, "retention", "Tempi di conservazione salvati.");
}

const seoSchema = z.object({
  siteName: z.string().trim().min(2, "Scrivi il nome del sito.").max(80),
  titleTemplate: z.string().trim().max(100).refine((v) => v.includes("%s"), "Deve contenere %s dove va il titolo della pagina."),
  description: z.string().trim().max(200, "Massimo 200 caratteri."),
  ogImageId: z.string().trim().max(40),
});
export async function saveSeoDefaultsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = seoSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  if (d.ogImageId) {
    const [m] = await db.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.id, d.ogImageId));
    if (!m) return actionError("Controlla i campi evidenziati.", { ogImageId: "Immagine non trovata." });
  }
  await setSetting("seo_defaults", { siteName: d.siteName, titleTemplate: d.titleTemplate, description: d.description, ogImageId: d.ogImageId || null });
  return done(user.id, "seo_defaults", "SEO predefinita salvata.");
}
