/**
 * Demo events to preview the Events pages. The future ones are MOCK (slug prefix "demo-"): remove them before going live
 * with `npx tsx scripts/add-demo-events.ts --remove`. The past one (Libera, 7 March 2026) is a real event, see the news.
 * Idempotent: skips slugs that exist. Run: npx tsx scripts/add-demo-events.ts
 */
import { eq, like } from "drizzle-orm";
import { createDb } from "../src/lib/db";
import { newId } from "../src/lib/db/id";
import { eventCategories, events } from "../src/lib/db/schema";
import { DEFAULT_FIELDS, saveFormFields } from "../src/lib/events/forms";

const at = (iso: string) => new Date(iso).getTime();
const GIARDINO = "Giardino delle Arance, via delle Mimose, Castelvetrano";
const CAMPO = "Campo Unità d'Italia, via SS. Trinità, Castelvetrano";

const CATEGORIES = [
  { slug: "giardino", name: "Giardino" },
  { slug: "sport", name: "Sport" },
  { slug: "abes", name: "ABES" },
  { slug: "comunita", name: "Comunità" },
];

type Ev = {
  slug: string; category: string; title: string; summary: string; body: string; startsAt: number; endsAt?: number;
  location: string; audience?: string; featured?: boolean;
  ctaType: "none" | "contact" | "registration"; ctaLabel?: string; ctaTarget?: string;
  registrationMode?: "open" | "limited"; capacity?: number; maxSeats?: number; closesAt?: number;
};

const EVENTS: Ev[] = [
  {
    slug: "demo-raccolta-arance-giardino",
    category: "giardino",
    featured: true,
    title: "Una mattina di raccolta al Giardino delle Arance",
    summary: "Si raccolgono le arance insieme ai ragazzi della comunità. Cassette, forbici e guanti li mettiamo noi.",
    body: `<p>La mattina si passa tra i filari dell'agrumeto: si raccoglie, si riempiono le cassette, si portano al casolare. Lavorerete accanto ai ragazzi della comunità alloggio e a chi coltiva il Giardino ogni giorno.</p>
<p>Alla fine, pane e arance per tutti sotto gli alberi. Portate scarpe chiuse e vestiti che si possono sporcare.</p>`,
    startsAt: at("2026-11-14T09:30:00+01:00"),
    endsAt: at("2026-11-14T12:30:00+01:00"),
    location: GIARDINO,
    audience: "Famiglie e gruppi, bambini dai 6 anni accompagnati",
    ctaType: "registration",
    registrationMode: "limited",
    capacity: 30,
    maxSeats: 4,
    closesAt: at("2026-11-13T18:00:00+01:00"),
  },
  {
    slug: "demo-open-day-pallavolo",
    category: "sport",
    title: "Open day al campo: prova la pallavolo",
    summary: "Un pomeriggio per provare la pallavolo con i nostri allenatori. Per ragazze e ragazzi dai 6 ai 17 anni.",
    body: `<p>Il campo Unità d'Italia nasce su un terreno confiscato. Oggi ci si gioca a pallavolo e si fa avviamento allo sport.</p>
<p>All'open day si prova un allenamento vero: riscaldamento, palleggio, battuta, una partita breve. I genitori possono restare a bordo campo. Bastano scarpe da ginnastica e una borraccia.</p>`,
    startsAt: at("2026-11-08T15:30:00+01:00"),
    endsAt: at("2026-11-08T17:30:00+01:00"),
    location: CAMPO,
    audience: "Ragazze e ragazzi dai 6 ai 17 anni",
    ctaType: "registration",
    registrationMode: "open",
    maxSeats: 3,
    closesAt: at("2026-11-08T12:00:00+01:00"),
  },
  {
    slug: "demo-laboratorio-conserve-abes",
    category: "abes",
    title: "Laboratorio: dalla cassetta al barattolo",
    summary: "Nel laboratorio del Giardino si prepara una conserva ABES, dal pomodoro lavato al vasetto chiuso.",
    body: `<p>Un pomeriggio nel laboratorio di trasformazione del casolare. Si lavano e si tagliano le verdure dell'orto biologico, si cuoce, si invasa, si chiude.</p>
<p>Ognuno porta a casa il proprio vasetto, con l'etichetta scritta a mano. Posti pochi, perché in cucina si lavora vicini.</p>`,
    startsAt: at("2026-11-28T15:00:00+01:00"),
    endsAt: at("2026-11-28T18:00:00+01:00"),
    location: GIARDINO,
    audience: "Adulti e ragazzi dai 14 anni",
    ctaType: "contact",
    ctaLabel: "Chiedi un posto",
  },
  {
    slug: "demo-mercatino-abes-natale",
    category: "comunita",
    title: "Mercatino ABES al Giardino",
    summary: "Sughi, conserve, pasta di Tumminia e arance del Giardino, direttamente da chi li fa. Ingresso libero.",
    body: `<p>Una domenica di dicembre il cortile del casolare diventa un mercato. Trovate i prodotti ABES e le arance appena raccolte, e potete chiedere a chi li coltiva come nascono.</p>
<p>Non serve prenotare: venite quando volete, tra le 10 e le 18.</p>`,
    startsAt: at("2026-12-13T10:00:00+01:00"),
    endsAt: at("2026-12-13T18:00:00+01:00"),
    location: GIARDINO,
    audience: "Per tutti",
    ctaType: "none",
  },
  {
    slug: "libera-109-piazze-giardino-delle-arance",
    category: "comunita",
    title: "109 piazze per la legge 109: Libera al Giardino",
    summary: "Il presidio di Libera di Castelvetrano celebra i trent'anni della legge sui beni confiscati al Giardino delle Arance.",
    body: `<p>Nell'ambito della campagna nazionale "Fame di verità e giustizia", il presidio territoriale di Libera raccoglie le cartoline da inviare al Governo per chiedere che una parte dei beni sottratti alle mafie torni ai territori.</p>`,
    startsAt: at("2026-03-07T09:30:00+01:00"),
    endsAt: at("2026-03-07T12:30:00+01:00"),
    location: GIARDINO,
    audience: "Per tutti",
    ctaType: "none",
  },
];

