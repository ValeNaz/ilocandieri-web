/**
 * CONTENT module seed: initial page blocks (copy from dossier 05_COPY_SITO.md, verbatim) + legal drafts.
 * Idempotent: a block is inserted only when the page has no block with the same `slot`; existing blocks
 * (possibly edited in the admin) are never touched. No invented news/events/photos.
 */
import { eq } from "drizzle-orm";
import { parseBlockData, type BlockType, type PageKey } from "../../src/lib/content/blocks";
import { getDefaultTemplates } from "../../src/lib/email/templates";
import "../../src/lib/content/email-templates";
import type { SeedFn } from "../seed-types";
import { COPY } from "../copy";

type Seed = { type: BlockType; data: Record<string, unknown> };

const cta = (label: string, href: string) => ({ label, href });

const PRIVACY_HTML = `
<p>Questa informativa descrive come {{org.name}} tratta i dati personali di chi utilizza questo sito, ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR).</p>

<h2>Titolare del trattamento</h2>
<p>Il titolare del trattamento è {{org.name}}, con sede in {{org.address}}. Per qualsiasi richiesta relativa ai dati personali puoi scrivere a <a href="mailto:{{org.email}}">{{org.email}}</a>.</p>

<h2>Quali dati trattiamo e per quali finalità</h2>
<h3>Modulo contatti</h3>
<p>Se ci scrivi dal modulo contatti trattiamo nome, indirizzo email, oggetto e testo del messaggio, per rispondere alla tua richiesta. Base giuridica: misure precontrattuali o richiesta dell'interessato e legittimo interesse a rispondere (art. 6.1, lett. b e f GDPR).</p>
<h3>Iscrizione agli eventi</h3>
<p>Se ti iscrivi a un evento trattiamo i dati richiesti dal modulo dell'evento (ad esempio nome, email, telefono, numero di partecipanti ed eventuali risposte) per gestire la partecipazione, comunicarti l'esito e organizzare l'evento. Base giuridica: esecuzione di una tua richiesta (art. 6.1, lett. b GDPR).</p>
<h3>Candidature e curriculum</h3>
<p>Se invii una candidatura trattiamo i dati anagrafici e di contatto, il messaggio e il curriculum allegato, per valutare il tuo profilo rispetto a eventuali opportunità di collaborazione. Il curriculum è accessibile solo al personale autorizzato. Base giuridica: misure precontrattuali su tua richiesta (art. 6.1, lett. b GDPR). L'invio di una candidatura non garantisce una risposta o l'apertura di una posizione.</p>
<h3>Dati di navigazione e statistiche</h3>
<p>Il sito tratta dati tecnici necessari al suo funzionamento. Se e quando il titolare attiverà strumenti di misurazione (come Google Analytics), questi verranno caricati solo dopo il tuo consenso: vedi la <a href="/cookie-policy">Cookie Policy</a>.</p>

<h2>Natura del conferimento</h2>
<p>Il conferimento dei dati contrassegnati come obbligatori nei moduli è necessario per dare seguito alla richiesta; in caso di mancato conferimento non potremo rispondere o gestire la tua richiesta. Non ti chiediamo categorie particolari di dati: ti invitiamo a non includerne nei messaggi o nel curriculum se non strettamente necessario.</p>

<h2>Destinatari dei dati</h2>
<p>I dati sono trattati da persone autorizzate di {{org.name}} e da fornitori di servizi tecnici (ad esempio hosting e posta elettronica) che agiscono come responsabili del trattamento. I dati non sono diffusi né venduti.</p>

<h2>Per quanto tempo conserviamo i dati</h2>
<p>Messaggi dal modulo contatti: per il tempo necessario a rispondere e gestire la richiesta. Candidature e curriculum: fino a {{retention.applicationsDays}} giorni dall'invio, salvo tuo diverso consenso o richiesta di cancellazione. Iscrizioni a eventi: fino a {{retention.pastRegistrationsDays}} giorni dopo la conclusione dell'evento, salvo obblighi di legge.</p>

<h2>I tuoi diritti</h2>
<p>Puoi chiedere l'accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità e opporti al trattamento (artt. 15-22 GDPR), scrivendo a <a href="mailto:{{org.email}}">{{org.email}}</a>. Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it">www.garanteprivacy.it</a>).</p>

<h2>Aggiornamenti</h2>
<p>Questa informativa può essere aggiornata: la versione in vigore è sempre quella pubblicata in questa pagina.</p>
`.trim();

