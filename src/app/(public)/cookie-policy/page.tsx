import type { Metadata } from "next";
import { PageView } from "@/components/public/blocks/PageView";
import { Container } from "@/components/ui";
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
        <Container className="pb-16">
          <div className="mx-auto max-w-3xl rounded-card border border-line bg-card p-6 shadow-card">
            {gaActive ? (
              <>
                <h2 className="font-display text-xl font-medium">Le tue preferenze</h2>
                <p className="mt-2 text-ink-soft">Puoi cambiare in qualsiasi momento la scelta sui cookie di misurazione.</p>
                <CookiePreferencesButton className="mt-4 inline-flex min-h-11 items-center rounded-full border border-ink/80 px-6 font-medium hover:bg-ink hover:text-paper" />
              </>
            ) : (
              <p className="text-ink-soft">Al momento questo sito non utilizza cookie di misurazione o di profilazione: non è richiesta alcuna scelta.</p>
            )}
          </div>
        </Container>
      }
    />
  );
}
