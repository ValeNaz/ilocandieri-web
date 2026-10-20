/** Copy overrides for /chi-siamo: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh`. */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    eyebrow: "Cooperativa sociale, Castelvetrano",
    title: "Una casa fatta di persone.",
    text: "I Locandieri accolgono, riportano in uso i beni confiscati alla criminalità organizzata, giocano a pallavolo con i ragazzi e coltivano biologico. Ognuno mette un pezzo. La casa sta in piedi perché sono tanti.",
  },
  missione: {
    title: "Il valore che si crea, si divide.",
    text: "Ci definiamo un progetto di economia civile: creare valore sociale ed economico per il maggior numero di persone.\n\nPer questo facciamo cose diverse. Accoglienza, educazione, lavoro, recupero dei beni confiscati, agricoltura biologica. Hanno una radice sola: economia e comunità crescono insieme, oppure non crescono.\n\nIl nostro simbolo è il cerchio. Perché cooperare è stare in cerchio.",
  },
  valori: {
    title: "Quattro scelte che si vedono nel lavoro.",
    items: [
      { title: "Legalità", text: "Un bene confiscato torna a servire tutta la comunità. Si apre il cancello, si accende la luce." },
      { title: "Inclusione", text: "Ognuno ha un posto a tavola e un compito da fare. L'autonomia si costruisce lavorando." },
      { title: "Sostenibilità", text: "Coltiviamo con metodo biologico e curiamo la terra che ci dà da vivere." },
      { title: "Cooperazione", text: "Nessun progetto regge da solo. Lo passiamo di mano in mano a enti, scuole e realtà del territorio." },
    ],
  },
  accoglienza: {
    title: "Accogliere è l'inizio. Poi viene il percorso.",
    text: "Dal 2008 accogliamo persone migranti. Un letto e un pasto sono il punto di partenza.\n\nDopo arrivano le attività educative, la formazione, il lavoro, l'inserimento nel territorio: gradino dopo gradino, fino a camminare da soli.",
  },
  "beni-confiscati": {
    title: "Un luogo restituito è un luogo che lavora.",
    text: "Un bene confiscato alla criminalità organizzata può essere assegnato a chi lo usa per fini sociali: lo dice la legge 109 del 1996. A Castelvetrano abbiamo preso in cura questi due luoghi.",
    items: [
      { title: "Il Giardino delle Arance", text: "Circa tre ettari vicino al centro storico. Un casolare di fine Settecento con una comunità alloggio per minori, due ettari di agrumeto, un orto biologico, un laboratorio di trasformazione.", imageId: null },
      { title: "Il Campo Polivalente Unità d'Italia", text: "Un terreno di via SS. Trinità per lo sport e il tempo libero. Avviamento allo sport dai 3 anni, pallavolo per i ragazzi, attività per i minori delle comunità.", imageId: null },
    ],
  },
  abes: {
    title: "Un'altra idea di economia, in un vasetto.",
    text: "ABES è il progetto agroalimentare de I Locandieri. Agricoltura biologica su terreni confiscati: frutta e verdura di stagione, sughi, conserve, pasta, farine, legumi.\n\nQualità, legalità e lavoro inclusivo finiscono nello stesso barattolo.",
    cta: { label: "Entra nello shop", href: "/shop" },
  },
  chiusura: {
    title: "Il resto della casa lo costruiamo con te.",
    text: "Ogni luogo riaperto, ogni percorso avviato, ogni collaborazione nata è un mattone della stessa casa. Se vuoi portarne uno, scrivici.",
    primaryCta: { label: "Scrivici", href: "/contatti" },
  },
};

export default copy;
