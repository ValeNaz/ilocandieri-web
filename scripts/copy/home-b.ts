/** Copy overrides (slot -> partial block data) owned by HOME-B: "Cosa facciamo" e "Luoghi". */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  "cosa-facciamo": {
    eyebrow: "Cosa facciamo",
    title: "Accogliere, restituire, giocare, coltivare.",
    intro: "A Castelvetrano lavoriamo su quattro fronti. Ognuno ha un posto preciso e persone che ci lavorano ogni giorno. Scorri: si passa da una stanza all'altra.",
    items: [
      { title: "Accoglienza e inclusione", text: "Dal 2008 accogliamo persone migranti e, in una comunità dedicata, minori stranieri non accompagnati. Una stanza, un posto a tavola, poi il cammino verso l'autonomia." },
      { title: "Beni confiscati", text: "Un casolare di fine Settecento e i suoi terreni, tolti alla criminalità organizzata, tornano a servire la città. La legge 109 del 1996 lo permette. Noi apriamo il cancello e ci mettiamo al lavoro." },
      { title: "Sport e comunità", text: "Al Campo Polivalente Unità d'Italia giocano circa 200 tra bambini e ragazzi. Si comincia a 3 anni, si arriva alla pallavolo. Ci vengono anche i minori delle nostre comunità." },
      { title: "Agricoltura etica ABES", text: "Con ABES coltiviamo biologico su terreni confiscati: frutta e verdura di stagione, grano duro Tumminia, sughi e conserve. Il lavoro nei campi è anche lavoro per chi cerca un inserimento." },
    ],
  },
  luoghi: {
    eyebrow: "I luoghi",
    title: "Un giardino e un campo, restituiti alla città.",
    text: "Erano beni confiscati a Castelvetrano. Oggi in uno si raccolgono arance, nell'altro si gioca a pallavolo. Entrambi hanno le porte aperte.",
    cta: { label: "Leggi la nostra storia", href: "/storia" },
    items: [
      { title: "Giardino delle Arance", text: "Circa tre ettari vicino al centro storico. Due ettari di agrumeto recuperati, un orto biologico intensivo, un laboratorio di trasformazione e un casolare di fine Settecento che ospita una comunità alloggio per minori." },
      { title: "Campo Polivalente Unità d'Italia", text: "Terreno confiscato in via SS. Trinità, oggi dedicato allo sport. Avviamento allo sport dai 3 anni, pallavolo per i ragazzi, partite con i minori ospitati nelle comunità. Circa 200 tra bambini e ragazzi." },
    ],
  },
};

export default copy;
