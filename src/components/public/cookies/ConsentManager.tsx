"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { paths } from "@/lib/paths";

export const CONSENT_COOKIE = "il_consent";
export const OPEN_PREFS_EVENT = "il:open-cookie-prefs";
const CHANGED_EVENT = "il:consent-changed";

type Consent = "granted" | "denied" | "";

function read(): Consent {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`));
  return (m?.[1] as Consent) ?? "";
}
function subscribe(cb: () => void) {
  window.addEventListener(CHANGED_EVENT, cb);
  return () => window.removeEventListener(CHANGED_EVENT, cb);
}
function write(v: "granted" | "denied") {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${v}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGED_EVENT));
}
function dropAnalyticsCookies() {
  for (const name of document.cookie.split("; ").map((c) => c.split("=")[0]!)) {
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      const host = location.hostname.split(".");
      for (let i = 0; i < host.length - 1; i++) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${host.slice(i).join(".")}`;
    }
  }
}

/**
 * Cookie consent + Google Analytics loader. Rendered only when a (valid) GA4 id is configured in admin settings:
 * with no non-technical integration there is no banner and nothing is loaded.
 * GA is injected ONLY after "Accetta"; "Rifiuta" and "no choice yet" load nothing.
 */
export function ConsentManager({ gaId }: { gaId: string }) {
  const consent = useSyncExternalStore(subscribe, read, () => "pending" as const);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_PREFS_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, open);
  }, []);

  if (!gaId) return null;
  const showBanner = consent === "" || (reopened && consent !== "pending");

  const choose = (v: "granted" | "denied") => {
    const was = consent;
    write(v);
    setReopened(false);
    if (v === "denied" && was === "granted") {
      dropAnalyticsCookies();
      location.reload(); // stop the already loaded script
    }
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {showBanner && (
        <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-desc"
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-[1.5rem] border-[3px] border-ink bg-card p-5 shadow-[0.45rem_0.45rem_0_0_var(--color-limone)] sm:inset-x-6 sm:bottom-6 sm:p-6">
          <h2 id="cookie-title" className="font-display text-xl font-extrabold">Cookie di misurazione</h2>
          <p id="cookie-desc" className="mt-2 text-[0.95rem] text-ink-soft">
            Usiamo Google Analytics per capire come viene usato il sito, solo se acconsenti. Il sito funziona allo stesso modo anche se rifiuti.{" "}
            <Link href={paths.cookies} className="font-semibold text-cobalto underline">Cookie Policy</Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => choose("granted")}>Accetta</Button>
            <Button variant="secondary" onClick={() => choose("denied")}>Rifiuta</Button>
          </div>
        </div>
      )}
    </>
  );
}

/** Link/button that re-opens the consent banner (footer, cookie policy). */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_PREFS_EVENT))}>
      Preferenze cookie
    </button>
  );
}
