import type { RegistrationMode, RegistrationState, EventRow } from "./state";
import { formatDateTime } from "@/lib/utils";

/** Exact microcopy from dossier 05 (EVENTI > Microcopy form e stati). */
export const DEFAULT_MESSAGES = {
  confirmed: "La tua iscrizione è confermata. Riceverai i dettagli relativi alla partecipazione.",
  pending: "Abbiamo ricevuto la tua richiesta. La partecipazione non è ancora confermata.",
  full: "Le iscrizioni sono al completo. Al momento non sono disponibili altri posti.",
  closed: "Le iscrizioni a questo evento sono terminate.",
  past: "Questo evento si è concluso. Scopri le altre iniziative in programma.",
  /** Not in the dossier: sober wording for registrations that have not opened yet. */
  notYetOpen: "Le iscrizioni non sono ancora aperte.",
} as const;

export type MessageKey = keyof typeof DEFAULT_MESSAGES;
export const MESSAGE_KEYS = Object.keys(DEFAULT_MESSAGES) as MessageKey[];
export const MESSAGE_LABELS: Record<MessageKey, string> = {
  confirmed: "Iscrizione confermata",
  pending: "Richiesta in attesa",
  full: "Posti esauriti",
  closed: "Iscrizioni chiuse",
  past: "Evento concluso",
  notYetOpen: "Iscrizioni non ancora aperte",
};

export type EventMessages = Partial<Record<MessageKey | "whatsappText", string>>;

/** Defensive reader for the `successMessage` JSON column (admin-controlled overrides). */
export function parseEventMessages(raw: unknown): EventMessages {
  if (!raw || typeof raw !== "object") return {};
  const out: EventMessages = {};
  for (const k of [...MESSAGE_KEYS, "whatsappText"] as const) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 400);
  }
  return out;
}

export type PageMessages = Partial<Record<MessageKey, string>>;

/** Precedence: per-event override > page-level text editable in admin (`base`) > dossier default. */
export function messageFor(event: Pick<EventRow, "successMessage">, key: MessageKey, base: PageMessages = {}): string {
  return parseEventMessages(event.successMessage)[key as MessageKey] ?? base[key] ?? DEFAULT_MESSAGES[key];
}

/** Public message for a non-open registration state (null when nothing should be said). */
export function stateMessage(event: Pick<EventRow, "successMessage" | "registrationOpensAt">, state: RegistrationState, base: PageMessages = {}): string | null {
  switch (state) {
    case "full": return messageFor(event, "full", base);
    case "closed": return messageFor(event, "closed", base);
    case "past": return messageFor(event, "past", base);
    case "not_yet_open": {
      const text = messageFor(event, "notYetOpen", base);
      return event.registrationOpensAt && !parseEventMessages(event.successMessage).notYetOpen
        ? `${text} Apriranno il ${formatDateTime(event.registrationOpensAt)}.`
        : text;
    }
    default: return null;
  }
}

/** Exact dossier microcopy per participation mode. */
export const MODE_COPY: Record<RegistrationMode, { label: string; intro: string; button: string }> = {
  open: { label: "Partecipazione aperta", intro: "Partecipa all'evento. Compila il modulo per iscriverti.", button: "Invia iscrizione" },
  limited: { label: "Posti limitati", intro: "Assicurati il tuo posto. La disponibilità è limitata.", button: "Prenota il tuo posto" },
  reserved: { label: "Riservata", intro: "Richiedi di partecipare. Verificheremo i requisiti e ti comunicheremo l'esito.", button: "Invia richiesta" },
  approval: { label: "Su approvazione", intro: "La partecipazione è soggetta a conferma dell'organizzazione.", button: "Richiedi iscrizione" },
};

/** Declared when pending requests occupy seats (shown publicly: the rule must be visible). */
export const HOLD_NOTICE = "I posti richiesti restano riservati per te mentre valutiamo la richiesta.";
export const NO_HOLD_NOTICE = "Inviare la richiesta non riserva automaticamente il posto: la disponibilità viene verificata al momento della conferma.";

/** Short badge label for cards/lists. */
export function registrationBadge(state: RegistrationState): string | null {
  switch (state) {
    case "open": return "Iscrizioni aperte";
    case "full": return "Posti esauriti";
    case "closed": return "Iscrizioni terminate";
    case "not_yet_open": return "Iscrizioni a breve";
    default: return null;
  }
}

export const REGISTRATION_STATUS_LABEL = { pending: "In attesa", confirmed: "Confermata", rejected: "Rifiutata", cancelled: "Annullata" } as const;
