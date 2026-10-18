import { registerDefaultTemplates } from "@/lib/email/templates";

registerDefaultTemplates({
  admin_new_contact: {
    description: "Nuovo messaggio dal modulo contatti (all'azienda)",
    subject: "Nuovo messaggio dal sito: {{messaggio.nome}}",
    body: `Hai ricevuto un nuovo messaggio dal modulo contatti del sito.

Nome: {{messaggio.nome}}
Email: {{messaggio.email}}
Oggetto: {{messaggio.oggetto}}

Messaggio:
{{messaggio.testo}}

Aprilo nel pannello: {{link}}`,
  },
});
