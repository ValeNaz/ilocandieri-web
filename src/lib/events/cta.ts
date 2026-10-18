import { z } from "zod";
import { paths } from "@/lib/paths";
import { parseEventMessages } from "./messages";
import type { CtaType, EventRow } from "./state";

export const CTA_TYPES: { value: CtaType; label: string; hint: string }[] = [
  { value: "none", label: "Nessuna azione", hint: "L'evento è solo informativo." },
  { value: "external_link", label: "Link esterno", hint: "Porta a un sito (solo indirizzi https)." },
  { value: "whatsapp", label: "WhatsApp", hint: "Apre una chat WhatsApp con un messaggio già scritto." },
  { value: "email", label: "Email", hint: "Apre il programma di posta con un messaggio già indirizzato." },
  { value: "contact", label: "Pagina Contatti", hint: "Porta al modulo di contatto del sito." },
  { value: "registration", label: "Iscrizione online", hint: "Mostra il modulo di iscrizione sul sito." },
];

export const DEFAULT_CTA_LABEL: Record<CtaType, string> = {
  none: "",
  external_link: "Scopri di più",
  whatsapp: "Scrivici su WhatsApp",
  email: "Scrivici una email",
  contact: "Contattaci",
  registration: "Iscriviti",
};

/** Normalise a phone number to the digits wa.me wants (country code, no +). Italian mobiles get 39. */
export function normalizeWhatsappNumber(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^3\d{8,9}$/.test(d)) d = `39${d}`;
  return /^\d{8,15}$/.test(d) ? d : null;
}

export type CtaCheck = { ok: true; value: string | null } | { ok: false; error: string };

/** Validate + normalise the CTA target for a CTA type (used by admin save; never trust the client). */
export function validateCtaTarget(type: CtaType, rawTarget: string | null | undefined): CtaCheck {
  const raw = (rawTarget ?? "").trim();
  switch (type) {
    case "none":
    case "contact":
    case "registration":
      return { ok: true, value: null };
    case "external_link": {
      if (!raw) return { ok: false, error: "Inserisci l'indirizzo del link." };
      let u: URL;
      try { u = new URL(raw); } catch { return { ok: false, error: "Indirizzo non valido: inizia con https://" }; }
      if (u.protocol !== "https:") return { ok: false, error: "Sono ammessi solo indirizzi sicuri che iniziano con https://" };
      if (!u.hostname.includes(".") || u.username || u.password) return { ok: false, error: "Indirizzo non valido." };
      if (raw.length > 500) return { ok: false, error: "Indirizzo troppo lungo." };
      return { ok: true, value: u.toString() };
    }
    case "whatsapp": {
      const n = normalizeWhatsappNumber(raw);
      return n ? { ok: true, value: n } : { ok: false, error: "Inserisci un numero valido con prefisso internazionale, per esempio +39 331 1234567." };
    }
    case "email": {
      const r = z.email().safeParse(raw);
      return r.success && raw.length <= 254 ? { ok: true, value: raw.toLowerCase() } : { ok: false, error: "Inserisci un indirizzo email valido." };
    }
  }
}

export type CtaView =
  | { kind: "none" }
  | { kind: "link"; href: string; label: string; external: boolean }
  | { kind: "registration"; label: string };

/** Public CTA for the event (links only; the registration form is rendered by the page). */
export function buildCta(event: Pick<EventRow, "ctaType" | "ctaLabel" | "ctaTarget" | "title" | "successMessage">): CtaView {
  const label = event.ctaLabel?.trim() || DEFAULT_CTA_LABEL[event.ctaType];
  switch (event.ctaType) {
    case "external_link": {
      const check = validateCtaTarget("external_link", event.ctaTarget);
      return check.ok && check.value ? { kind: "link", href: check.value, label, external: true } : { kind: "none" };
    }
    case "whatsapp": {
      const n = event.ctaTarget ? normalizeWhatsappNumber(event.ctaTarget) : null;
      if (!n) return { kind: "none" };
      const text = parseEventMessages(event.successMessage).whatsappText || `Ciao! Vorrei avere informazioni sull'evento «${event.title}».`;
      return { kind: "link", href: `https://wa.me/${n}?text=${encodeURIComponent(text)}`, label, external: true };
    }
    case "email": {
      const check = validateCtaTarget("email", event.ctaTarget);
      if (!check.ok || !check.value) return { kind: "none" };
      return { kind: "link", href: `mailto:${check.value}?subject=${encodeURIComponent(`Informazioni su: ${event.title}`)}`, label, external: false };
    }
    case "contact":
      return { kind: "link", href: paths.contacts, label, external: false };
    case "registration":
      return { kind: "registration", label };
    default:
      return { kind: "none" };
  }
}
