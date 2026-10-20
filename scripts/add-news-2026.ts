/**
 * Adds four real, sourced news items (2026) to the news table, with their categories.
 * Every fact comes from the linked sources (listed at the end of each article). Idempotent: skips slugs that exist.
 * Run: npx tsx scripts/add-news-2026.ts
 */
import { eq } from "drizzle-orm";
import { createDb } from "../src/lib/db";
import { newId } from "../src/lib/db/id";
import { news, newsCategories } from "../src/lib/db/schema";
import { cleanNewsBody } from "../src/lib/news/body";

const at = (iso: string) => new Date(iso).getTime();
const src = (items: [string, string][]) => `<h3>Fonti</h3><ul>${items.map(([href, label]) => `<li><a href="${href}" target="_blank">${label}</a></li>`).join("")}</ul>`;

const CATEGORIES = [
  { slug: "beni-confiscati", name: "Beni confiscati" },
  { slug: "territorio", name: "Territorio" },
  { slug: "progetti", name: "Progetti" },
];

const ITEMS = [
  {
    slug: "trentanni-legge-109-libera-giardino-delle-arance",
    category: "beni-confiscati",
    featured: true,
    publishedAt: at("2026-03-07T10:00:00+01:00"),
    title: "Trent'anni di legge 109: Libera al Giardino delle Arance",
    excerpt: "Il 7 marzo 2026 il presidio di Libera di Castelvetrano ha celebrato i trent'anni della legge sul riuso sociale dei beni confiscati nel nostro Giardino delle Arance.",
    body: `<p>Sabato 7 marzo 2026, alle 9:30, il presidio territoriale di Libera ha portato a Castelvetrano la campagna nazionale "Fame di verità e giustizia". Il luogo scelto è il Giardino delle Arance, in via delle Mimose: un bene confiscato che la nostra cooperativa gestisce.</p>
<p>La data non è casuale. Il 7 marzo 1996 è stata approvata la legge 109, nata da un milione di firme raccolte su impulso di Libera. Da allora i beni tolti alle mafie possono tornare alla collettività per un uso sociale. Dal 6 all'8 marzo Libera ha animato in tutta Italia oltre 180 luoghi, con l'iniziativa "109 piazze per la legge 109".</p>
<h2>Cosa chiede la campagna</h2>
<p>A Castelvetrano, come nelle altre piazze, si sono raccolte cartoline da inviare al Governo. La richiesta è una: destinare stabilmente il 2% del Fondo Unico Giustizia, dove confluisce il denaro sequestrato e confiscato, al riutilizzo pubblico e sociale dei beni confiscati.</p>
<p>In Sicilia sono 384 le realtà che gestiscono beni confiscati, in 80 comuni: 226 associazioni e 68 cooperative sociali. Noi siamo una di queste. Il Giardino delle Arance, con il casolare, l'agrumeto e l'orto biologico di ABES, è il modo in cui quella legge diventa lavoro e accoglienza.</p>
${src([
  ["https://www.castelvetranoselinunte.it/libera-castelvetrano-domani-7-marzo-incontro-sui-beni-confiscati-e-il-loro-reinvestimento/", "CastelvetranoSelinunte.it, 6 marzo 2026"],
  ["https://www.tp24.it/2026/03/07/antimafia/oggi-30-anniversario-della-legge-sui-beni-confiscati-libera-scende-in-piazza/230718", "TP24, 7 marzo 2026"],
  ["https://www.ansa.it/sito/notizie/cronaca/2026/03/05/libera-3-giorni-di-mobilitazione-per-30-anni-legge-sui-beni-confiscati_c179ea40-080c-437a-b027-fbf909b6a49c.html", "ANSA, 5 marzo 2026"],
])}`,
  },
  {
    slug: "castelvetrano-undici-beni-confiscati-a-bando",
    category: "beni-confiscati",
    featured: false,
    publishedAt: at("2026-05-28T10:00:00+02:00"),
    title: "Castelvetrano, undici beni confiscati verso un uso sociale",
    excerpt: "Il Comune ha messo a bando sei beni rurali e cinque urbani confiscati alla mafia. Concessione gratuita per finalità sociali; la gara è partita il 3 giugno 2026.",
    body: `<p>Il Comune di Castelvetrano è assegnatario di 54 immobili confiscati alla mafia. Nel 2026 ha messo a bando quelli ancora disponibili, in due gruppi.</p>
<h2>Sei beni rurali</h2>
<p>Il primo bando, aperto dal 19 marzo al 17 aprile, riguarda terreni e fabbricati rurali nelle contrade Giallonghi, Favara Rampante, Latomie e Bresciana. Tra questi ci sono un uliveto con un fabbricato in parte danneggiato a Bresciana, circa 6.000 metri quadrati di ulivi a Giallonghi e tre appezzamenti confinanti alle Latomie.</p>
<h2>Cinque beni urbani</h2>
<p>Il secondo bando, aperto dall'8 aprile al 5 maggio, riguarda aree e unità immobiliari in via Seggio e in contrada Strasatto, lungo viale Autonomia Siciliana.</p>
<h2>Chi può partecipare</h2>
<p>Enti, associazioni, cooperative e comunità giovanili, anche in forma associata. La concessione è d'uso, gratuita, per finalità sociali, come prevede l'articolo 48 del Codice antimafia (decreto legislativo 159/2011). Per i beni rurali la durata indicata è di 15 anni, rinnovabile. Le operazioni di gara sono iniziate il 3 giugno 2026 negli uffici comunali di via della Rosa.</p>
<p>Ogni terreno che torna coltivato è un pezzo di territorio restituito. Per chi lavora già su un bene confiscato, come noi, è una buona notizia per tutta la valle.</p>
${src([
  ["https://www.tp24.it/2026/03/26/dai-comuni/castelvetrano-il-comune-assegna-sei-immobili-confiscati-alla-mafia/231641", "TP24, 26 marzo 2026"],
  ["https://www.comune.castelvetrano.tp.it/it/news/avviso-inizio-gara-assegnazione_-5-e-6-beni-confiscati-27-05-2026-giallonghifavara-rampante-latomie-bresciana-via-seggio-e-in-contrada-strasatto-viale-autonomia-siciliana", "Comune di Castelvetrano, avviso del 27 maggio 2026"],
])}`,
  },
  {
    slug: "rita-atria-libera-terra-i-beni-sono-di-tutti",
    category: "territorio",
    featured: false,
    publishedAt: at("2026-07-27T10:00:00+02:00"),
    title: "«I beni non sono della cooperativa, ma di tutti»",
    excerpt: "Collettiva racconta la cooperativa Rita Atria Libera Terra, che coltiva in biologico un bene confiscato a Castelvetrano. Siamo vicini di campo, e la pensiamo allo stesso modo.",
    body: `<p>A Castelvetrano i terreni confiscati non li coltiviamo solo noi. Il 27 luglio 2026 Collettiva ha dedicato un racconto della serie "Lavorare con bellezza" alla cooperativa Rita Atria Libera Terra.</p>
<p>La cooperativa gestisce in comodato d'uso un ampio complesso agricolo, con terreni e fabbricati rurali, tolto alla criminalità organizzata. È destinato alla produzione biologica e a finalità sociali. Il presidente è Vito Mazzara, agronomo: ha studiato Agraria, è partito con l'Erasmus ed è tornato.</p>
<blockquote>«In campagna non ci sono nato, ma ci sono cresciuto.»</blockquote>
<p>Secondo l'articolo, il lavoro quotidiano nei campi è stato il modo per vincere la diffidenza iniziale del paese. Su chi parte e chi resta, Mazzara dice che si ha il diritto di andare via, ma anche il dovere di tornare «per arricchire una terra».</p>
<blockquote>«I beni non sono della cooperativa, ma di tutti.»</blockquote>
<p>È la frase che scriveremmo anche sul cancello del Giardino delle Arance.</p>
${src([["https://www.collettiva.it/rubriche/girasoli/beni-confiscati-utf305c3", "Collettiva, \"Il ritorno alle radici che fa rinascere i beni confiscati\", 27 luglio 2026"]])}`,
  },
  {
    slug: "sicarib-agroecologia-rigenerativa-sicilia",
    category: "progetti",
    featured: false,
    publishedAt: at("2026-10-19T10:00:00+02:00"),
    title: "SIC.A.RI.B.: otto partner per un'agricoltura che rigenera",
    excerpt: "Con il progetto SIC.A.RI.B. abbiamo lavorato insieme ad altre sette realtà su un modello agroecologico per la Sicilia: economia circolare, carbon farming, biodistretto.",
    body: `<p>SIC.A.RI.B. sta per Sicilia Agro-Ecologica Rigenerativa Biologica. È un progetto del 2023 e 2024, finanziato con 356.881,76 euro dal Programma di Sviluppo Rurale Sicilia 2014-2022 (fondi FEASR), a copertura del 100% delle spese ammissibili.</p>
<h2>L'obiettivo</h2>
<p>Costruire un modello agroecologico basato sull'economia circolare e sul carbon farming, cioè le pratiche agricole che trattengono carbonio nel suolo, e lavorare verso un biodistretto.</p>
<h2>I partner</h2>
<ul><li>Damiano Società Agricola, capofila</li><li>Dara Guccione Biofarm</li><li>I Locandieri, la nostra cooperativa</li><li>Balsi</li><li>Cusenza Salvatore Fabio</li><li>FIRAB, per la ricerca</li><li>Arca, società benefit, per la consulenza</li><li>Speha Fresia, come intermediario dell'innovazione</li></ul>
<p>Il sito del progetto ci presenta così: una cooperativa sociale che coltiva in biologico terreni confiscati a Castelvetrano, frutta, ortaggi e grani antichi, con il lavoro di persone con disabilità, giovani del circuito penale, minori stranieri non accompagnati e adulti migranti. È lo stesso lavoro che trovate nei prodotti ABES.</p>
${src([["https://www.sicarib.it/en/the-partnership/", "SIC.A.RI.B., pagina del partenariato"]])}`,
  },
];

async function main() {
  const { client, db } = createDb();
  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const found = await db.select().from(newsCategories).where(eq(newsCategories.slug, c.slug)).get();
    if (found) catIds[c.slug] = found.id;
    else {
      const id = newId();
      await db.insert(newsCategories).values({ id, ...c });
      catIds[c.slug] = id;
    }
  }
  for (const n of ITEMS) {
    const exists = await db.select({ id: news.id }).from(news).where(eq(news.slug, n.slug)).get();
    if (exists) { console.log("skip", n.slug); continue; }
    await db.insert(news).values({
      id: newId(),
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      body: cleanNewsBody(n.body),
      categoryId: catIds[n.category],
      status: "published",
      featured: n.featured,
      publishedAt: n.publishedAt,
      seoTitle: n.title.slice(0, 70),
      seoDescription: n.excerpt.slice(0, 170),
    });
    console.log("added", n.slug);
  }
  client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
