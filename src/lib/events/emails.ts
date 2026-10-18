import { eq } from "drizzle-orm";
import { db as defaultDb, schema, type Db } from "@/lib/db";
import { registerDefaultTemplates, sendTemplatedEmail } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/env";
import { adminPaths, paths } from "@/lib/paths";
import { getSetting } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import type { EventRow, RegistrationRow } from "./state";

const SIGN = `Un saluto,
{{org.nome}}
{{org.contatti}}`;

/** Default texts (admin can override them in Email > Modelli). Placeholders: see buildEmailContext(). */
registerDefaultTemplates({
  registration_confirmed: {
    description: "All'iscritto: iscrizione confermata subito (eventi aperti o a posti limitati)",
    subject: "Iscrizione confermata: {{evento.titolo}}",
    body: `Ciao {{iscritto.nome}},

la tua iscrizione è confermata. Ti aspettiamo!

{{evento.dettagli}}
Posti prenotati: {{iscrizione.posti}}

Se non puoi più partecipare, scrivici così liberiamo il posto per qualcun altro.

${SIGN}`,
  },
  registration_pending: {
    description: "All'iscritto: richiesta ricevuta, in attesa di conferma (eventi su approvazione o riservati)",
    subject: "Richiesta ricevuta, in attesa di conferma: {{evento.titolo}}",
    body: `Ciao {{iscritto.nome}},

abbiamo ricevuto la tua richiesta di partecipazione. La partecipazione non è ancora confermata: ti scriveremo non appena l'avremo valutata.

{{evento.dettagli}}
Posti richiesti: {{iscrizione.posti}}
{{iscrizione.avviso_posti}}

${SIGN}`,
  },
  registration_approved: {
    description: "All'iscritto: richiesta approvata dall'organizzazione",
    subject: "Partecipazione confermata: {{evento.titolo}}",
    body: `Ciao {{iscritto.nome}},

buone notizie: la tua richiesta è stata approvata e la partecipazione è confermata.

{{evento.dettagli}}
Posti confermati: {{iscrizione.posti}}

${SIGN}`,
  },
  registration_rejected: {
    description: "All'iscritto: richiesta non accolta",
    subject: "Richiesta non accolta: {{evento.titolo}}",
    body: `Ciao {{iscritto.nome}},

grazie per l'interesse. Purtroppo non siamo riusciti ad accogliere la tua richiesta di partecipazione a «{{evento.titolo}}».

Puoi scoprire le altre iniziative in programma qui:
{{link.eventi}}

${SIGN}`,
  },
  registration_cancelled: {
    description: "All'iscritto: iscrizione annullata dall'organizzazione",
    subject: "Iscrizione annullata: {{evento.titolo}}",
    body: `Ciao {{iscritto.nome}},

ti confermiamo che la tua iscrizione a «{{evento.titolo}}» è stata annullata. I posti sono stati liberati.

Se pensi si tratti di un errore, rispondi a questo messaggio o contattaci.

${SIGN}`,
  },
  admin_new_registration: {
    description: "All'organizzazione: nuova iscrizione o richiesta ricevuta",
    subject: "Nuova iscrizione ({{iscrizione.stato}}): {{evento.titolo}}",
    body: `È arrivata una nuova iscrizione.

Evento: {{evento.titolo}} ({{evento.quando}})
Nome: {{iscritto.nome}}
Email: {{iscritto.email}}
Posti: {{iscrizione.posti}}
Stato: {{iscrizione.stato}}
Situazione posti: {{evento.situazione_posti}}

Apri la scheda per vedere le risposte{{iscrizione.azione}}:
{{link.admin}}`,
  },
});

export type RegistrationEmailKind = "created" | "approved" | "rejected" | "cancelled";

const STATUS_LABEL: Record<RegistrationRow["status"], string> = {
  pending: "in attesa di conferma",
  confirmed: "confermata",
  rejected: "non accolta",
  cancelled: "annullata",
};

