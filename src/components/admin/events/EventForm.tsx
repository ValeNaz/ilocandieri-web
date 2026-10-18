"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { saveEventAction } from "@/app/admin/(panel)/eventi/actions";
import { MediaPicker, type MediaOption } from "@/components/admin/content/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SaveBar } from "@/components/admin/SaveBar";
import { Card, Checkbox, Input, Select, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import type { EventFormField } from "@/lib/db/schema";
import { adminPaths } from "@/lib/paths";
import { FormBuilder } from "./FormBuilder";

export type EventFormInitial = {
  id: string | null;
  title: string;
  slug: string;
  summary: string;
  bodyHtml: string;
  startsAt: string;
  endsAt: string;
  location: string;
  coverId: string | null;
  categoryId: string;
  audience: string;
  status: "draft" | "published" | "hidden";
  featured: boolean;
  ctaType: "none" | "external_link" | "whatsapp" | "email" | "contact" | "registration";
  ctaLabel: string;
  ctaTarget: string;
  whatsappText: string;
  registrationMode: "" | "open" | "limited" | "approval" | "reserved";
  capacity: string;
  maxSeatsPerRequest: string;
  pendingHoldsSeats: boolean;
  reservedCriteria: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  registrationManuallyClosed: boolean;
  privacyNote: string;
  messages: Record<"confirmed" | "pending" | "full" | "closed" | "past" | "notYetOpen", string>;
  seoTitle: string;
  seoDescription: string;
};

export type EventFormMeta = {
  fields: EventFormField[];
  formVersion: number | null;
  registrationsCount: number;
  pendingCount: number;
  categories: { id: string; name: string }[];
  media: MediaOption[];
  defaults: Record<string, string>;
};

const CTA_OPTIONS: [EventFormInitial["ctaType"], string][] = [
  ["none", "Nessuna azione (solo informativo)"],
  ["registration", "Iscrizione online (modulo sul sito)"],
  ["external_link", "Link esterno"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
  ["contact", "Pagina Contatti"],
];
const MODE_HELP: Record<string, string> = {
  open: "Iscrizione libera: chi compila il modulo è subito iscritto, senza approvazione.",
  limited: "Posti limitati: l'iscrizione è confermata subito finché ci sono posti. Alla capienza le iscrizioni si chiudono da sole.",
  approval: "Su approvazione: ogni richiesta resta «in attesa» finché non la approvi tu.",
  reserved: "Riservata: ogni richiesta resta «in attesa». Il requisito dichiarato viene raccolto ma NON conferma nulla: decidi tu dopo la verifica.",
};

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <Card className="space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        {description && <p className="mt-1 text-ink-soft">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

export function EventForm({ initial, meta }: { initial: EventFormInitial; meta: EventFormMeta }) {
  const [state, action] = useActionState<ActionState, FormData>(saveEventAction, null);
  const err = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const [ctaType, setCtaType] = useState(initial.ctaType);
  const [mode, setMode] = useState(initial.registrationMode || "open");
  const isReg = ctaType === "registration";

  return (
    <form action={action} className="space-y-8" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <Section title="Dati dell'evento">
        <Input name="title" label="Titolo" required defaultValue={initial.title} maxLength={140} error={err.title} />
        <Input name="slug" label="Indirizzo della pagina" defaultValue={initial.slug} maxLength={80} error={err.slug} hint={`Parte finale dell'URL (solo lettere minuscole, numeri e trattini). Se vuoto si crea dal titolo. Risultato: /eventi/${initial.slug || "titolo-dell-evento"}`} />
        <Textarea name="summary" label="Sintesi" rows={3} defaultValue={initial.summary} maxLength={300} error={err.summary} hint="Due righe che compaiono nell'elenco e nelle anteprime (max 300 caratteri)." />
        <RichTextEditor name="body" label="Descrizione" defaultHtml={initial.bodyHtml} hint="Il testo completo mostrato nella pagina dell'evento." error={err.body} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input name="startsAt" type="datetime-local" label="Inizio" required defaultValue={initial.startsAt} error={err.startsAt} hint="Ora italiana." />
          <Input name="endsAt" type="datetime-local" label="Fine" defaultValue={initial.endsAt} error={err.endsAt} hint="Se vuota, l'evento passa a «concluso» all'orario di inizio." />
        </div>
        <Input name="location" label="Luogo" defaultValue={initial.location} maxLength={200} error={err.location} />
        <Input name="audience" label="A chi è rivolto" defaultValue={initial.audience} maxLength={300} error={err.audience} hint="Per esempio «Famiglie e ragazzi». Se vuoto si mostra la categoria." />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Select name="categoryId" label="Categoria" defaultValue={initial.categoryId} error={err.categoryId}>
              <option value="">Nessuna categoria</option>
              {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <p className="mt-1.5 text-sm"><Link href={adminPaths.eventCategories} className="text-terracotta-deep underline" target="_blank" rel="noopener noreferrer">Gestisci le categorie<span className="sr-only"> (nuova scheda)</span></Link></p>
          </div>
          <Select name="status" label="Stato" required defaultValue={initial.status} error={err.status} hint="Solo gli eventi «Pubblicato» sono visibili ai visitatori. Bozza e Nascosto danno pagina non trovata.">
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
            <option value="hidden">Nascosto</option>
          </Select>
        </div>
        <MediaPicker name="coverId" label="Immagine di copertina" defaultValue={initial.coverId} options={meta.media} error={err.coverId} hint="Se non c'è, il sito mostra una grafica decorativa. Carica le immagini in «Media»." />
        <Checkbox name="featured" label="In evidenza nella Home" defaultChecked={initial.featured} hint="Gli eventi in evidenza vengono mostrati per primi tra i prossimi appuntamenti." />
      </Section>

      <Section title="Azione principale" description="Il pulsante che compare nella pagina dell'evento.">
        <Select name="ctaType" label="Cosa possono fare i visitatori?" value={ctaType} onChange={(e) => setCtaType(e.target.value as EventFormInitial["ctaType"])} error={err.ctaType}>
          {CTA_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        {ctaType !== "none" && !isReg && <Input name="ctaLabel" label="Testo del pulsante" defaultValue={initial.ctaLabel} maxLength={40} error={err.ctaLabel} hint="Se vuoto si usa un testo predefinito." />}
        {ctaType === "external_link" && <Input name="ctaTarget" type="url" label="Indirizzo del link" defaultValue={initial.ctaTarget} placeholder="https://" error={err.ctaTarget} hint="Sono ammessi solo indirizzi sicuri che iniziano con https://." />}
        {ctaType === "whatsapp" && (
          <>
            <Input name="ctaTarget" type="tel" label="Numero WhatsApp" defaultValue={initial.ctaTarget} placeholder="+39 331 1234567" error={err.ctaTarget} hint="Con prefisso internazionale. Il pulsante apre la chat su wa.me." />
            <Textarea name="whatsappText" label="Messaggio già scritto" rows={2} defaultValue={initial.whatsappText} maxLength={300} error={err.whatsappText} hint="Se vuoto: «Ciao! Vorrei avere informazioni sull'evento «Titolo»»." />
          </>
        )}
        {ctaType === "email" && <Input name="ctaTarget" type="email" label="Indirizzo email" defaultValue={initial.ctaTarget} error={err.ctaTarget} hint="Il pulsante apre la posta con oggetto già compilato." />}
        {ctaType === "contact" && <p className="text-sm text-ink-soft">Il pulsante porta alla pagina Contatti.</p>}
      </Section>

      {isReg && (
        <>
          <Section title="Regole di iscrizione">
            <div>
              <Select name="registrationMode" label="Modalità" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} error={err.registrationMode} required>
                <option value="open">Iscrizione libera</option>
                <option value="limited">Posti limitati</option>
                <option value="approval">Su approvazione</option>
                <option value="reserved">Riservata (categoria con verifica)</option>
              </Select>
              <p className="mt-2 text-sm text-ink-soft">{MODE_HELP[mode]}</p>
            </div>
            {mode === "reserved" && <Textarea name="reservedCriteria" label="A chi è riservato e come verifichi" rows={3} defaultValue={initial.reservedCriteria} maxLength={600} error={err.reservedCriteria} hint="Per esempio «Soci e partner della cooperativa: controllo l'elenco prima di approvare». Il testo è mostrato ai visitatori. Una semplice dichiarazione non basta: la conferma resta sempre manuale." />}
            {mode !== "open" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Input name="capacity" type="number" min={1} label={mode === "limited" ? "Capienza (posti totali)" : "Capienza (facoltativa)"} required={mode === "limited"} defaultValue={initial.capacity} error={err.capacity} hint="La capienza conta i posti richiesti, non i moduli." />
              </div>
            )}
            <Input name="maxSeatsPerRequest" type="number" min={1} max={50} label="Posti per richiesta (massimo)" defaultValue={initial.maxSeatsPerRequest} error={err.maxSeatsPerRequest} hint="1 = una persona per iscrizione. Se più di 1, aggiungi nel modulo il campo «Numero di partecipanti»." />
            {(mode === "approval" || mode === "reserved") && (
              <div className="rounded-control border border-line bg-paper p-4">
                <Checkbox name="pendingHoldsSeats" label="Le richieste in attesa occupano i posti" defaultChecked={initial.pendingHoldsSeats} error={err.pendingHoldsSeats}
                  hint="Se attivo, appena arriva una richiesta i posti vengono bloccati (e il sito lo dichiara) finché non la approvi o rifiuti: si evita di accettare più richieste dei posti. Se spento, le richieste non occupano posti e la disponibilità si controlla quando approvi: potresti non poter approvare tutti. Serve una capienza." />
                {meta.pendingCount > 0 && <p className="mt-2 text-sm text-warning">Ci sono {meta.pendingCount} richieste in attesa: finché non le gestisci non puoi cambiare questa opzione né la presenza di una capienza.</p>}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input name="registrationOpensAt" type="datetime-local" label="Le iscrizioni aprono il" defaultValue={initial.registrationOpensAt} error={err.registrationOpensAt} hint="Facoltativo. Ora italiana." />
              <Input name="registrationClosesAt" type="datetime-local" label="Le iscrizioni chiudono il" defaultValue={initial.registrationClosesAt} error={err.registrationClosesAt} hint="Facoltativo. In ogni caso si chiudono quando l'evento è concluso." />
            </div>
            <Checkbox name="registrationManuallyClosed" label="Iscrizioni chiuse manualmente" defaultChecked={initial.registrationManuallyClosed} hint="Blocca subito nuove iscrizioni, anche se ci sono posti." />
            <Textarea name="privacyNote" label="Informativa breve nel modulo" rows={3} defaultValue={initial.privacyNote} maxLength={1500} error={err.privacyNote} hint="Mostrata sopra la casella «Ho letto l'informativa privacy» (sempre obbligatoria). Da concordare con il titolare del trattamento." />
          </Section>

          <Section title="Modulo di iscrizione" description="Scegli cosa chiedere. Nome ed email ci sono sempre.">
            <FormBuilder initial={meta.fields} reserved={mode === "reserved"} version={meta.formVersion} registrationsCount={meta.registrationsCount} error={err.formFields} />
          </Section>
        </>
      )}

      <Section title="Messaggi personalizzati" description="Facoltativi. Se li lasci vuoti il sito usa i testi standard (modificabili in Pagine > Eventi).">
        <details>
          <summary className="cursor-pointer text-[0.97rem] font-medium text-terracotta-deep">Mostra i campi</summary>
          <div className="mt-5 space-y-5">
            {([
              ["confirmed", "Dopo un'iscrizione confermata"],
              ["pending", "Dopo una richiesta in attesa"],
              ["full", "Posti esauriti"],
              ["closed", "Iscrizioni terminate"],
              ["past", "Evento concluso"],
              ["notYetOpen", "Iscrizioni non ancora aperte"],
            ] as const).map(([k, label]) => (
              <Textarea key={k} name={`msg_${k}`} label={label} rows={2} maxLength={300} defaultValue={initial.messages[k]} placeholder={meta.defaults[k]} error={err[`msg_${k}`]} />
            ))}
          </div>
        </details>
      </Section>

      <Section title="Motori di ricerca e condivisione">
        <details>
          <summary className="cursor-pointer text-[0.97rem] font-medium text-terracotta-deep">Mostra i campi</summary>
          <div className="mt-5 space-y-5">
            <Input name="seoTitle" label="Titolo per Google" defaultValue={initial.seoTitle} maxLength={70} error={err.seoTitle} hint="Se vuoto si usa il titolo dell'evento." />
            <Textarea name="seoDescription" label="Descrizione per Google" rows={3} defaultValue={initial.seoDescription} maxLength={200} error={err.seoDescription} hint="Se vuota si usa la sintesi. L'immagine di condivisione è la copertina." />
          </div>
        </details>
      </Section>

      <SaveBar state={state} label={initial.id ? "Salva evento" : "Crea evento"} />
    </form>
  );
}
