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
    <footer className="relative overflow-hidden bg-ink text-paper on-dark">
      <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 pb-12 pt-20 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Wordmark className="text-paper [--mark-line:var(--color-ink)]" />
          <p className="mt-6 max-w-sm font-display text-2xl font-bold leading-snug text-paper">{footer.line}</p>
        </div>

        <nav aria-label="Navigazione nel footer">
          <h2 className="font-stencil text-sm font-bold uppercase tracking-[0.2em] text-limone">Il sito</h2>
          <ul className="mt-4 space-y-2.5">
            {publicNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-limone">{i.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-stencil text-sm font-bold uppercase tracking-[0.2em] text-limone">Contatti</h2>
          <address className="mt-4 space-y-2.5 not-italic text-paper/90">
            <p className="font-medium text-paper">{org.name}</p>
            {org.address && <p>{org.address}</p>}
            {org.phone && <p><a className="hover:text-limone" href={`tel:${org.phone.replace(/\s+/g, "")}`}>{org.phone}</a></p>}
            {org.email && <p><a className="break-all hover:text-limone" href={`mailto:${org.email}`}>{org.email}</a></p>}
            {org.vatId && <p className="text-sm text-paper/70">P.IVA {org.vatId}</p>}
          </address>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {social.map(([k, url]) => (
                <li key={k}><a className="capitalize underline hover:text-limone" href={url} target="_blank" rel="noopener noreferrer">{k}<span className="sr-only"> (nuova scheda)</span></a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1000 124" preserveAspectRatio="xMidYMax meet" className="pointer-events-none block w-full select-none px-4">
        <text x="0" y="118" textLength="1000" lengthAdjust="spacingAndGlyphs" fontFamily="var(--font-hepta), serif" fontWeight="800" fontSize="158" className="fill-terracotta-deep">I LOCANDIERI</text>
      </svg>
      <div className="relative border-t-[3px] border-paper/20 bg-ink">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-paper/80 sm:px-8">
          <p>© {new Date().getFullYear()} {org.name}</p>
          <ul className="flex gap-5">
            {legalNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="underline underline-offset-4 hover:text-limone">{i.label}</Link></li>
            ))}
            {hasConsent && <li><CookiePreferencesButton className="underline underline-offset-4 hover:text-limone" /></li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
