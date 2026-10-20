import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { Crowd, FIELD_AR, FieldHero, FieldPlan, KidsScene, VolleyScene } from "@/components/public/art/luoghi/FieldScenes";
import { RealMedia } from "@/components/public/real/RealMedia";
import { ClosingRoom } from "@/components/public/art/luoghi/ui";
import "@/components/public/art/luoghi/luoghi.css";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Campo Polivalente Unità d'Italia: un terreno confiscato dove si gioca",
  description:
    "A Castelvetrano, in via SS. Trinità, un terreno confiscato destinato a sport e attività ricreative: avviamento allo sport dai 3 anni, pallavolo per i ragazzi.",
  alternates: { canonical: paths.placeField },
};

export default function CampoPage() {
  return (
    <>
      <Room tone="green" className="lw-hero pt-10 sm:pt-14">
        <Wrap className="relative z-10">
          <p className="t-label">Castelvetrano, via SS. Trinità</p>
          <Kinetic as="h1" text="Il campo dove si comincia a correre" className="t-mega lw-h1 mt-3 max-w-[18ch]" />
          <p className="t-lead mt-4">Un terreno confiscato per lo sport: il Campo Polivalente Unità d&apos;Italia, con le linee di più giochi sullo stesso prato.</p>
        </Wrap>
        <div className="lw-hero-art mx-auto w-full max-w-[96rem]" style={{ "--ar": FIELD_AR } as CSSProperties}><FieldHero /></div>
      </Room>

      <Room tone="white" className="py-20 sm:py-28">
        <Wrap>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 className="t-giant md:col-span-8">Un prato, due sport, tutte le linee</h2>
            <p className="t-body md:col-span-4">Le righe bianche sono del calcio, quelle gialle della pallavolo, con la rete nel mezzo. Scorri e si tracciano. Il campo è polivalente: serve a più giochi, quindi a più ragazzi.</p>
          </div>
          <div className="mt-10"><FieldPlan /></div>
          <RealMedia id="campo-panoramica" className="mt-10" deco={["sun", "ball"]} sizes="(min-width: 1536px) 1440px, 96vw" />
        </Wrap>
      </Room>

      <Room tone="yellow" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <p className="t-label">Dai 3 anni</p>
            <h2 className="t-scene mt-3">Si comincia da piccolissimi</h2>
            <p className="t-body mt-5">L&apos;avviamento allo sport è per i bambini piccoli, dai 3 anni. Coni, cerchi, un pallone: prima si impara a muoversi, poi a giocare insieme.</p>
          </div>
          <div className="md:col-span-7"><KidsScene /></div>
        </Wrap>
      </Room>

      <Room tone="orange" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:order-2 md:col-span-5">
            <p className="t-label">Per i ragazzi</p>
            <h2 className="t-scene mt-3">Poi arriva la rete</h2>
            <p className="t-body mt-5">Per i ragazzi c&apos;è la pallavolo. Ci sono anche attività pensate per i minori ospitati nelle comunità.</p>
            <RealMedia id="campo-attivita" className="mt-8" shape="polaroid" tilt={1.5} />
          </div>
          <div className="md:order-1 md:col-span-7"><VolleyScene /></div>
        </Wrap>
      </Room>

      <Room tone="white" className="pt-20 sm:pt-28">
        <Wrap>
          <h2 className="t-giant max-w-[20ch]">Circa 200 tra bambini e ragazzi</h2>
          <p className="t-lead mt-5">È il dato dichiarato dalla cooperativa: tanti sono, circa, quelli che frequentano il campo. Le fasce d&apos;età cambiano da una fonte all&apos;altra, per questo parliamo di bambini e ragazzi, senza cifre più precise.</p>
        </Wrap>
        <div className="mt-10"><Crowd /></div>
      </Room>

      <ClosingRoom
        tone="yellow"
        title="Il pallone è già in campo"
        text="Guarda quando c'è un evento, o scrivici se vuoi sapere come partecipare."
        links={[{ href: paths.events, label: "Gli eventi" }, { href: paths.contacts, label: "Contatti" }]}
      />
    </>
  );
}
