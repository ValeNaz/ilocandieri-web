/** Careers module constants. Public copy comes from dossier 05 (LAVORA CON NOI). */

/** Fixed list of interest areas (from the activities named in dossier 05). */
export const APPLICATION_AREAS = [
  "Accoglienza",
  "Educazione e formazione",
  "Agricoltura biologica",
  "Iniziative sociali e territoriali",
  "Sport e attività all'aperto",
  "Comunicazione ed eventi",
  "Amministrazione e organizzazione",
  "Altro",
] as const;

/** Version of the privacy notice the applicant acknowledged (stored in applications.privacyVersion). */
export const PRIVACY_VERSION = "2026-10-informativa-bozza";

export const CV_MAX_MB = 5;

export const NO_OPENINGS_MESSAGE = "Non ci sono posizioni aperte al momento. Puoi comunque inviarci una candidatura spontanea.";
export const CONFIRMATION_MESSAGE =
  "Grazie per averci contattato. La tua candidatura è stata ricevuta correttamente. Potremo ricontattarti qualora emergessero opportunità coerenti con il tuo profilo.";

/** Fallback copy (dossier 05) used until the CONTENT module exposes `getPageBlocks('lavora-con-noi')`. */
export const CAREERS_FALLBACK_COPY = {
  hero: {
    title: "Le persone fanno la differenza. Anche tu puoi farne parte.",
    text: "Dietro ogni progetto ci sono persone che mettono in campo capacità, impegno e idee. Se ti riconosci nel nostro modo di lavorare, raccontaci chi sei e cosa puoi portare nei nostri progetti.",
  },
  collaborations: {
    title: "Competenze diverse, un impegno comune.",
    text: "Le nostre attività spaziano dall'accoglienza all'educazione, dall'agricoltura alle iniziative sociali e territoriali. Presentare una candidatura spontanea ci permette di conoscere il tuo profilo per eventuali opportunità future.",
  },
  form: {
    title: "Presentati. Il primo passo è conoscerci.",
    text: "Compila il modulo e raccontaci qualcosa di te, della tua esperienza e dell'interesse a collaborare con I Locandieri.",
    cta: "Invia la candidatura",
  },
} as const;

export const APPLICATION_STATUSES = ["new", "reviewing", "archived"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
