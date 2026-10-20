/** Copy overrides for this page: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh` (existing DBs). */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    eyebrow: "Shop ABES",
    title: "Dalla nostra terra, nel tuo vasetto.",
    text: "Conserve, sughi, legumi, pasta di Tumminia e farine, biologici e siciliani. Qui li vedi. Si ordinano su abes.bio.",
    primaryCta: { label: "Guarda i prodotti", href: "/shop#vetrina" },
    secondaryCta: { label: "Dal seme al barattolo", href: "/abes" },
  },
  storia: {
    eyebrow: "Da dove arrivano",
    title: "Ogni vasetto parte da un campo confiscato.",
    text: "ABES coltiva biologico su terreni confiscati alla criminalità organizzata, a Castelvetrano. Il lavoro è anche inclusione lavorativa. Il resto, dal chicco alla tavola, lo racconta la pagina dedicata.",
    cta: { label: "Dal seme al barattolo", href: "/abes" },
  },
  vetrina: {
    eyebrow: "I prodotti",
    title: "Quello che trovi sullo scaffale.",
    text: "Ogni tessera porta alla scheda del prodotto su abes.bio, con prezzo, disponibilità e ordine.",
    ctaLabel: "Tutto il catalogo su abes.bio",
    cardCtaLabel: "Scopri il prodotto",
  },
};

export default copy;