async function main() {
  const { client, db } = createDb();
  if (process.argv.includes("--remove")) {
    const r = await db.delete(events).where(like(events.slug, "demo-%"));
    console.log("removed demo events", r.rowsAffected);
    client.close();
    return;
  }
  const cat: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const found = await db.select().from(eventCategories).where(eq(eventCategories.slug, c.slug)).get();
    cat[c.slug] = found?.id ?? newId();
    if (!found) await db.insert(eventCategories).values({ id: cat[c.slug]!, ...c });
  }
  for (const e of EVENTS) {
    if (await db.select({ id: events.id }).from(events).where(eq(events.slug, e.slug)).get()) { console.log("skip", e.slug); continue; }
    const id = newId();
    await db.insert(events).values({
      id, slug: e.slug, title: e.title, summary: e.summary, body: e.body, startsAt: e.startsAt, endsAt: e.endsAt ?? null,
      location: e.location, audience: e.audience ?? null, categoryId: cat[e.category], status: "published", featured: !!e.featured,
      ctaType: e.ctaType, ctaLabel: e.ctaLabel ?? null, ctaTarget: e.ctaTarget ?? null,
      registrationMode: e.registrationMode ?? null, capacity: e.capacity ?? null, maxSeatsPerRequest: e.maxSeats ?? 1,
      registrationOpensAt: e.ctaType === "registration" ? Date.now() : null, registrationClosesAt: e.closesAt ?? null,
      seoTitle: e.title.slice(0, 70), seoDescription: e.summary.slice(0, 170),
    });
    if (e.ctaType === "registration") await saveFormFields(id, DEFAULT_FIELDS, e.registrationMode ?? null, db);
    console.log("added", e.slug);
  }
  client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
