import { ContactHero } from "@/components/public/liste/PageHeroes";
import { Room, Wrap } from "@/components/public/kit/Room";
import "@/components/public/liste/liste.css";
import { ContactForm } from "@/components/public/contact/ContactForm";
import type { BlockDataOf } from "@/lib/content/blocks";
import { getSetting } from "@/lib/settings";
import { FORM_TOKEN_FIELD } from "@/lib/security";
import { issueContactToken } from "@/lib/content/contact";
import { whatsappUrl } from "@/lib/content/contact-info";
import type { HeadingLevel } from "./shared";
import { EmailText } from "@/components/public/EmailText";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-dashed border-ink py-5 first:border-t-0 first:pt-0">
      <dt className="t-label">{label}</dt>
      <dd className="info-v mt-2 !text-[1.3rem]">{children}</dd>
    </div>
  );
}

export async function ContactBlock({ data, level }: { data: BlockDataOf<"contact">; level: HeadingLevel }) {
  const org = await getSetting("org");
  const social = Object.entries(org.social).filter(([, v]) => v) as [string, string][];
  const wa = whatsappUrl(org.whatsapp);
  const token = issueContactToken();
  const maps = org.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.address)}` : null;
  const link = "underline decoration-[3px] decoration-[var(--c-green)] underline-offset-4 hover:bg-[var(--c-white)]";
  return (
    <>
      <ContactHero title={data.title} text={data.text} eyebrow={data.eyebrow || "Contatti"} level={level} />
      <Room tone="yellow" id={data.slot} className="lr-pad">
        <Wrap className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="sr-only">Recapiti</h2>
            <dl>
              <Row label="Cooperativa">{org.name}</Row>
              {org.phone && <Row label="Telefono"><a className={link} href={`tel:${org.phone.replace(/[^+\d]/g, "")}`}>{org.phone}</a></Row>}
              {org.email && <Row label="Email"><a className={link} href={`mailto:${org.email}`}><EmailText email={org.email} /></a></Row>}
              {wa && <Row label="WhatsApp"><a className={link} href={wa} target="_blank" rel="noopener noreferrer">Scrivici su WhatsApp<span className="sr-only"> (si apre in una nuova scheda)</span></a></Row>}
              {org.address && (
                <Row label="Sede">
                  {org.address}
                  {maps && <span className="mt-2 block text-base"><a className={link} href={maps} target="_blank" rel="noopener noreferrer">Apri la mappa<span className="sr-only"> (si apre in una nuova scheda)</span></a></span>}
                </Row>
              )}
              {social.length > 0 && (
                <Row label="Social">
                  <ul className="flex flex-wrap gap-x-5 gap-y-1">
                    {social.map(([k, url]) => <li key={k}><a className={`${link} capitalize`} href={url} target="_blank" rel="noopener noreferrer">{k}<span className="sr-only"> (si apre in una nuova scheda)</span></a></li>)}
                  </ul>
                </Row>
              )}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="cut cut-white pf">
              <h2 className="t-head">{data.formTitle}</h2>
              <ContactForm tokenField={FORM_TOKEN_FIELD} token={token} />
            </div>
          </div>
        </Wrap>
      </Room>
    </>
  );
}
