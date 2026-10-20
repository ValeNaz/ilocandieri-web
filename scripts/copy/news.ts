/** Copy overrides for this page: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh` (existing DBs). */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    eyebrow: "News",
    title: "Quello che facciamo, raccontato da chi lo fa.",
    text: "Novità dai luoghi, dalle attività e da ABES. Una notizia alla volta, con data e categoria.",
  },
  list: { title: "Le ultime notizie.", text: "Dalla più recente. Filtra per categoria per trovare quello che cerchi." },
};

export default copy;
