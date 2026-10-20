/** Copy overrides for this page: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh` (existing DBs). */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  contatti: {
    eyebrow: "Contatti",
    title: "Scrivici, o vieni a trovarci.",
    text: "Per collaborazioni, visite, domande sugli eventi o sui prodotti. Ai messaggi del modulo rispondiamo per email.",
    formTitle: "Scrivici un messaggio",
  },
};

export default copy;