const COOKIE_HTML = `
<p>Questa pagina spiega quali cookie e tecnologie simili utilizza il sito di {{org.name}} e come puoi gestire le tue preferenze.</p>

<h2>Cookie tecnici</h2>
<p>Sono necessari al funzionamento del sito e non richiedono il consenso. Il sito utilizza:</p>
<ul>
<li><strong>il_consent</strong>: ricorda la scelta sui cookie di misurazione (solo se questi strumenti sono attivi). Durata: 6 mesi.</li>
<li><strong>il_session</strong> e <strong>il_flash</strong>: usati esclusivamente nell'area riservata di amministrazione, non vengono impostati ai normali visitatori del sito.</li>
</ul>

<h2>Cookie di misurazione (analytics)</h2>
<p>Il sito può utilizzare Google Analytics 4 per raccogliere statistiche aggregate sull'uso delle pagine. Questo strumento viene caricato <strong>solo se è stato attivato dal titolare e solo dopo il tuo consenso</strong>, espresso dal banner. Puoi rifiutare senza alcuna conseguenza sulla navigazione e cambiare scelta in qualsiasi momento dal link «Preferenze cookie» in fondo alla pagina. Quando lo strumento non è attivo, non viene impostato alcun cookie di questo tipo.</p>

<h2>Servizi di terze parti</h2>
<p>I link verso siti esterni (ad esempio il negozio ABES) portano a siti con proprie politiche sui cookie, di cui il titolare non è responsabile.</p>

<h2>Come gestire i cookie dal browser</h2>
<p>Puoi bloccare o eliminare i cookie dalle impostazioni del tuo browser. Bloccare i cookie tecnici può impedire il corretto funzionamento di alcune parti del sito.</p>

<h2>Titolare e contatti</h2>
<p>{{org.name}}, con sede in {{org.address}}, <a href="mailto:{{org.email}}">{{org.email}}</a>. Per maggiori informazioni sul trattamento dei dati consulta l'<a href="/privacy">informativa privacy</a>.</p>
`.trim();

const msg = (slot: string, text: string, buttonLabel = "") => ({ type: "message" as const, data: { slot, text, buttonLabel } });

