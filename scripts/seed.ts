/**
 * Idempotent seed. Safe to run any number of times: it only INSERTS missing rows and never overwrites
 * content edited in the admin.
 *
 *   pnpm db:seed
 *
 * Then runs every scripts/seed/*.ts (alphabetical order, files starting with "_" are skipped).
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { hashPassword, passwordPolicyError } from "../src/lib/auth/password";
import { createDb, newId, schema } from "../src/lib/db";
import { getDefaultTemplates } from "../src/lib/email/templates";
import { DEFAULT_SETTINGS, type SettingsMap } from "../src/lib/settings";
import type { SeedContext, SeedFn } from "./seed-types";

const { client, db } = createDb();
const log = (m: string) => console.log(`[seed] ${m}`);

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const existing = (await db.select().from(schema.users)).length;
  if (!email || !password) {
    if (existing === 0) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to create the first admin user.");
    log("admin: ADMIN_EMAIL/ADMIN_PASSWORD not set, skipped.");
    return;
  }
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (user) {
    if (process.env.SEED_RESET_ADMIN_PASSWORD === "1") {
      await db.update(schema.users).set({ passwordHash: await hashPassword(password), active: true }).where(eq(schema.users.id, user.id));
      log(`admin: password reset for ${email}`);
    } else log(`admin: ${email} already exists (password untouched).`);
    return;
  }
  const policy = passwordPolicyError(password);
  if (policy) throw new Error(`ADMIN_PASSWORD rejected: ${policy}`);
  await db.insert(schema.users).values({ id: newId(), email, name: process.env.ADMIN_NAME?.trim() || "Amministratore", passwordHash: await hashPassword(password), role: "admin" });
  log(`admin: created ${email}`);
}

async function seedSettings() {
  const notifyTo = (process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || "").split(",").map((s) => s.trim()).filter(Boolean);
  const initial: SettingsMap = {
    ...DEFAULT_SETTINGS,
    org: {
      ...DEFAULT_SETTINGS.org,
      name: "I Locandieri Soc. Coop.",
      phone: "+39 331 8586827",
      // Dossier 05: address and email are marked "da verificare" -> flagged, editable in admin.
      address: "Via S. Quasimodo 21/d, Castelvetrano (TP), Italia",
      email: "ilocandieri.progettazione@gmail.com",
      toVerify: ["address", "email", "whatsapp", "vatId"],
    },
    notifications: { registrationsTo: notifyTo, applicationsTo: notifyTo, contactsTo: notifyTo },
    seo_defaults: {
      ...DEFAULT_SETTINGS.seo_defaults,
      description: "I Locandieri: cooperativa sociale a Castelvetrano. Accoglienza, inclusione, recupero dei beni confiscati, sport e agricoltura biologica.",
    },
  };
  let n = 0;
  for (const [key, value] of Object.entries(initial)) {
    const r = await db.insert(schema.settings).values({ key, value }).onConflictDoNothing({ target: schema.settings.key }).returning({ key: schema.settings.key });
    n += r.length;
  }
  log(`settings: ${n} inserted`);
}

const PAGES: { key: (typeof schema.pages.$inferInsert)["key"]; title: string; seoTitle: string; seoDescription: string }[] = [
  { key: "home", title: "Home", seoTitle: "I Locandieri | Cooperativa Sociale a Castelvetrano", seoDescription: "Accoglienza, inclusione, recupero dei beni confiscati, sport e agricoltura biologica: scopri le attività de I Locandieri a Castelvetrano." },
  { key: "chi-siamo", title: "Chi siamo", seoTitle: "Chi siamo | I Locandieri Cooperativa Sociale", seoDescription: "Scopri missione, storia e progetti de I Locandieri: inclusione sociale e valorizzazione del territorio attraverso attività concrete." },
  { key: "shop", title: "Shop ABES", seoTitle: "ABES | Prodotti Biologici ed Etici Siciliani", seoDescription: "Scopri ABES, il progetto agricolo de I Locandieri: prodotti biologici siciliani e agricoltura etica su terreni restituiti alla comunità." },
  { key: "eventi", title: "Eventi", seoTitle: "Eventi e Iniziative | I Locandieri", seoDescription: "Scopri eventi, attività e iniziative de I Locandieri: appuntamenti, informazioni e modalità di partecipazione." },
  { key: "news", title: "News", seoTitle: "News e Aggiornamenti | I Locandieri", seoDescription: "Progetti, iniziative, storie e aggiornamenti dal mondo de I Locandieri a Castelvetrano." },
  { key: "lavora-con-noi", title: "Lavora con noi", seoTitle: "Lavora con Noi | I Locandieri", seoDescription: "Conosci le attività de I Locandieri e presenta la tua candidatura spontanea alla cooperativa sociale." },
  // Not in dossier SEO table: sober defaults, editable in admin.
  { key: "contatti", title: "Contatti", seoTitle: "Contatti | I Locandieri", seoDescription: "Scrivi o chiama I Locandieri, cooperativa sociale di Castelvetrano: recapiti, indirizzo e modulo di contatto." },
  { key: "privacy", title: "Privacy", seoTitle: "Informativa privacy | I Locandieri", seoDescription: "Informativa sul trattamento dei dati personali de I Locandieri." },
  { key: "cookie", title: "Cookie Policy", seoTitle: "Cookie Policy | I Locandieri", seoDescription: "Informazioni sui cookie utilizzati dal sito de I Locandieri." },
];

async function seedPages() {
  let n = 0;
  for (const p of PAGES) {
    const r = await db.insert(schema.pages).values({ id: newId(), ...p }).onConflictDoNothing({ target: schema.pages.key }).returning({ id: schema.pages.id });
    n += r.length;
  }
  log(`pages: ${n} inserted`);
}

async function seedTemplates() {
  let n = 0;
  for (const [key, t] of Object.entries(getDefaultTemplates())) {
    const r = await db.insert(schema.emailTemplates).values({ key, subject: t.subject, body: t.body }).onConflictDoNothing({ target: schema.emailTemplates.key }).returning({ key: schema.emailTemplates.key });
    n += r.length;
  }
  log(`email templates: ${n} inserted`);
}

async function runModuleSeeds() {
  const dir = path.resolve("scripts/seed");
  const files = readdirSync(dir).filter((f) => /\.(ts|mts|js|mjs)$/.test(f) && !f.startsWith("_")).sort();
  const ctx: SeedContext = { db, schema, newId, log };
  for (const f of files) {
    const mod = (await import(pathToFileURL(path.join(dir, f)).href)) as { default?: SeedFn };
    if (typeof mod.default !== "function") throw new Error(`scripts/seed/${f} must export default an async function`);
    log(`module seed: ${f}`);
    await mod.default(ctx);
  }
}

try {
  await seedAdmin();
  await seedSettings();
  await seedPages();
  await seedTemplates();
  await runModuleSeeds();
  log("done.");
} finally {
  client.close();
}