function seatsSummary(e: EventRow): string {
  if (e.capacity == null) return `${e.seatsConfirmed} confermati (senza limite di posti)`;
  const pend = e.seatsHeld > 0 ? `, ${e.seatsHeld} riservati a richieste in attesa` : "";
  return `${e.seatsConfirmed} confermati su ${e.capacity}${pend}`;
}

export async function buildEmailContext(event: EventRow, reg: RegistrationRow, db: Db = defaultDb) {
  const org = await getSetting("org");
  const base = getSiteUrl();
  const when = event.endsAt && event.endsAt !== event.startsAt ? `${formatDateTime(event.startsAt)} – ${formatDateTime(event.endsAt)}` : formatDateTime(event.startsAt);
  const details = [`Evento: ${event.title}`, `Quando: ${when}`, event.location ? `Dove: ${event.location}` : "", `Scheda: ${base}${paths.event(event.slug)}`].filter(Boolean).join("\n");
  const contacts = [org.email && `scrivici a ${org.email}`, org.phone && `chiamaci al ${org.phone}`].filter(Boolean).join(" oppure ");
  const holdNote = event.pendingHoldsSeats && event.capacity != null ? "I posti richiesti restano riservati per te mentre valutiamo la richiesta." : "";
  void db;
  return {
    evento: { titolo: event.title, quando: when, dove: event.location ?? "", dettagli: details, link: `${base}${paths.event(event.slug)}`, situazione_posti: seatsSummary(event) },
    iscritto: { nome: reg.name, email: reg.email },
    iscrizione: {
      posti: reg.seats,
      stato: STATUS_LABEL[reg.status],
      avviso_posti: holdNote,
      azione: reg.status === "pending" ? " e approvarla o rifiutarla" : "",
    },
    link: { eventi: `${base}${paths.events}`, admin: `${base}${adminPaths.registration(reg.id)}` },
    org: { nome: org.name, telefono: org.phone, email: org.email, contatti: contacts ? `Per qualsiasi dubbio ${contacts}.` : "" },
  };
}

/**
 * Send (idempotently) the emails for a registration event. Safe to call again after a retry/crash:
 * the outbox idempotencyKey `${template}:${registrationId}:${status}` guarantees no duplicates.
 * Never throws: delivery problems are recorded in the outbox (visible/retriable in admin).
 */
export async function sendRegistrationEmails(registrationId: string, kind: RegistrationEmailKind, db: Db = defaultDb): Promise<{ template: string; to: string; status: string }[]> {
  const [reg] = await db.select().from(schema.registrations).where(eq(schema.registrations.id, registrationId));
  if (!reg) return [];
  const [event] = await db.select().from(schema.events).where(eq(schema.events.id, reg.eventId));
  if (!event) return [];
  const ctx = await buildEmailContext(event, reg, db);
  const jobs: { template: string; to: string; key: string }[] = [];

  if (kind === "created") {
    const template = reg.status === "confirmed" ? "registration_confirmed" : "registration_pending";
    jobs.push({ template, to: reg.email, key: `${template}:${reg.id}:${reg.status}` });
    const notify = (await getSetting("notifications")).registrationsTo;
    for (const to of notify) jobs.push({ template: "admin_new_registration", to, key: `admin_new_registration:${reg.id}:${reg.status}:${to.toLowerCase()}` });
  } else {
    const template = { approved: "registration_approved", rejected: "registration_rejected", cancelled: "registration_cancelled" }[kind];
    jobs.push({ template, to: reg.email, key: `${template}:${reg.id}:${reg.status}` });
  }

  const out: { template: string; to: string; status: string }[] = [];
  for (const j of jobs) {
    try {
      const r = await sendTemplatedEmail({ template: j.template, to: j.to, idempotencyKey: j.key, ctx }, db);
      out.push({ template: j.template, to: j.to, status: r.status });
    } catch (err) {
      console.error(`[events] email ${j.template} failed for registration ${registrationId}:`, err instanceof Error ? err.message : err);
      out.push({ template: j.template, to: j.to, status: "error" });
    }
  }
  return out;
}