const CONTENT: Record<PageKey, Seed[]> = {
  home: [
    { type: "hero", data: { slot: "hero", size: "large", eyebrow: "", title: "Diamo nuova vita ai luoghi. E nuove possibilità alle persone.", text: "A Castelvetrano trasformiamo beni confiscati alla criminalità in spazi di incontro, accoglienza, sport e lavoro. Coltiviamo relazioni, restituiamo valore al territorio e costruiamo opportunità per la comunità.", primaryCta: cta("Scopri chi siamo", "/chi-siamo"), secondaryCta: cta("Esplora i nostri progetti", "/#luoghi") } },
    { type: "intro", data: { slot: "identita", eyebrow: "La nostra identità", title: "Il cambiamento nasce da ciò che facciamo insieme.", text: "Siamo I Locandieri, una cooperativa sociale che crede nel valore delle persone e nella capacità di un territorio di reinventarsi. Lavoriamo attraverso l'accoglienza, l'inclusione, il recupero dei beni confiscati, lo sport e l'agricoltura biologica. Per noi, fare impresa significa anche prenderci cura della comunità.", cta: cta("Conosci I Locandieri", "/chi-siamo") } },
    { type: "pillars", data: { slot: "cosa-facciamo", title: "Modi diversi di fare la differenza.", intro: "Ogni progetto nasce da un bisogno reale. Ogni attività è un'occasione per coinvolgere persone, recuperare risorse e generare valore condiviso.", items: [
      { title: "Accoglienza e inclusione", text: "Accogliere significa costruire percorsi di crescita, autonomia e partecipazione alla vita della comunità." },
      { title: "Beni confiscati", text: "Restituiamo luoghi sottratti alla criminalità alla loro funzione più importante: essere risorse per tutti." },
      { title: "Sport e comunità", text: "Lo sport è un'occasione di incontro, educazione e inclusione, soprattutto per i più giovani." },
      { title: "Agricoltura etica", text: "Attraverso ABES coltiviamo nel rispetto dell'ambiente e delle persone, trasformando il lavoro agricolo in opportunità." },
    ] } },
    { type: "places", data: { slot: "luoghi", title: "Ci sono luoghi che possono raccontare una storia diversa.", text: "A Castelvetrano abbiamo scelto di dare una nuova funzione a spazi che appartengono alla storia del territorio. Oggi questi luoghi ospitano attività, persone e progetti che contribuiscono alla vita della comunità.", items: [
      { title: "Giardino delle Arance", text: "Un bene confiscato che ha ritrovato vita grazie all'accoglienza, all'agricoltura biologica e alla lavorazione dei prodotti della terra.", imageId: null },
      { title: "Campo Polivalente Unità d'Italia", text: "Da terreno confiscato a spazio dedicato allo sport e alla socialità, dove i più giovani possono incontrarsi e crescere insieme.", imageId: null },
    ], cta: cta("Scopri la nostra storia", "/chi-siamo") } },
    { type: "abes_showcase", data: { slot: "abes", source: "home", limit: 8, eyebrow: "ABES, il nostro progetto agricolo", title: "Dalla terra, qualcosa di buono. Per tutti.", text: "Coltiviamo terreni confiscati alla criminalità organizzata e li trasformiamo in risorse produttive. Da questa scelta nascono prodotti biologici che raccontano la Sicilia e un modo diverso di fare economia, più attento alle persone e al territorio.", ctaLabel: "Esplora lo shop ABES", cardCtaLabel: "Scopri il prodotto" } },
    { type: "events_highlight", data: { slot: "eventi", limit: 3, eyebrow: "Partecipa", title: "Le cose belle succedono quando ci incontriamo.", text: "Incontri, attività e iniziative sono occasioni per condividere idee, conoscere nuove persone e vivere il territorio. Scopri i prossimi appuntamenti e scegli come partecipare.", cta: cta("Tutti gli eventi", "/eventi"), emptyMessage: "" } },
    { type: "news_highlight", data: { slot: "news", limit: 3, eyebrow: "Le nostre novità", title: "Storie, progetti e passi avanti.", text: "Raccontiamo quello che accade dentro e fuori i nostri progetti: nuove iniziative, collaborazioni, attività sul territorio e storie che meritano di essere condivise.", cta: cta("Leggi tutte le news", "/news"), emptyMessage: "Nuove storie in arrivo. Stiamo preparando i prossimi aggiornamenti." } },
    { type: "cta", data: { slot: "contatti", title: "Le cose cambiano quando scegliamo di farne parte.", text: "Crediamo nelle collaborazioni, nelle idee condivise e nelle persone che vogliono contribuire. Se vuoi conoscere meglio il nostro lavoro o entrare in contatto con noi, siamo qui.", primaryCta: cta("Contattaci", "/contatti"), secondaryCta: cta("Lavora con noi", "/lavora-con-noi") } },
  ],
  "chi-siamo": [
    { type: "hero", data: { slot: "hero", eyebrow: "La nostra storia", title: "Una cooperativa. Tante persone. Un'idea condivisa di futuro.", text: "Siamo una cooperativa sociale nata per generare opportunità attraverso la collaborazione, il lavoro e la valorizzazione del territorio. A Castelvetrano investiamo nelle persone e nei luoghi, trasformando l'impegno sociale in attività concrete." } },
    { type: "feature", data: { slot: "missione", title: "Creare valore significa condividerlo.", text: "La nostra missione è contribuire alla costruzione di una comunità più inclusiva, nella quale le persone possano trovare occasioni di crescita e i luoghi possano tornare a essere risorse collettive. Accoglienza, educazione, lavoro, recupero dei beni confiscati e agricoltura biologica sono attività differenti, unite dalla convinzione che sviluppo economico e sociale possano procedere insieme.", imageSide: "right" } },
    { type: "values", data: { slot: "valori", title: "Ci guidano le persone. Ci definiscono le scelte.", items: [
      { title: "Legalità", text: "I beni confiscati possono tornare a generare valore per tutta la comunità." },
      { title: "Inclusione", text: "Costruiamo opportunità di partecipazione e autonomia, riconoscendo il valore di ogni persona." },
      { title: "Sostenibilità", text: "Ci prendiamo cura del territorio e scegliamo pratiche attente all'ambiente." },
      { title: "Cooperazione", text: "Le relazioni tra persone e realtà locali rendono possibili progetti duraturi." },
    ] } },
    { type: "feature", data: { slot: "accoglienza", title: "Accogliere è l'inizio. Costruire autonomia è il percorso.", text: "Dal 2008 operiamo nell'accoglienza delle persone migranti, con un approccio che non si ferma ai bisogni immediati. Attraverso attività educative, formative e di inserimento sociale, accompagniamo le persone nella costruzione di nuove opportunità.", imageSide: "left", tone: "deep",
      adminNote: "DA VERIFICARE PRIMA DELLA PUBBLICAZIONE (dossier 05): «Tra i progetti descritti dalla cooperativa figurano il CAS Locanda e una comunità di accoglienza per minori stranieri non accompagnati: prima della pubblicazione va verificato lo stato attuale delle relative attività e convenzioni.» Se confermato, aggiungi questa frase al testo. Verifica anche l'anno «2008»." } },
    { type: "feature", data: { slot: "beni-confiscati", title: "Restituire un luogo significa restituirgli un futuro.", text: "Uno spazio recuperato può diventare luogo di educazione, sport, lavoro e incontro. È questo il principio che guida la nostra attività di rigenerazione: rispondere ai bisogni della comunità attraverso luoghi restituiti al territorio.", imageSide: "right", items: [
      { title: "Il Giardino delle Arance", text: "Un casolare e i terreni circostanti ospitano attività di accoglienza, agricoltura biologica e lavorazione di prodotti agroalimentari, creando occasioni educative e formative.", imageId: null },
      { title: "Il Campo Polivalente Unità d'Italia", text: "Uno spazio dedicato ad attività sportive, educative e ricreative per bambini e ragazzi, che rende lo sport un linguaggio comune di inclusione.", imageId: null },
    ] } },
    { type: "feature", data: { slot: "abes", title: "Coltiviamo un'altra idea di economia.", text: "ABES è il progetto agroalimentare dei Locandieri. La produzione biologica su terreni confiscati dimostra che qualità, legalità, sostenibilità e inclusione possono convivere nello stesso modello di economia sociale.", imageSide: "left", tone: "deep", cta: cta("Scopri i prodotti ABES", "/shop") } },
    { type: "cta", data: { slot: "chiusura", title: "Il nostro futuro continua a essere un progetto collettivo.", text: "Ogni luogo recuperato, ogni percorso avviato e ogni collaborazione costruita sono passi verso la comunità in cui crediamo.", primaryCta: cta("Entra in contatto con noi", "/contatti") } },
  ],
  shop: [
    { type: "hero", data: { slot: "hero", eyebrow: "ABES · Agricoltura biologica ed etica", title: "Buoni da mangiare. Buoni per ciò che rappresentano.", text: "C'è un modo di coltivare che rispetta la terra, valorizza il lavoro e genera nuove possibilità. ABES è il progetto agricolo de I Locandieri: prodotti biologici siciliani che nascono da un'agricoltura attenta all'ambiente e alle persone.", primaryCta: cta("Visita lo shop ABES", "https://abes.bio/collections/all") } },
    { type: "feature", data: { slot: "storia", title: "Ogni prodotto nasce da una scelta.", text: "Coltivare terreni confiscati significa restituire loro una funzione produttiva e sociale. Con ABES questa scelta diventa una proposta alimentare legata al territorio e alla tradizione agricola siciliana.", imageSide: "left" } },
    { type: "abes_showcase", data: { slot: "vetrina", source: "shop", limit: 12, eyebrow: "", title: "I sapori della nostra terra.", text: "Scopri una selezione dei prodotti ABES: conserve, sughi, legumi, farine e specialità della tradizione. Le schede rimandano al negozio ABES per i dettagli e per l'eventuale acquisto.", ctaLabel: "Visita lo shop ABES", cardCtaLabel: "Scopri il prodotto" } },
  ],
  eventi: [
    { type: "hero", data: { slot: "hero", title: "Incontrarsi è il primo passo per costruire qualcosa.", text: "Sport, cultura, formazione e iniziative sociali diventano occasioni per stare insieme, condividere esperienze e partecipare alla vita del territorio. Scopri gli appuntamenti in programma." } },
    { type: "section_heading", data: { slot: "upcoming", title: "I prossimi appuntamenti.", text: "Un calendario di iniziative da vivere, conoscere e condividere. Consulta i dettagli di ciascun evento per capire come partecipare." } },
    { type: "section_heading", data: { slot: "past", title: "Le esperienze che abbiamo condiviso.", text: "Ogni iniziativa lascia nuove conoscenze, idee, incontri e relazioni. Rivivi le attività che hanno animato i nostri progetti." } },
    msg("state_open", "Partecipa all'evento. Compila il modulo per iscriverti.", "Invia iscrizione"),
    msg("state_limited", "Assicurati il tuo posto. La disponibilità è limitata.", "Prenota il tuo posto"),
    msg("state_reserved", "Richiedi di partecipare. Verificheremo i requisiti e ti comunicheremo l'esito.", "Invia richiesta"),
    msg("state_approval", "La partecipazione è soggetta a conferma dell'organizzazione.", "Richiedi iscrizione"),
    msg("state_confirmed", "La tua iscrizione è confermata. Riceverai i dettagli relativi alla partecipazione."),
    msg("state_pending", "Abbiamo ricevuto la tua richiesta. La partecipazione non è ancora confermata."),
    msg("state_full", "Le iscrizioni sono al completo. Al momento non sono disponibili altri posti."),
    msg("state_closed", "Le iscrizioni a questo evento sono terminate."),
    msg("state_past", "Questo evento si è concluso. Scopri le altre iniziative in programma."),
  ],
  news: [
    { type: "hero", data: { slot: "hero", title: "Quello che facciamo merita di essere raccontato.", text: "Ogni progetto è fatto di persone, attività, piccoli traguardi e nuove sfide. Qui raccontiamo iniziative, novità e storie che attraversano il nostro territorio." } },
    { type: "section_heading", data: { slot: "list", title: "Le ultime dal nostro mondo.", text: "Scopri le novità, gli aggiornamenti e le iniziative che portiamo avanti." } },
    msg("empty", "Nuove storie in arrivo. Stiamo preparando i prossimi aggiornamenti."),
    msg("read_label", "Leggi la notizia"),
    msg("all_label", "Tutte le news"),
  ],
  "lavora-con-noi": [
    { type: "hero", data: { slot: "hero", title: "Le persone fanno la differenza. Anche tu puoi farne parte.", text: "Dietro ogni progetto ci sono persone che mettono in campo capacità, impegno e idee. Se ti riconosci nel nostro modo di lavorare, raccontaci chi sei e cosa puoi portare nei nostri progetti." } },
    { type: "section_heading", data: { slot: "collab", title: "Competenze diverse, un impegno comune.", text: "Le nostre attività spaziano dall'accoglienza all'educazione, dall'agricoltura alle iniziative sociali e territoriali. Presentare una candidatura spontanea ci permette di conoscere il tuo profilo per eventuali opportunità future." } },
    { type: "section_heading", data: { slot: "form", title: "Presentati. Il primo passo è conoscerci.", text: "Compila il modulo e raccontaci qualcosa di te, della tua esperienza e dell'interesse a collaborare con I Locandieri." } },
    msg("form_submit", "Invia la candidatura"),
    msg("confirmation", "Grazie per averci contattato. La tua candidatura è stata ricevuta correttamente. Potremo ricontattarti qualora emergessero opportunità coerenti con il tuo profilo."),
    msg("no_openings", "Non ci sono posizioni aperte al momento. Puoi comunque inviarci una candidatura spontanea."),
  ],
  contatti: [
    { type: "contact", data: { slot: "contatti", title: "Restiamo in contatto.", text: "Le idee migliori nascono anche da una semplice conversazione. Vuoi conoscere le nostre attività o proporre una collaborazione? Scrivici.", formTitle: "Scrivici un messaggio" } },
  ],
  privacy: [
    { type: "rich_text", data: { slot: "testo", eyebrow: "Informativa", title: "Informativa sulla privacy", html: PRIVACY_HTML, draftNotice: true, adminNote: "BOZZA da verificare con il titolare e/o un consulente privacy: titolare, finalità, basi giuridiche, tempi di conservazione e fornitori vanno confermati. I segnaposto {{org.*}} e {{retention.*}} si aggiornano da Impostazioni." } },
  ],
  cookie: [
    { type: "rich_text", data: { slot: "testo", eyebrow: "Informativa", title: "Cookie Policy", html: COOKIE_HTML, draftNotice: true, adminNote: "BOZZA da verificare con il titolare e/o un consulente privacy. Se attivi strumenti aggiuntivi (es. Google Analytics) controlla che l'elenco sia completo." } },
  ],
};

