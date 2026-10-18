"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui";

/** Share = copy link (always works) + WhatsApp + email. No third-party scripts or trackers. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia questo indirizzo", url);
    }
  };
  const enc = encodeURIComponent;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={copy} className={buttonClasses("secondary", "sm")}>{copied ? "Link copiato" : "Copia il link"}</button>
      <a href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm")}>WhatsApp<span className="sr-only"> (si apre in una nuova scheda)</span></a>
      <a href={`mailto:?subject=${enc(title)}&body=${enc(url)}`} className={buttonClasses("secondary", "sm")}>Email</a>
      <span role="status" aria-live="polite" className="sr-only">{copied ? "Link copiato negli appunti" : ""}</span>
    </div>
  );
}
