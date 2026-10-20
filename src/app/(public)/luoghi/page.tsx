import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { FieldTeaser, GardenTeaser, GATE_AR, GateScene, MAP_PINS, MapScene, PinGlyph, StepAlive, StepKey, StepPlot, WelcomeTeaser } from "@/components/public/art/luoghi/HubScenes";
import { ClosingRoom, Pill } from "@/components/public/art/luoghi/ui";
import "@/components/public/art/luoghi/luoghi.css";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "I luoghi: dal bene confiscato al posto che vive",
  description:
    "Il Giardino delle Arance, il Campo Unità d'Italia e la casa dell'accoglienza: i luoghi di Castelvetrano che I Locandieri hanno restituito alla comunità.",
  alternates: { canonical: paths.places },
};

const steps = [
  { tone: "orange", title: "Confiscato", text: "Un terreno, una casa: tolti alla criminalità organizzata, passano allo Stato.", Art: StepPlot, offset: "" },
  { tone: "yellow", title: "Assegnato", text: "La legge 109 del 1996 permette di affidarlo a enti e cooperative per fini sociali. Nasce da una raccolta di firme promossa da Libera.", Art: StepKey, offset: "md:mt-14" },
  { tone: "green", title: "Vissuto", text: "Qualcuno apre il cancello. Si coltiva, si gioca, si abita. Il bene torna a servire a chi vive intorno.", Art: StepAlive, offset: "md:mt-28" },
] as const;

const places = [
  { href: paths.placeGarden, label: "Giardino delle Arance", pin: MAP_PINS.garden },
  { href: paths.placeField, label: "Campo Unità d'Italia", pin: MAP_PINS.field },
  { href: paths.welcome, label: "La casa dell'accoglienza", pin: MAP_PINS.welcome },
] as const;

export default function LuoghiPage() {
  return (
    <>
      {/* 1. Apertura: il cancello si apre */}
      <Room tone="orange" className="lw-hero pt-10 sm:pt-14">
        <Wrap className="relative z-10">
          <p className="t-label">I luoghi di Castelvetrano</p>
          <Kinetic as="h1" text="Beni confiscati. Luoghi vivi." className="t-mega lw-h1 mt-3" />
          <p className="t-lead mt-4">Terreni e case tolti alla criminalità organizzata e restituiti a chi ci vive intorno. Ecco dove sono e cosa ci si fa.</p>
        </Wrap>
        <div className="lw-hero-art mx-auto w-full max-w-[96rem]" style={{ "--ar": GATE_AR } as CSSProperties}>
          <GateScene />
        </div>
      </Room>

      {/* 2. Il passaggio: tre passi */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap>
          <h2 className="t-giant max-w-[18ch]">Prima una legge, poi il cancello</h2>
          <p className="t-lead mt-6">Un bene confiscato non diventa un luogo da solo. Succede in tre passi, e il terzo lo fanno le persone.</p>
          <ol className="mt-14 grid gap-6 md:grid-cols-3 md:items-start">
            {steps.map(({ tone, title, text, Art, offset }, i) => (
              <li key={title} className={`lw-panel p-6 pb-8 sm:p-8 rise ${offset} ${tone === "orange" ? "lw-orange" : tone === "yellow" ? "lw-yellow" : "lw-green"}`} style={tone === "green" ? { color: "var(--c-white)" } : { color: "var(--c-ink)" }}>
                <div className="aspect-[320/220]"><Art /></div>
                <h3 className="t-head mt-5"><span className="sr-only">Passo </span>{i + 1}. {title}</h3>
                <p className="t-body mt-3">{text}</p>
              </li>
            ))}
          </ol>
        </Wrap>
      </Room>

      {/* 3. La mappa */}
      <Room tone="green" className="py-20 sm:py-28">
        <Wrap className="grid gap-10 md:grid-cols-12 md:items-center md:gap-12">
          <div className="md:col-span-8 md:order-1">
            <MapScene />
          </div>
          <div className="md:col-span-4 md:order-2">
            <h2 className="t-scene">Tre posti, un percorso</h2>
            <p className="t-body mt-5">Dal centro storico alla campagna, il filo arancione passa dove lavoriamo. Ogni segnaposto porta il segno del suo luogo.</p>
            <ul className="mt-8 flex flex-col items-start gap-4">
              {places.map((p, i) => (
                <li key={p.href} className="flex items-center gap-4">
                  <PinGlyph mark={p.pin} />
                  <Pill href={p.href} solid={i === 0}>{p.label}</Pill>
                </li>
              ))}
            </ul>
            <p className="t-body mt-8">
              Castelvetrano, in provincia di Trapani, sta nella Valle del Belice, a pochi chilometri dal mare e dai templi di Selinunte. Il centro storico è a due passi dal Giardino delle Arance.
            </p>
          </div>
        </Wrap>
      </Room>

      {/* 4. Giardino */}
      <Room tone="yellow" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-16">
          <GardenTeaser />
          <div>
            <p className="t-label">Vicino al centro storico</p>
            <h2 className="t-scene mt-3">Il Giardino delle Arance</h2>
            <p className="t-body mt-5">Un bene confiscato con un casolare di fine Settecento, due ettari di agrumeto recuperati e un orto biologico intensivo. Nel casolare ristrutturato vive una comunità alloggio per minori.</p>
            <div className="mt-8"><Pill href={paths.placeGarden}>Entra nel giardino</Pill></div>
          </div>
        </Wrap>
      </Room>

      {/* 5. Campo */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          <div className="md:order-1">
            <p className="t-label">In via SS. Trinità</p>
            <h2 className="t-scene mt-3">Il Campo Unità d&apos;Italia</h2>
            <p className="t-body mt-5">Un terreno confiscato dove si fa sport: avviamento dai 3 anni, pallavolo per i ragazzi. Secondo la cooperativa lo frequentano circa 200 tra bambini e ragazzi.</p>
            <div className="mt-8"><Pill href={paths.placeField}>Vai al campo</Pill></div>
          </div>
          <div className="md:order-2"><FieldTeaser /></div>
        </Wrap>
      </Room>

      {/* 6. La casa */}
      <Room tone="orange" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-16">
          <WelcomeTeaser />
          <div>
            <p className="t-label">Accoglienza dal 2008</p>
            <h2 className="t-scene mt-3">La casa dell&apos;accoglienza</h2>
            <p className="t-body mt-5">I Locandieri accolgono persone migranti dal 2008. Tra le attività c&apos;è il CAS Locanda. Sul percorso trovi solo il segno della casa, senza indirizzi.</p>
            <div className="mt-8"><Pill href={paths.welcome}>Come accogliamo</Pill></div>
          </div>
        </Wrap>
      </Room>

      <ClosingRoom
        tone="green"
        title="Scegli da dove cominciare"
        text="Il Giardino produce, il Campo fa giocare, la casa accoglie. Vieni a vedere come si costruisce, una stanza dopo l'altra."
        links={[
          { href: paths.placeGarden, label: "Giardino delle Arance" },
          { href: paths.placeField, label: "Campo Polivalente" },
        ]}
      />
    </>
  );
}
