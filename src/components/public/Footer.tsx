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
    <footer className="on-dark bg-night text-paper">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 pb-14 pt-20 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Wordmark className="[--mark-line:var(--color-night)]" />
          <p className="mt-8 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,3rem)] font-[650] leading-[1.04] tracking-[-0.03em] text-paper">{footer.line}</p>
        </div>

        <nav aria-label="Navigazione nel footer">
          <h2 className="text-sm font-semibold text-citrus">Il sito</h2>
          <ul className="mt-4 space-y-2 text-night-soft">
            {publicNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-paper">{i.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-citrus">Contatti</h2>
          <address className="mt-4 space-y-2 not-italic text-night-soft">
            <p className="font-medium text-paper">{org.name}</p>
            {org.address && <p>{org.address}</p>}
            {org.phone && <p><a className="hover:text-paper" href={`tel:${org.phone.replace(/\s+/g, "")}`}>{org.phone}</a></p>}
            {org.email && <p><a className="break-all hover:text-paper" href={`mailto:${org.email}`}>{org.email}</a></p>}
            {org.vatId && <p className="text-sm">P.IVA {org.vatId}</p>}
          </address>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {social.map(([k, url]) => (
                <li key={k}><a className="capitalize underline hover:text-paper" href={url} target="_blank" rel="noopener noreferrer">{k}<span className="sr-only"> (nuova scheda)</span></a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-night-soft sm:px-8">
          <p>© {new Date().getFullYear()} {org.name}</p>
          <ul className="flex gap-5">
            {legalNav.map((i) => (
              <li key={i.href}><Link href={i.href} className="underline underline-offset-4 hover:text-paper">{i.label}</Link></li>
            ))}
            {hasConsent && <li><CookiePreferencesButton className="underline underline-offset-4 hover:text-paper" /></li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
