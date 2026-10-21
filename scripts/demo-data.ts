/**
 * MOCK data to show every admin feature (and fill the public pages): extra events in every state, registrations,
 * news, a media library, job openings with applications and CVs, contact messages, the email log.
 * Everything it creates is marked: slugs "demo-…", emails "@esempio.it", media/CV under "demo/", outbox keys "demo:".
 * Run after scripts/add-demo-events.ts:  npx tsx scripts/demo-data.ts
 * Remove before going live:              npx tsx scripts/demo-data.ts --remove   (then add-demo-events.ts --remove)
 * Idempotent: it does nothing if the demo data is already there.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { and, eq, inArray, like } from "drizzle-orm";
import { createDb } from "../src/lib/db";
import { newId } from "../src/lib/db/id";
import * as s from "../src/lib/db/schema";
import { PRIVACY_VERSION } from "../src/lib/careers/constants";
import { DEFAULT_FIELDS, saveFormFields } from "../src/lib/events/forms";
import { storageRoot } from "../src/lib/storage/local";

const NOW = Date.now();
const H = 3600_000, D = 24 * H;
const at = (iso: string) => new Date(iso).getTime();
const GIARDINO = "Giardino delle Arance, via delle Mimose, Castelvetrano";
const CAMPO = "Campo Unità d'Italia, via SS. Trinità, Castelvetrano";

// deterministic pseudo-random, so two runs give the same demo
let seed = 109;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)]!;

const FIRST = ["Giulia", "Marco", "Francesca", "Salvatore", "Chiara", "Giuseppe", "Martina", "Antonino", "Sara", "Vincenzo", "Alessia", "Calogero", "Federica", "Rosario", "Elena", "Gaspare", "Valentina", "Ignazio", "Roberta", "Nicolò", "Ilaria", "Baldassare", "Serena", "Fabio", "Daniela", "Pietro", "Aurora", "Matteo", "Noemi", "Leonardo"];
const LAST = ["Russo", "Bonanno", "Accardo", "Messina", "Giacalone", "Lombardo", "Catania", "Pipitone", "Bianco", "Marino", "Ferro", "Caradonna", "Asaro", "Stallone", "Barbera", "Gentile", "Ingoglia", "Calamia", "Saladino", "Vaccara", "Pace", "Tumbarello", "Clemente", "Lo Sciuto"];
const person = () => {
  const f = pick(FIRST), l = pick(LAST);
  const email = `${f}.${l}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z.]/g, "") + `${Math.floor(rnd() * 90) + 10}@esempio.it`;
  return { first: f, last: l, name: `${f} ${l}`, email, phone: `+39 3${Math.floor(rnd() * 9)}${String(Math.floor(rnd() * 1e8)).padStart(8, "0")}` };
};

// ---------- media library (copies of the photos already in public/foto) ----------
const PHOTOS: { file: string; alt: string; credit?: string }[] = [
  { file: "vasetti-abes.jpg", alt: "Vasetti ABES con l'etichetta, chiusi con tela di juta", credit: "ABES" },
  { file: "cassette-verdure.jpg", alt: "Cassette di verdure davanti al muro ABES", credit: "ABES" },
  { file: "abbracci-banco.jpg", alt: "Confezione di pasta Abbracci ABES su un tavolo di legno", credit: "ABES" },
  { file: "abbracci-pianta.jpg", alt: "Pasta Abbracci di Tumminia accanto a una pianta", credit: "ABES" },
  { file: "ceci-juta.jpg", alt: "Ceci in un sacco di juta", credit: "ABES" },
  { file: "stock/belice-uliveto.jpg", alt: "Uliveto nella valle del Belice", credit: "Pexels" },
  { file: "stock/campagna-sicilia.jpg", alt: "Campagna siciliana con muretti a secco", credit: "Pexels" },
  { file: "stock/castelvetrano-corso.jpg", alt: "Il corso di Castelvetrano", credit: "Pexels" },
  { file: "stock/selinunte.jpg", alt: "Il tempio di Selinunte", credit: "Pexels" },
  { file: "provvisorie/giardino-agrumeto-1000.webp", alt: "Filari dell'agrumeto al Giardino delle Arance", credit: "Pexels" },
  { file: "provvisorie/giardino-casolare-1000.webp", alt: "Il casolare in pietra del Giardino", credit: "Pexels" },
  { file: "provvisorie/giardino-laboratorio-1000.webp", alt: "Mani che preparano conserve in laboratorio", credit: "Pexels" },
  { file: "provvisorie/campo-attivita-1000.webp", alt: "Ragazzi che giocano a pallavolo all'aperto", credit: "Pexels" },
  { file: "provvisorie/chi-siamo-squadra-1000.webp", alt: "Un gruppo di persone al lavoro insieme", credit: "Pexels" },
  { file: "provvisorie/tradizione-pane-1000.webp", alt: "Pane di grano duro appena sfornato", credit: "Pexels" },
  { file: "provvisorie/tradizione-grano-1000.webp", alt: "Spighe di grano al sole", credit: "Pexels" },
  { file: "provvisorie/accoglienza-casa-1000.webp", alt: "Una tavola apparecchiata in una casa accogliente", credit: "Pexels" },
  { file: "provvisorie/lavora-squadra-1000.webp", alt: "Persone che lavorano in un campo", credit: "Pexels" },
];

function dims(file: string) {
  try {
    const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
    return { width: Number(/pixelWidth: (\d+)/.exec(out)?.[1]) || null, height: Number(/pixelHeight: (\d+)/.exec(out)?.[1]) || null };
  } catch {
    return { width: null, height: null };
  }
}

// ---------- extra events (every state and registration mode) ----------
type Ev = {
  slug: string; cat: string; title: string; summary: string; body: string; startsAt: number; endsAt?: number; location: string;
  audience?: string; status: "draft" | "published" | "hidden"; featured?: boolean;
  mode?: "open" | "limited" | "approval" | "reserved"; capacity?: number; maxSeats?: number; criteria?: string; regs?: number;
};
const EXTRA: Ev[] = [
  {
    slug: "demo-cena-sociale-casolare", cat: "comunita", status: "published", featured: true,
    title: "Cena sociale al casolare", summary: "Una cena lunga sotto il pergolato, cucinata con l'orto del Giardino. Il ricavato sostiene la comunità alloggio.",
    body: "<p>Tavolate sotto il pergolato, verdure dell'orto biologico, pasta di Tumminia e dolci di arance. Cucinano i ragazzi del laboratorio insieme ai volontari.</p><p>Le richieste vengono confermate una per una: i posti a tavola sono contati.</p>",
    startsAt: at("2026-11-21T20:00:00+01:00"), endsAt: at("2026-11-21T23:00:00+01:00"), location: GIARDINO, audience: "Per tutti",
    mode: "approval", capacity: 60, maxSeats: 6, regs: 22,
  },
  {
    slug: "demo-torneo-pallavolo-legalita", cat: "sport", status: "published",
    title: "Torneo di pallavolo per la legalità", summary: "Squadre miste di scuole e associazioni, sul campo nato da un terreno confiscato.",
    body: "<p>Una giornata intera di partite brevi, squadre miste, arbitri dell'associazione. Tra un set e l'altro si racconta la storia del campo.</p>",
    startsAt: at("2026-12-06T09:00:00+01:00"), endsAt: at("2026-12-06T17:00:00+01:00"), location: CAMPO, audience: "Squadre di 6 persone, dai 14 anni",
    mode: "limited", capacity: 48, maxSeats: 6, regs: 9,
  },
  {
    slug: "demo-incontro-scuole-beni-confiscati", cat: "comunita", status: "published",
    title: "A scuola di beni confiscati", summary: "Visita guidata al Giardino per le classi: cos'è un bene confiscato e come torna a lavorare.",
    body: "<p>Un percorso di due ore tra agrumeto, orto e laboratorio, con un racconto della legge 109/96 adatto all'età della classe.</p>",
    startsAt: at("2026-11-18T09:30:00+01:00"), endsAt: at("2026-11-18T11:30:00+01:00"), location: GIARDINO, audience: "Classi delle scuole del territorio",
    mode: "reserved", capacity: 75, maxSeats: 30, criteria: "Docenti delle scuole di Castelvetrano e dei comuni vicini, con la propria classe", regs: 4,
  },
  {
    slug: "demo-festa-raccolto-estate", cat: "giardino", status: "published",
    title: "Festa del raccolto d'estate", summary: "Musica, pane cotto a legna e i primi vasetti della stagione.",
    body: "<p>Una sera d'estate per festeggiare il raccolto con chi ha lavorato nei campi e con il quartiere.</p>",
    startsAt: at("2026-07-11T19:00:00+02:00"), endsAt: at("2026-07-11T23:30:00+02:00"), location: GIARDINO, audience: "Per tutti",
    mode: "open", maxSeats: 5, regs: 26,
  },
  {
    slug: "demo-potatura-agrumi", cat: "giardino", status: "draft",
    title: "Impariamo a potare gli agrumi", summary: "Laboratorio pratico con l'agronomo: come e quando potare arance e limoni.",
    body: "<p>Bozza: confermare la data con l'agronomo e il numero di forbici disponibili.</p>",
    startsAt: at("2027-02-13T09:30:00+01:00"), location: GIARDINO, mode: "limited", capacity: 15, maxSeats: 2,
  },
  {
    slug: "demo-giornata-volontari", cat: "comunita", status: "hidden",
    title: "Giornata dei volontari", summary: "Una giornata di lavori al Giardino riservata a chi è già volontario.",
    body: "<p>Evento nascosto: raggiungibile solo dal link inviato ai volontari.</p>",
    startsAt: at("2026-12-20T09:00:00+01:00"), location: GIARDINO, mode: "open", maxSeats: 2, regs: 7,
  },
];
const REGS_FOR_BASE: Record<string, number> = { "demo-raccolta-arance-giardino": 18, "demo-open-day-pallavolo": 14 };

// ---------- news ----------
const NEWS: { slug: string; cat: string; title: string; excerpt: string; body: string; status: "draft" | "published"; daysAgo: number; featured?: boolean; cover: number }[] = [
  { slug: "demo-vendemmia-arance-2026", cat: "progetti", status: "published", daysAgo: 4, featured: true, cover: 9,
    title: "Al Giardino è iniziata la raccolta delle arance", excerpt: "Due ettari di agrumeto, otto persone in campo, le prime cassette già nel laboratorio.",
    body: "<p>Con le prime giornate fresche di ottobre è partita la raccolta. Quest'anno in campo ci sono otto persone, tre delle quali al primo anno di inserimento lavorativo.</p><p>Le arance più belle vanno in cassetta, le altre diventano marmellata nel laboratorio del casolare.</p>" },
  { slug: "demo-nuovi-vasetti-abes", cat: "progetti", status: "published", daysAgo: 11, cover: 0,
    title: "Tre nuovi vasetti ABES in negozio", excerpt: "Cipollata in agrodolce, pesto di finocchietto e marmellata di arance del Giardino.",
    body: "<p>Il laboratorio ha chiuso la stagione estiva con tre ricette nuove. Si trovano già su abes.bio.</p>" },
  { slug: "demo-campo-nuove-reti", cat: "territorio", status: "published", daysAgo: 19, cover: 12,
    title: "Nuove reti e nuovi palloni al campo Unità d'Italia", excerpt: "Grazie alla raccolta fondi di primavera il campo ha attrezzature nuove per la stagione.",
    body: "<p>Reti, palloni e un armadietto per le divise: piccole cose che permettono di allenare due squadre in più.</p>" },
  { slug: "demo-tirocini-agricoltura", cat: "beni-confiscati", status: "published", daysAgo: 33, cover: 17,
    title: "Sei tirocini in agricoltura biologica", excerpt: "Il progetto con il centro per l'impiego si chiude con quattro contratti stagionali.",
    body: "<p>Sei mesi di tirocinio tra orto, agrumeto e laboratorio. Quattro tirocinanti continuano con noi per la stagione invernale.</p>" },
  { slug: "demo-bilancio-sociale-2026", cat: "progetti", status: "draft", daysAgo: 1, cover: 13,
    title: "Il bilancio sociale 2026, in breve", excerpt: "Persone accolte, ore di lavoro, chili raccolti: i numeri dell'anno (bozza).",
    body: "<p>Bozza da completare con i dati definitivi dell'ufficio amministrativo.</p>" },
  { slug: "demo-intervista-chef", cat: "territorio", status: "draft", daysAgo: 2, cover: 14,
    title: "La pasta di Tumminia nelle cucine di Selinunte", excerpt: "Intervista a una chef che usa le busiate ABES nel suo menu (bozza).",
    body: "<p>Testo dell'intervista da rivedere con l'intervistata prima della pubblicazione.</p>" },
];

// ---------- careers ----------
const OPENINGS = [
  { slug: "demo-operatore-agricolo", title: "Operatrice/operatore agricolo", status: "open" as const, description: "<p>Lavoro in campo tra orto biologico e agrumeto, da novembre a giugno. Patente B.</p>" },
  { slug: "demo-educatore-comunita", title: "Educatrice/educatore per la comunità alloggio", status: "open" as const, description: "<p>Turni in comunità con ragazzi dai 14 ai 18 anni. Laurea in scienze dell'educazione o equivalente.</p>" },
  { slug: "demo-allenatore-pallavolo", title: "Allenatrice/allenatore di pallavolo", status: "open" as const, description: "<p>Due pomeriggi a settimana al campo Unità d'Italia. Tesserino FIPAV.</p>" },
  { slug: "demo-addetto-laboratorio", title: "Addetta/addetto al laboratorio conserve", status: "closed" as const, description: "<p>Posizione coperta per la stagione estiva.</p>" },
];
const APPLY_MSGS = [
  "Ho lavorato due stagioni nella raccolta delle olive e vorrei continuare nel biologico.",
  "Sono educatrice da sei anni, ho lavorato in una comunità per minori a Mazara del Vallo.",
  "Alleno l'under 14 della mia città, vorrei dare una mano anche al vostro campo.",
  "Mi piacerebbe fare volontariato nel fine settimana e poi, se possibile, lavorare con voi.",
  "Ho un diploma da perito agrario e sto cercando un lavoro vicino a casa.",
  "Conosco bene la cucina tradizionale e ho fatto un corso HACCP quest'anno.",
  "Mi occupo di comunicazione per associazioni, posso aiutarvi con social ed eventi.",
  "Ho seguito il vostro progetto sui beni confiscati e vorrei farne parte.",
];

// ---------- contact messages ----------
const MESSAGES = [
  { subject: "Visita con la classe", message: "Buongiorno, sono insegnante di una terza media. Possiamo venire a visitare il Giardino con 22 ragazzi a fine novembre?" },
  { subject: "Ordine per un'azienda", message: "Vorremmo regalare ai dipendenti delle confezioni ABES per Natale, circa 40 pezzi. Fate prezzi per quantità?" },
  { subject: "Volontariato", message: "Ciao! Sono uno studente di agraria, vorrei fare qualche giornata di volontariato al Giardino. Come posso fare?" },
  { subject: "Informazioni pallavolo", message: "Mia figlia ha 9 anni e vorrebbe iniziare pallavolo. In che giorni vi allenate?" },
  { subject: "Intervista per un giornale locale", message: "Scrivo per un giornale online di Trapani: possiamo fare un'intervista sul progetto del campo?" },
  { subject: "Donazione attrezzi", message: "Abbiamo delle cassette e degli attrezzi agricoli in buono stato da regalare. Vi possono servire?" },
  { subject: "Spedizione all'estero", message: "Vivo in Germania, è possibile ricevere i vasetti ABES qui?" },
  { subject: "Collaborazione con la parrocchia", message: "Organizziamo un pranzo solidale a dicembre e ci piacerebbe usare i vostri prodotti. Possiamo sentirci?" },
  { subject: "Tirocinio universitario", message: "Studio servizio sociale a Palermo, cerco una struttura per il tirocinio del terzo anno." },
  { subject: "Complimenti", message: "Sono passata al mercatino di ottobre: prodotti buonissimi e persone splendide. Grazie!" },
];

const PDF = (who: string) => {
  const text = `Curriculum vitae - ${who} (documento di prova)`;
  const stream = `BT /F1 18 Tf 60 760 Td (${text.replace(/[()\\]/g, "")}) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offs: number[] = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
};

async function main() {
  const { client, db } = createDb();
  const pubDir = path.join(storageRoot(), "public-media", "demo");
  const privDir = path.join(storageRoot(), "private", "demo");

  if (process.argv.includes("--remove")) {
    const demoEvents = await db.select({ id: s.events.id }).from(s.events).where(like(s.events.slug, "demo-%"));
    if (demoEvents.length) await db.delete(s.registrations).where(inArray(s.registrations.eventId, demoEvents.map((e) => e.id)));
    await db.delete(s.events).where(and(like(s.events.slug, "demo-%"), inArray(s.events.slug, EXTRA.map((e) => e.slug))));
    await db.delete(s.news).where(like(s.news.slug, "demo-%"));
    await db.delete(s.applications).where(like(s.applications.email, "%@esempio.it"));
    await db.delete(s.jobOpenings).where(like(s.jobOpenings.slug, "demo-%"));
    await db.delete(s.contactMessages).where(like(s.contactMessages.email, "%@esempio.it"));
    await db.delete(s.emailOutbox).where(like(s.emailOutbox.idempotencyKey, "demo:%"));
    await db.delete(s.media).where(like(s.media.path, "demo/%"));
    rmSync(pubDir, { recursive: true, force: true });
    rmSync(privDir, { recursive: true, force: true });
    console.log("demo data removed (base demo events: npx tsx scripts/add-demo-events.ts --remove)");
    client.close();
    return;
  }

  if (await db.select({ id: s.media.id }).from(s.media).where(like(s.media.path, "demo/%")).get()) {
    console.log("demo data already there: run with --remove first to recreate it");
    client.close();
    return;
  }

  // media
  mkdirSync(pubDir, { recursive: true });
  const mediaIds: string[] = [];
  for (const [i, p] of PHOTOS.entries()) {
    const src = path.join("public/foto", p.file);
    const name = path.basename(p.file);
    copyFileSync(src, path.join(pubDir, name));
    const id = newId();
    const { size } = await import("node:fs").then((fs) => fs.statSync(src));
    await db.insert(s.media).values({ id, path: `demo/${name}`, mime: name.endsWith(".webp") ? "image/webp" : "image/jpeg", size, ...dims(src), alt: p.alt, credit: p.credit ?? null, createdAt: NOW - (PHOTOS.length - i) * 2 * D });
    mediaIds.push(id);
  }
  console.log("media", mediaIds.length);

  // events
  const cat = Object.fromEntries((await db.select().from(s.eventCategories)).map((c) => [c.slug, c.id]));
  const covers = [9, 12, 11, 15, 16, 13];
  for (const [i, e] of EXTRA.entries()) {
    await db.insert(s.events).values({
      id: newId(), slug: e.slug, title: e.title, summary: e.summary, body: e.body, startsAt: e.startsAt, endsAt: e.endsAt ?? null,
      location: e.location, audience: e.audience ?? null, categoryId: cat[e.cat] ?? null, status: e.status, featured: !!e.featured,
      coverId: mediaIds[covers[i % covers.length]!], ctaType: "registration", registrationMode: e.mode ?? null, capacity: e.capacity ?? null,
      maxSeatsPerRequest: e.maxSeats ?? 1, pendingHoldsSeats: e.mode === "approval", reservedCriteria: e.criteria ?? null,
      reservedVerification: e.mode === "reserved" ? "manual" : null, registrationOpensAt: NOW - 30 * D, registrationClosesAt: e.startsAt - 6 * H,
      seoTitle: e.title.slice(0, 70), seoDescription: e.summary.slice(0, 170),
    });
  }
  // covers for the base demo events too
  const base = await db.select({ id: s.events.id, slug: s.events.slug }).from(s.events).where(like(s.events.slug, "demo-%"));
  const baseCover: Record<string, number> = { "demo-raccolta-arance-giardino": 9, "demo-open-day-pallavolo": 12, "demo-laboratorio-conserve-abes": 11, "demo-mercatino-abes-natale": 0 };
  for (const b of base) if (baseCover[b.slug] !== undefined) await db.update(s.events).set({ coverId: mediaIds[baseCover[b.slug]!] }).where(eq(s.events.id, b.id));

  // registrations
  const all = await db.select().from(s.events).where(like(s.events.slug, "demo-%"));
  let regCount = 0;
  for (const ev of all) {
    const n = EXTRA.find((e) => e.slug === ev.slug)?.regs ?? REGS_FOR_BASE[ev.slug] ?? 0;
    if (!n || !ev.registrationMode) continue;
    const { version } = await saveFormFields(ev.id, DEFAULT_FIELDS, ev.registrationMode, db);
    let confirmed = 0, held = 0;
    const used = new Set<string>();
    for (let k = 0; k < n; k++) {
      const p = person();
      if (used.has(p.email)) continue;
      used.add(p.email);
      const seats = Math.max(1, Math.min(ev.maxSeatsPerRequest, 1 + Math.floor(rnd() * ev.maxSeatsPerRequest)));
      const past = ev.startsAt < NOW;
      const r = rnd();
      const status: "pending" | "confirmed" | "rejected" | "cancelled" =
        ev.registrationMode === "approval" || ev.registrationMode === "reserved"
          ? r < 0.45 ? "pending" : r < 0.88 ? "confirmed" : "rejected"
          : r < 0.9 || past ? "confirmed" : "cancelled";
      if (ev.capacity && status === "confirmed" && confirmed + seats > ev.capacity) continue;
      if (status === "confirmed") confirmed += seats;
      if (status === "pending" && ev.pendingHoldsSeats) held += seats;
      const createdAt = Math.min(NOW - 20 * 60_000, ev.startsAt - D) - Math.floor(rnd() * 14 * D);
      const answers = [
        { fieldId: "name", label: "Nome e cognome", value: p.name },
        { fieldId: "email", label: "Email", value: p.email },
        { fieldId: "phone", label: "Telefono", value: p.phone },
        ...(ev.registrationMode === "reserved" ? [{ fieldId: "requisito", label: "Requisito di partecipazione", value: `Docente di ${pick(["lettere", "scienze", "storia", "matematica"])}, classe ${pick(["2ª B", "3ª A", "1ª C", "3ª D"])} della scuola media ${pick(["Pappalardo", "Gennaro Pardo", "Lombardo Radice"])}` }] : []),
      ];
      await db.insert(s.registrations).values({
        id: newId(), eventId: ev.id, formVersionId: version.id, status, seats, name: p.name, email: p.email, emailNormalized: p.email, phone: p.phone, answers,
        dedupeKey: status === "pending" || status === "confirmed" ? `${ev.id}:${p.email}` : null,
        adminNote: status === "rejected" ? "Posti esauriti per la fascia d'età indicata." : null,
        decidedAt: status === "pending" ? null : createdAt + 5 * H, decidedBy: status === "pending" ? null : "Amministratore", createdAt,
      });
      regCount++;
    }
    await db.update(s.events).set({ seatsConfirmed: confirmed, seatsHeld: held }).where(eq(s.events.id, ev.id));
  }
  // a few fresh ones, in the last hours (they show up first on the dashboard)
  const cena = all.find((e) => e.slug === "demo-cena-sociale-casolare");
  if (cena) {
    const { version } = await saveFormFields(cena.id, DEFAULT_FIELDS, "approval", db);
    for (const mins of [12, 95, 260]) {
      const p = person();
      await db.insert(s.registrations).values({ id: newId(), eventId: cena.id, formVersionId: version.id, status: "pending", seats: 2, name: p.name, email: p.email, emailNormalized: p.email, phone: p.phone, answers: [{ fieldId: "name", label: "Nome e cognome", value: p.name }, { fieldId: "email", label: "Email", value: p.email }], dedupeKey: `${cena.id}:${p.email}`, createdAt: NOW - mins * 60_000 });
      regCount++;
    }
  }
  console.log("registrations", regCount);

  // news
  const ncat = Object.fromEntries((await db.select().from(s.newsCategories)).map((c) => [c.slug ?? c.name, c.id]));
  const ncatBy = (k: string) => ncat[k] ?? Object.values(ncat)[0] ?? null;
  for (const n of NEWS) {
    const t = NOW - n.daysAgo * D;
    await db.insert(s.news).values({
      id: newId(), slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body, status: n.status, featured: !!n.featured, coverId: mediaIds[n.cover],
      categoryId: ncatBy(n.cat), publishedAt: n.status === "published" ? t : null, createdAt: t - D, updatedAt: t,
      seoTitle: n.title.slice(0, 70), seoDescription: n.excerpt.slice(0, 170),
    });
  }
  console.log("news", NEWS.length);

  // careers
  const openingIds: string[] = [];
  for (const [i, o] of OPENINGS.entries()) {
    const id = newId();
    await db.insert(s.jobOpenings).values({ id, ...o, createdAt: NOW - (40 - i * 6) * D });
    openingIds.push(id);
  }
  mkdirSync(privDir, { recursive: true });
  const AREA = ["Agricoltura biologica", "Educazione e formazione", "Sport e attività all'aperto", "Agricoltura biologica", "Accoglienza", "Comunicazione ed eventi", "Iniziative sociali e territoriali", "Educazione e formazione", "Altro", "Amministrazione e organizzazione", "Agricoltura biologica"];
  for (let i = 0; i < AREA.length; i++) {
    const p = person();
    const createdAt = NOW - (i < 3 ? (i + 1) * 5 * H : i * 2.5 * D);
    const cv = i % 4 !== 3;
    const file = `demo/cv-${i + 1}.pdf`;
    if (cv) writeFileSync(path.join(storageRoot(), "private", file), PDF(p.name));
    await db.insert(s.applications).values({
      id: newId(), firstName: p.first, lastName: p.last, email: p.email, phone: p.phone, area: AREA[i]!,
      openingId: i < 8 ? openingIds[i % 3] : null, message: APPLY_MSGS[i % APPLY_MSGS.length]!,
      cvPath: cv ? file : null, cvName: cv ? `CV_${p.last.replace(/\s/g, "")}_${p.first}.pdf` : null, cvMime: cv ? "application/pdf" : null, cvSize: cv ? PDF(p.name).length : null,
      privacyAcceptedAt: createdAt, privacyVersion: PRIVACY_VERSION, status: i < 3 ? "new" : i < 8 ? "reviewing" : "archived", createdAt,
    });
  }
  console.log("applications", AREA.length);

  // contact messages
  for (const [i, m] of MESSAGES.entries()) {
    const p = person();
    await db.insert(s.contactMessages).values({ id: newId(), name: p.name, email: p.email, subject: m.subject, message: m.message, status: i < 4 ? "new" : "handled", createdAt: NOW - (i < 4 ? (i + 1) * 3 * H + 40 * 60_000 : i * 1.7 * D) });
  }
  console.log("messages", MESSAGES.length);

  // email log
  const regs = await db.select({ name: s.registrations.name, email: s.registrations.email, status: s.registrations.status, at: s.registrations.createdAt, ev: s.events.title }).from(s.registrations).innerJoin(s.events, eq(s.events.id, s.registrations.eventId)).where(like(s.registrations.email, "%@esempio.it")).limit(24);
  let ok = 0;
  for (const [i, r] of regs.entries()) {
    const subject = r.status === "pending" ? `Richiesta ricevuta, in attesa di conferma: ${r.ev}` : r.status === "rejected" ? `Richiesta non accolta: ${r.ev}` : `Iscrizione confermata: ${r.ev}`;
    const status = i === 2 || i === 9 ? "failed" : i === 15 ? "not_configured" : "sent";
    await db.insert(s.emailOutbox).values({
      id: newId(), idempotencyKey: `demo:${i}`, to: r.email, subject, text: `Ciao ${r.name.split(" ")[0]},\n\n${subject}.\n\nA presto,\nI Locandieri`,
      status, attempts: status === "failed" ? 3 : 1, lastError: status === "failed" ? "550 5.1.1 Mailbox unavailable" : null,
      sentAt: status === "sent" ? r.at + 60_000 : null, createdAt: r.at + 30_000,
    });
    if (status === "sent") ok++;
  }
  console.log("emails", regs.length, `(${ok} sent)`);

  client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
