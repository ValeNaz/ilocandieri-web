/** Copy overrides for /lavora-con-noi: { [slot]: partial block data }. Applied by seed (fresh DBs) and `pnpm copy:refresh`. */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    title: "Ognuno porta un mestiere.",
    text: "Dall'orto alla cucina, dal campo sportivo all'ufficio, dall'educazione all'accoglienza: il lavoro qui ha mille forme e serve chi ha voglia di imparare. Se ti riconosci, raccontaci chi sei.",
  },
  collab: {
    title: "Competenze diverse, un solo cantiere.",
    text: "Lavoriamo su più fronti e ci servono saperi diversi. Una candidatura spontanea ci fa conoscere il tuo profilo, per le occasioni che verranno.",
  },
  form: {
    title: "Presentati. Poi ci parliamo.",
    text: "Dicci chi sei, che esperienza hai e in quale ambito ti vedi. Ci vogliono pochi minuti. Il curriculum è facoltativo.",
  },
};

export default copy;
