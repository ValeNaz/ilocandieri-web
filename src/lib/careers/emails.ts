import { registerDefaultTemplates } from "@/lib/email/templates";

/**
 * Default templates of the careers module. Import this file from every place that sends them
 * AND from scripts/seed/40-careers.ts, so the seed inserts them into `email_templates`.
 */
registerDefaultTemplates({
  application_received: {
    description: "Conferma neutra di ricezione, inviata a chi si candida",
    subject: "Abbiamo ricevuto la tua candidatura",
    body: `Ciao {{candidato.nome}},

grazie per averci contattato. La tua candidatura è stata ricevuta correttamente.

Potremo ricontattarti qualora emergessero opportunità coerenti con il tuo profilo.

Un saluto,
{{organizzazione.nome}}`,
  },
  admin_new_application: {
    description: "Avviso allo staff: è arrivata una candidatura (nessun CV allegato)",
    subject: "Nuova candidatura ricevuta",
    body: `È arrivata una nuova candidatura dal sito.

Ambito: {{candidatura.ambito}}
Ricevuta il: {{candidatura.data}}

Per leggerla e scaricare il CV accedi al pannello:
{{link}}`,
  },
});
