/** Copy overrides (slot -> partial block data) owned by one agent. */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  abes: {
    eyebrow: "ABES",
    title: "Si coltiva qui. Si mangia ovunque.",
    text: "Il progetto agricolo de I Locandieri: biologico su terreni confiscati a Castelvetrano. Ogni tessera porta al prodotto su abes.bio.",
    ctaLabel: "Vai allo shop",
    cardCtaLabel: "Scopri il prodotto",
  },
  eventi: {
    eyebrow: "Partecipa",
    title: "I prossimi appuntamenti.",
    text: "Incontri e attività aperte a chi vuole esserci. Scegli la data e iscriviti dalla pagina dell'evento.",
    emptyMessage: "Nessun evento in programma, per ora. Quando ne fissiamo uno, lo trovi qui e nella pagina Eventi.",
  },
  news: {
    eyebrow: "Novità",
    title: "Cosa sta succedendo.",
    text: "Le ultime notizie dai nostri luoghi e dai nostri progetti.",
    emptyMessage: "Nessuna notizia pubblicata, per ora. Le prossime compariranno qui.",
  },
};

export default copy;
