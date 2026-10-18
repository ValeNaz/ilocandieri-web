"use client";

import type { ReactNode } from "react";
import { useSafeForm } from "./useSafeForm";
import { saveAnalyticsAction, saveNotificationsAction, saveOrgAction, saveRetentionAction, saveSeoDefaultsAction } from "@/app/admin/(panel)/impostazioni/actions";
import { SaveBar } from "@/components/admin/SaveBar";
import { Checkbox, Input, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import type { AnalyticsSettings, FooterSettings, NotificationSettings, OrgSettings, RetentionSettings, SeoDefaults } from "@/lib/settings";
import { MediaPicker, type MediaOption } from "./MediaPicker";

type Act = (p: ActionState, fd: FormData) => Promise<ActionState>;
function useErr(state: ActionState) {
  return state && !state.ok ? state.fieldErrors : undefined;
}
function Box({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
      <h2 id={id} className="font-display text-2xl font-medium">{title}</h2>
      {intro && <p className="mb-6 mt-1 max-w-2xl text-ink-soft">{intro}</p>}
      <div className={intro ? "" : "mt-6"}>{children}</div>
    </section>
  );
}

function VerifyBox({ field, on }: { field: string; on: boolean }) {
  return <Checkbox name={`verify_${field}`} defaultChecked={on} label="Da verificare con la cooperativa" id={`verify_${field}`} />;
}

export function OrgForm({ org, footer }: { org: OrgSettings; footer: FooterSettings }) {
  const { state, onSubmit } = useSafeForm(saveOrgAction as Act);
  const err = useErr(state);
  const v = (f: string) => org.toVerify.includes(f);
  return (
    <Box id="org-h" title="Recapiti della cooperativa" intro="Compaiono nel footer, nella pagina Contatti e nei testi legali. Spunta «Da verificare» finché il dato non è confermato: resta solo un promemoria per chi gestisce il sito.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Input label="Nome" name="name" defaultValue={org.name} required error={err?.name} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2"><Input label="Telefono" name="phone" defaultValue={org.phone} error={err?.phone} /><VerifyBox field="phone" on={v("phone")} /></div>
          <div className="space-y-2"><Input label="Email" name="email" type="email" defaultValue={org.email} error={err?.email} /><VerifyBox field="email" on={v("email")} /></div>
          <div className="space-y-2"><Input label="WhatsApp" name="whatsapp" defaultValue={org.whatsapp} error={err?.whatsapp} hint="Con prefisso internazionale. Se vuoto il pulsante WhatsApp non compare." /><VerifyBox field="whatsapp" on={v("whatsapp")} /></div>
          <div className="space-y-2"><Input label="Partita IVA" name="vatId" defaultValue={org.vatId} error={err?.vatId} /><VerifyBox field="vatId" on={v("vatId")} /></div>
        </div>
        <div className="space-y-2"><Input label="Indirizzo della sede" name="address" defaultValue={org.address} error={err?.address} /><VerifyBox field="address" on={v("address")} /></div>
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-3 text-sm font-medium">Social (indirizzi https://)</legend>
          <Input label="Facebook" name="facebook" defaultValue={org.social.facebook ?? ""} error={err?.facebook} />
          <Input label="Instagram" name="instagram" defaultValue={org.social.instagram ?? ""} error={err?.instagram} />
          <Input label="LinkedIn" name="linkedin" defaultValue={org.social.linkedin ?? ""} error={err?.linkedin} />
          <Input label="YouTube" name="youtube" defaultValue={org.social.youtube ?? ""} error={err?.youtube} />
        </fieldset>
        <Input label="Frase del footer" name="footerLine" defaultValue={footer.line} required error={err?.footerLine} />
        <SaveBar state={state} sticky={false} />
      </form>
    </Box>
  );
}

export function NotificationsForm({ n }: { n: NotificationSettings }) {
  const { state, onSubmit } = useSafeForm(saveNotificationsAction as Act);
  const err = useErr(state);
  const hint = "Un indirizzo per riga (o separati da virgola). Se vuoto, nessuna notifica viene inviata (i dati restano comunque nel pannello).";
  return (
    <Box id="notif-h" title="Chi riceve le notifiche" intro="Gli indirizzi che ricevono una email quando arriva una nuova iscrizione, candidatura o messaggio. L'invio richiede che la posta (SMTP) sia configurata sul server.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Textarea label="Nuovi messaggi dal modulo contatti" name="contactsTo" rows={2} defaultValue={n.contactsTo.join("\n")} error={err?.contactsTo} hint={hint} />
        <Textarea label="Nuove iscrizioni agli eventi" name="registrationsTo" rows={2} defaultValue={n.registrationsTo.join("\n")} error={err?.registrationsTo} />
        <Textarea label="Nuove candidature" name="applicationsTo" rows={2} defaultValue={n.applicationsTo.join("\n")} error={err?.applicationsTo} />
        <SaveBar state={state} sticky={false} />
      </form>
    </Box>
  );
}

export function AnalyticsForm({ a }: { a: AnalyticsSettings }) {
  const { state, onSubmit } = useSafeForm(saveAnalyticsAction as Act);
  const err = useErr(state);
  return (
    <Box id="an-h" title="Statistiche e Search Console" intro="Lascia vuoto per non attivare nulla: in quel caso il sito non carica alcuno script esterno e non mostra il banner cookie. Quando inserisci l'ID di Google Analytics, il sito mostra il banner e carica lo script solo dopo il consenso del visitatore.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Input label="ID di misurazione Google Analytics 4" name="gaMeasurementId" defaultValue={a.gaMeasurementId} error={err?.gaMeasurementId} placeholder="G-XXXXXXXXXX" />
        <Input label="Codice di verifica Google Search Console" name="searchConsoleVerification" defaultValue={a.searchConsoleVerification} error={err?.searchConsoleVerification} hint="Incolla il valore «content» del tag meta (o l'intero tag): viene inserito nelle pagine pubbliche." />
        <SaveBar state={state} sticky={false} />
      </form>
    </Box>
  );
}

export function RetentionForm({ r }: { r: RetentionSettings }) {
  const { state, onSubmit } = useSafeForm(saveRetentionAction as Act);
  const err = useErr(state);
  return (
    <Box id="ret-h" title="Conservazione dei dati" intro="Per quanti giorni vengono conservati i dati personali. Questi valori compaiono anche nell'informativa privacy.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Candidature e CV (giorni)" name="applicationsDays" type="number" min={30} max={3650} defaultValue={r.applicationsDays} required error={err?.applicationsDays} />
          <Input label="Iscrizioni a eventi passati (giorni)" name="pastRegistrationsDays" type="number" min={30} max={3650} defaultValue={r.pastRegistrationsDays} required error={err?.pastRegistrationsDays} />
        </div>
        <SaveBar state={state} sticky={false} />
      </form>
    </Box>
  );
}

export function SeoDefaultsForm({ s, media }: { s: SeoDefaults; media: MediaOption[] }) {
  const { state, onSubmit } = useSafeForm(saveSeoDefaultsAction as Act);
  const err = useErr(state);
  return (
    <Box id="seo-h" title="SEO predefinita" intro="Valori usati quando una pagina non ha un titolo, una descrizione o un'immagine di condivisione propri.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Input label="Nome del sito" name="siteName" defaultValue={s.siteName} required error={err?.siteName} />
        <Input label="Modello del titolo" name="titleTemplate" defaultValue={s.titleTemplate} required error={err?.titleTemplate} hint="%s viene sostituito dal titolo della pagina, es. «%s | I Locandieri»." />
        <Textarea label="Descrizione predefinita" name="description" rows={3} defaultValue={s.description} error={err?.description} maxLength={200} />
        <MediaPicker name="ogImageId" label="Immagine di condivisione predefinita" defaultValue={s.ogImageId} options={media} error={err?.ogImageId} />
        <SaveBar state={state} sticky={false} />
      </form>
    </Box>
  );
}
