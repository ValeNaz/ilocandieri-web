import Link from "next/link";
import { CookiePreferencesButton } from "@/components/public/cookies/ConsentManager";
import { Room, Wrap } from "@/components/public/kit/Room";
import { safeGaId } from "@/lib/content/analytics";
import { legalNav, navGroups } from "@/lib/nav";
import { paths } from "@/lib/paths";
import { getSetting } from "@/lib/settings";
import { Wordmark } from "./Wordmark";
import "./chrome.css";
import { EmailText } from "@/components/public/EmailText";

/** Column headings for the footer map: the header groups, plus one column for the single entries. */
const HEADINGS: Record<string, string> = { "Chi siamo": "Cooperativa" };
const COLUMNS = [
  ...navGroups.filter((g) => g.children).map((g) => ({ title: HEADINGS[g.label] ?? g.label, links: g.children!.map(({ label, href }) => ({ label, href })) })),
  { title: "Partecipa", links: navGroups.filter((g) => !g.children).map(({ label, href }) => ({ label, href })) },
];

export async function Footer() {
  const [org, footer, analytics] = await Promise.all([getSetting("org"), getSetting("footer"), getSetting("analytics")]);
  const hasConsent = Boolean(safeGaId(analytics.gaMeasurementId));
  const social = Object.entries(org.social).filter(([, v]) => v) as [string, string][];
  const tel = org.phone ? org.phone.replace(/[^+\d]/g, "") : "";
  return (
    <Room as="footer" tone="green" className="ftr">
      <Wrap>
        <div className="ftr-top">
          <div className="ftr-intro">
            <Link href="/" className="ftr-tag" aria-label="I Locandieri, cooperativa sociale: home"><Wordmark tone="light" /></Link>
            <p className="ftr-line">{footer.line}</p>
          </div>
          <Link href={paths.contacts} className="pill pill-solid ftr-cta">Scrivici <span className="arrow" aria-hidden="true">→</span></Link>
        </div>

        <div className="ftr-cols">
          <nav aria-label="Mappa del sito" className="ftr-map">
            {COLUMNS.map((col) => (
              <div key={col.title} className="ftr-col">
                <h2 className="ftr-h">{col.title}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="ftr-col ftr-contact">
            <h2 className="ftr-h">Contatti</h2>
            <address>
              <p className="ftr-org">{org.name}</p>
              {org.address && <p>{org.address}</p>}
              {tel && <p><a href={`tel:${tel}`}>{org.phone}</a></p>}
              {org.email && <p><a href={`mailto:${org.email}`}><EmailText email={org.email} /></a></p>}
            </address>
            {social.length > 0 && (
              <ul className="ftr-social" aria-label="Social">
                {social.map(([k, url]) => (
                  <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className="capitalize">{k}<span className="sr-only"> (si apre in una nuova scheda)</span></a></li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ftr-legal">
          <p>© {new Date().getFullYear()} {org.name}{org.vatId && <span> · P.IVA {org.vatId}</span>}</p>
          <ul>
            {legalNav.map((i) => (
              <li key={i.href}><Link href={i.href}>{i.label}</Link></li>
            ))}
            {hasConsent && <li><CookiePreferencesButton className="ftr-prefs" /></li>}
          </ul>
        </div>
      </Wrap>
    </Room>
  );
}
