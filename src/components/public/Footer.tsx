import Link from "next/link";
import { CookiePreferencesButton } from "@/components/public/cookies/ConsentManager";
import { safeGaId } from "@/lib/content/analytics";
import { legalNav, publicNav } from "@/lib/nav";
import { getSetting } from "@/lib/settings";
import { Wordmark } from "./Wordmark";

export async function Footer() {
  const [org, footer, analytics] = await Promise.all([getSetting("org"), getSetting("footer"), getSetting("analytics")]);
  const hasConsent = Boolean(safeGaId(analytics.gaMeasurementId));
  const social = Object.entries(org.social).filter(([, v]) => v) as [string, string][];
  return (
    <footer className="mt-24 bg-ink text-paper on-dark">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark className="text-paper" />
          <p className="mt-5 max-w-xs font-display text-xl leading-snug text-paper/90">{footer.line}</p>
        </div>

        <nav aria-label="Navigazione nel footer">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-sage">Il sito</h2>
          <ul className="mt-4 space-y-2.5">
            {publicNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-arancio">{i.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-sage">Contatti</h2>
          <address className="mt-4 space-y-2.5 not-italic text-paper/90">
            <p className="font-medium text-paper">{org.name}</p>
            {org.address && <p>{org.address}</p>}
            {org.phone && <p><a className="hover:text-arancio" href={`tel:${org.phone.replace(/\s+/g, "")}`}>{org.phone}</a></p>}
            {org.email && <p><a className="break-all hover:text-arancio" href={`mailto:${org.email}`}>{org.email}</a></p>}
            {org.vatId && <p className="text-sm text-paper/70">P.IVA {org.vatId}</p>}
          </address>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {social.map(([k, url]) => (
                <li key={k}><a className="capitalize underline hover:text-arancio" href={url} target="_blank" rel="noopener noreferrer">{k}<span className="sr-only"> (nuova scheda)</span></a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-paper/75 sm:px-8">
          <p>© {new Date().getFullYear()} {org.name}</p>
          <ul className="flex gap-5">
            {legalNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="underline underline-offset-4 hover:text-arancio">{i.label}</Link></li>
            ))}
            {hasConsent && <li><CookiePreferencesButton className="underline underline-offset-4 hover:text-arancio" /></li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
