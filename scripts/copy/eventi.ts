/** Copy overrides for this page: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh` (existing DBs). */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    eyebrow: "Eventi",
    title: "Ci si incontra, poi si costruisce.",
    text: "Sport, cultura, formazione, iniziative sociali. Ogni appuntamento ha una data, un luogo e un modo per partecipare: qui trovi tutto, iscrizione compresa.",
  },
  upcoming: { title: "I prossimi appuntamenti.", text: "In ordine di data. Apri un biglietto per leggere dove, quando e come partecipare: alcuni eventi hanno posti limitati o chiedono conferma." },
  past: { title: "Già successo.", text: "Gli eventi conclusi restano qui, con data e luogo." },
};

export default copy;
