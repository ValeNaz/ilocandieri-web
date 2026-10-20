import type { Metadata } from "next";
import "@/components/public/kit/kit.css";
import { ConsentManager } from "@/components/public/cookies/ConsentManager";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { extractSearchConsoleToken, safeGaId } from "@/lib/content/analytics";
import { getSetting } from "@/lib/settings";

// Public pages read editable content from the DB: render at request time.
export const dynamic = "force-dynamic";

// Search Console verification meta tag: only when configured in admin settings (CONTENT module).
export async function generateMetadata(): Promise<Metadata> {
  const token = extractSearchConsoleToken((await getSetting("analytics")).searchConsoleVerification);
  return token ? { verification: { google: token } } : {};
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Google Analytics is loaded ONLY when configured and after the visitor's consent (ConsentManager).
  const gaId = safeGaId((await getSetting("analytics")).gaMeasurementId);
  return (
    <>
      <a href="#contenuto" className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-full bg-ink px-5 py-3 text-paper focus:outline-offset-4">
        Vai al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <ConsentManager gaId={gaId} />
    </>
  );
}
