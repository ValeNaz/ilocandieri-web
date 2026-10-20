"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import "../chrome.css";
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
        <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-desc" className="ck">
          <div className="ck-body">
            <h2 id="cookie-title" className="ck-title">Cookie di misurazione</h2>
            <p id="cookie-desc" className="ck-text">
              Usiamo Google Analytics per capire come viene usato il sito, solo se acconsenti. Se rifiuti, il sito funziona allo stesso modo.{" "}
              <Link href={paths.cookies}>Leggi la Cookie Policy</Link>
            </p>
            <div className="ck-actions">
              <button type="button" className="pill pill-solid" onClick={() => choose("granted")}>Accetta</button>
              <button type="button" className="pill pill-line" onClick={() => choose("denied")}>Rifiuta</button>
            </div>
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