const seed: SeedFn = async ({ db, schema, newId, log }) => {
  // Our email template (registered by the import above) is inserted only when missing.
  let tpl = 0;
  for (const [key, t] of Object.entries(getDefaultTemplates())) {
    if (key !== "admin_new_contact") continue;
    const r = await db.insert(schema.emailTemplates).values({ key, subject: t.subject, body: t.body }).onConflictDoNothing({ target: schema.emailTemplates.key }).returning({ key: schema.emailTemplates.key });
    tpl += r.length;
  }

  let inserted = 0;
  for (const [pageKey, blocks] of Object.entries(CONTENT) as [PageKey, Seed[]][]) {
    const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, pageKey));
    if (!page) {
      log(`content: page "${pageKey}" missing, skipped`);
      continue;
    }
    const existing = await db.select().from(schema.pageBlocks).where(eq(schema.pageBlocks.pageId, page.id));
    const existingSlots = new Set(existing.map((b) => (b.data as { slot?: string } | null)?.slot).filter(Boolean));
    let position = existing.reduce((m, b) => Math.max(m, b.position + 1), 0);
    const startFresh = existing.length === 0;
    for (const [i, b] of blocks.entries()) {
      const slot = b.data.slot as string;
      if (existingSlots.has(slot)) continue;
      const parsed = parseBlockData(b.type, { ...b.data, ...(COPY[pageKey]?.[slot] ?? {}) });
      if (!parsed.success) throw new Error(`content seed: invalid ${b.type}/${slot} on ${pageKey}: ${parsed.error.message}`);
      await db.insert(schema.pageBlocks).values({ id: newId(), pageId: page.id, type: b.type, position: startFresh ? i : position++, visible: true, data: parsed.data });
      inserted++;
    }
  }
  log(`content: ${inserted} blocks inserted, ${tpl} email templates inserted`);
};

export default seed;
