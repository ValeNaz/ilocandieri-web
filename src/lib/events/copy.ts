/**
 * Fallback copy for /eventi (dossier 05 > EVENTI). The CONTENT module owns editable page blocks
 * (`getPageBlocks('eventi')`); until that renderer exists these are used as-is.
 * TODO(CONTENT): replace with getPageBlocks('eventi') when available.
 */
export const EVENTS_PAGE_COPY = {
  heroTitle: "Incontrarsi è il primo passo per costruire qualcosa.",
  heroText: "Sport, cultura, formazione e iniziative sociali diventano occasioni per stare insieme, condividere esperienze e partecipare alla vita del territorio. Scopri gli appuntamenti in programma.",
  upcomingTitle: "I prossimi appuntamenti.",
  upcomingText: "Un calendario di iniziative da vivere, conoscere e condividere. Consulta i dettagli di ciascun evento per capire come partecipare.",
  pastTitle: "Le esperienze che abbiamo condiviso.",
  pastText: "Ogni iniziativa lascia nuove conoscenze, idee, incontri e relazioni. Rivivi le attività che hanno animato i nostri progetti.",
  emptyTitle: "Il calendario si sta preparando.",
  emptyText: "Non ci sono ancora appuntamenti in programma. Torna a trovarci presto, oppure scrivici se vuoi sapere cosa stiamo organizzando.",
  noUpcomingText: "Al momento non ci sono appuntamenti in programma. Nel frattempo puoi rivivere quelli passati o scriverci.",
} as const;
