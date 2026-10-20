import type { Metadata } from "next";
import { PageView } from "@/components/public/blocks/PageView";
import "@/components/public/liste/liste.css";
import { Room, Wrap } from "@/components/public/kit/Room";
import { CookiePreferencesButton } from "@/components/public/cookies/ConsentManager";
import { safeGaId } from "@/lib/content/analytics";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { getSetting } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("cookie", paths.cookies);
}

export default async function Page() {
  const gaActive = Boolean(safeGaId((await getSetting("analytics")).gaMeasurementId));
  return (
    <PageView
      pageKey="cookie"
      after={
        <Room tone="yellow" className="py-14 sm:py-20">
          <Wrap>
            <div className="cut cut-white mx-auto max-w-3xl">
              {gaActive ? (
                <>
                  <h2 className="t-head">Le tue preferenze</h2>
                  <p className="mt-3 text-lg">Puoi cambiare in qualsiasi momento la scelta sui cookie di misurazione.</p>
                  <CookiePreferencesButton className="pill pill-solid mt-6" />
                </>
              ) : (
                <p className="text-lg font-bold">Al momento questo sito non utilizza cookie di misurazione o di profilazione: non è richiesta alcuna scelta.</p>
              )}
            </div>
          </Wrap>
        </Room>
      }
    />
  );
}
