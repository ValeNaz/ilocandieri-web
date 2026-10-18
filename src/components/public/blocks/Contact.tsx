import { Container, Section } from "@/components/ui";
import { ContactForm } from "@/components/public/contact/ContactForm";
import type { BlockDataOf } from "@/lib/content/blocks";
import { getSetting } from "@/lib/settings";
import { FORM_TOKEN_FIELD } from "@/lib/security";
import { issueContactToken } from "@/lib/content/contact";
import { whatsappUrl } from "@/lib/content/contact-info";
import { BlockHeading, OptionalEyebrow, Paragraphs, type HeadingLevel } from "./shared";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-lg">{children}</dd>
    </div>
  );
}

export async function ContactBlock({ data, level }: { data: BlockDataOf<"contact">; level: HeadingLevel }) {
  const org = await getSetting("org");
  const social = Object.entries(org.social).filter(([, v]) => v) as [string, string][];
  const wa = whatsappUrl(org.whatsapp);
  const token = issueContactToken();
  const maps = org.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.address)}` : null;
  const link = "font-medium text-terracotta-deep underline decoration-terracotta-deep/40 hover:decoration-terracotta-deep";
  return (
    <Section id={data.slot} className="py-12 sm:py-20">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
          <BlockHeading level={level} className="text-[clamp(2.2rem,5.4vw,4rem)] font-medium leading-[1.04]">{data.title}</BlockHeading>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft"><Paragraphs text={data.text} /></div>

          <h2 className="sr-only">Recapiti</h2>
          <dl className="mt-10">
            <Row label="Cooperativa">{org.name}</Row>
            {org.phone && <Row label="Telefono"><a className={link} href={`tel:${org.phone.replace(/[^+\d]/g, "")}`}>{org.phone}</a></Row>}
            {org.email && <Row label="Email"><a className={`${link} break-all`} href={`mailto:${org.email}`}>{org.email}</a></Row>}
            {wa && <Row label="WhatsApp"><a className={link} href={wa} target="_blank" rel="noopener noreferrer">Scrivici su WhatsApp<span className="sr-only"> (si apre in una nuova scheda)</span></a></Row>}
            {org.address && (
              <Row label="Sede">
                {org.address}
                {maps && <> · <a className={link} href={maps} target="_blank" rel="noopener noreferrer">Apri la mappa<span className="sr-only"> (si apre in una nuova scheda)</span></a></>}
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
          <div className="rounded-card border border-line bg-card p-6 shadow-card sm:p-9">
            <h2 className="font-display text-2xl font-medium sm:text-3xl">{data.formTitle}</h2>
            <ContactForm tokenField={FORM_TOKEN_FIELD} token={token} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
