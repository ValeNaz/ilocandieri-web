// QA helper (NOT part of the e2e suite): fills a LOCAL qa database through the admin UI with sample content
// (one event per type, one news with cover). Usage: see docs/QA_CHECKLIST.md. Never run against production.
import { chromium } from "@playwright/test";
import { createClient } from "@libsql/client";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.QA_URL || "http://localhost:3301";
const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD;
const dbUrl = process.env.DATABASE_URL;
if (!email || !password || !dbUrl?.includes("qa")) throw new Error("Refusing to run: set qa env (DATABASE_URL must contain 'qa').");

const browser = await chromium.launch();
const page = await (await browser.newContext({ baseURL: base })).newPage();
page.setDefaultTimeout(30000);

// generated sample "photos" (soft landscape gradients) saved in a temp dir
mkdirSync("data/qa-tmp", { recursive: true });
const tones = [["#d9a05b", "#7d8f5a"], ["#c4623f", "#f2e3c6"], ["#8aa07a", "#e9c46a"]];
for (const [i, [a, b]] of tones.entries()) {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.setContent(`<body style="margin:0;height:1000px;background:radial-gradient(circle at 70% 30%,${b},transparent 55%),linear-gradient(160deg,${a},#3d4a2c)"></body>`);
  writeFileSync(`data/qa-tmp/foto${i + 1}.jpg`, await page.screenshot({ type: "jpeg", quality: 82 }));
}

await page.goto("/admin/login");
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill(password);
await page.getByRole("button", { name: "Accedi" }).click();
await page.waitForURL(/\/admin$/);

for (const [i, alt] of ["Paesaggio di campagna al tramonto", "Tavola all'aperto tra gli ulivi", "Campi coltivati in primavera"].entries()) {
  await page.goto("/admin/media");
  await page.locator("#file").setInputFiles(`data/qa-tmp/foto${i + 1}.jpg`);
  await page.getByLabel(/Descrizione dell'immagine/).fill(alt);
  await page.getByRole("button", { name: "Carica immagine" }).click();
  await page.getByText(/caricata|Immagine/i).first().waitFor();
}

const events = [
  { title: "Serata di racconti in cascina", summary: "Una serata di letture e musica tra i campi, aperta a tutti.", start: "2026-11-14T19:00", cta: "email", target: "info@example.test", status: "published", featured: true },
  { title: "Laboratorio di cucina contadina", summary: "Impastiamo insieme: ti basta scrivere su WhatsApp per un posto.", start: "2026-11-21T16:00", cta: "whatsapp", target: "+39 331 1234567", status: "published" },
  { title: "Giornata aperta ai campi", summary: "Visita libera ai laboratori e ai campi, programma completo sul sito partner.", start: "2026-12-05T10:00", cta: "external_link", target: "https://abes.bio/", status: "published" },
  { title: "Merenda in fattoria per famiglie", summary: "Iscrizione libera: porta i bambini a conoscere gli animali.", start: "2026-12-12T15:30", cta: "registration", mode: "open", status: "published" },
  { title: "Corso di orto sinergico (posti limitati)", summary: "Sei incontri pratici con capienza limitata a 12 persone.", start: "2027-01-16T09:30", cta: "registration", mode: "limited", capacity: "12", status: "published" },
  { title: "Cena sociale con approvazione", summary: "Le richieste vengono valutate dall'organizzazione.", start: "2027-01-30T20:00", cta: "registration", mode: "approval", capacity: "30", status: "published" },
  { title: "Incontro riservato ai soci", summary: "Evento riservato: la partecipazione è verificata manualmente.", start: "2027-02-06T18:00", cta: "registration", mode: "reserved", reserved: "Soci e partner della cooperativa: controlliamo l'elenco prima di confermare.", status: "published" },
  { title: "Festa di fine estate", summary: "Evento già concluso, resta consultabile nell'archivio.", start: "2026-09-12T18:00", cta: "none", status: "published" },
];
for (const e of events) {
  await page.goto("/admin/eventi/nuovo");
  await page.locator("[name=title]").fill(e.title);
  await page.locator("[name=summary]").fill(e.summary);
  await page.getByLabel("Inizio").fill(e.start);
  await page.getByLabel("Luogo").fill("Castelvetrano (TP)");
  await page.locator("[name=status]").selectOption(e.status);
  await page.getByLabel("Cosa possono fare i visitatori?").selectOption(e.cta);
  if (e.target) await page.locator("[name=ctaTarget]").fill(e.target);
  if (e.mode) await page.locator("[name=registrationMode]").selectOption(e.mode);
  if (e.capacity) await page.locator("[name=capacity]").fill(e.capacity);
  if (e.reserved) await page.locator("[name=reservedCriteria]").fill(e.reserved);
  if (e.featured) await page.locator("[name=featured]").check();
  await page.getByRole("button", { name: "Crea evento" }).click();
  await page.waitForURL(/\/admin\/eventi\/[a-z0-9]{20,}$/);
}

// covers for some events, set directly in the qa db (the picker is exercised by e2e)
const db = createClient({ url: dbUrl });
const media = (await db.execute("select id from media order by created_at")).rows.map((r) => r.id);
const evs = (await db.execute("select id from events order by starts_at")).rows;
for (const [i, r] of evs.entries()) if (i % 2 === 0) await db.execute({ sql: "update events set cover_id=? where id=?", args: [media[i % media.length], r.id] });

// news with uploaded cover
await page.goto("/admin/news/nuova");
await page.locator("#title").fill("Come nasce la nostra rete di ospitalità");
await page.getByLabel("Introduzione").fill("Un racconto dei primi passi, dei luoghi e delle persone che la animano.");
const editor = page.getByRole("textbox", { name: "Testo dell'articolo" });
await editor.click();
await page.keyboard.type("Tutto è partito da un tavolo lungo e da molte storie condivise. Oggi la rete accoglie gruppi, scuole e viaggiatori curiosi.");
await page.locator("#coverFile").setInputFiles("data/qa-tmp/foto2.jpg");
await page.locator("[name=coverAlt]").fill("Tavolata all'aperto tra gli ulivi");
await page.getByRole("button", { name: "Pubblica", exact: true }).click();
await page.waitForURL(/\/admin\/news\/(?!nuova)[a-z0-9]+$/);
await browser.close();
console.log("qa data created");
