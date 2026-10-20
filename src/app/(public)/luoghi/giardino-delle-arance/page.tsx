import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { AERIAL_KEY, AerialPlot, CasolareScene, CrewIcon, GARDEN_AR, GardenHero, KeySwatch, LabScene, SeasonAutumn, SeasonSpring, SeasonSummer, SeasonWinter, WideTable } from "@/components/public/art/luoghi/GardenScenes";
import { RealMedia } from "@/components/public/real/RealMedia";
import { ClosingRoom } from "@/components/public/art/luoghi/ui";
import "@/components/public/art/luoghi/luoghi.css";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Giardino delle Arance: tre ettari confiscati, un casolare, un orto",
  description:
    "Un bene confiscato vicino al centro storico di Castelvetrano: circa tre ettari, un casolare di fine Settecento, due ettari di agrumeto, un orto biologico intensivo e un laboratorio di trasformazione.",
  alternates: { canonical: paths.placeGarden },
};

const seasons = [
  { name: "Autunno", tone: "green", Scene: SeasonAutumn, text: "Si prepara la terra e si mettono a dimora le piantine dell'orto. Sull'arancio i frutti sono ancora piccoli." },
  { name: "Inverno", tone: "orange", Scene: SeasonWinter, text: "Gli agrumi maturano: è il tempo della raccolta delle arance. Le cassette si riempiono sotto gli alberi." },
  { name: "Primavera", tone: "white", Scene: SeasonSpring, text: "Gli agrumi fioriscono e arrivano le api. Nell'orto vanno in terra le piantine nuove." },
  { name: "Estate", tone: "yellow", Scene: SeasonSummer, text: "L'orto dà gli ortaggi di stagione e la terra va tenuta bagnata. Sole alto, filari in fila, acqua." },
] as const;

const groups = [
  { title: "Persone con disabilità o svantaggio", tone: "white", color: "orange", pose: "bend", span: "md:col-span-7" },
  { title: "Giovani del circuito penale", tone: "green", color: "white", pose: "carry", span: "md:col-span-5" },
  { title: "Minori stranieri non accompagnati", tone: "orange", color: "white", pose: "reach", span: "md:col-span-5" },
  { title: "Adulti immigrati", tone: "white", color: "green", pose: "wave", span: "md:col-span-7" },
] as const;

const partners = [
  { name: "Comune di Castelvetrano", cls: "bg-[var(--c-orange)] text-[var(--c-ink)]" },
  { name: "Centro per la Giustizia Minorile per la Sicilia", cls: "bg-[var(--c-green)] text-[var(--c-white)]" },
  { name: "UEPE di Trapani", cls: "bg-[var(--c-yellow)] text-[var(--c-ink)]" },
  { name: "Imprese", cls: "border-2 border-[var(--c-ink)] text-[var(--c-ink)]" },
  { name: "Enti del Terzo settore", cls: "bg-[var(--c-orange)] text-[var(--c-ink)]" },
  { name: "Scuole", cls: "bg-[var(--c-green)] text-[var(--c-white)]" },
];

export default function GiardinoPage() {
  return (
    <>
      {/* 1. Apertura */}
      <Room tone="yellow" className="lw-hero pt-10 sm:pt-14">
        <Wrap className="relative z-10">
          <p className="t-label">Castelvetrano, vicino al centro storico</p>
          <Kinetic as="h1" text="Il Giardino delle Arance" className="t-mega lw-h1 mt-3" />
          <p className="t-lead mt-4">Un bene confiscato di circa tre ettari: un casolare di fine Settecento, un agrumeto, un orto biologico.</p>
        </Wrap>
        <div className="lw-hero-art mx-auto w-full max-w-[96rem]" style={{ "--ar": GARDEN_AR } as CSSProperties}>
          <GardenHero />
        </div>
      </Room>

      {/* 2. Il casolare */}
      <Room tone="orange" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-7">
            <CasolareScene />
          </div>
          <div className="md:col-span-5">
            <p className="t-label">Il casolare</p>
            <h2 className="t-scene mt-3">Una casa di fine Settecento</h2>
            <p className="t-body mt-5">Il casolare è stato ristrutturato e oggi ospita una comunità alloggio per minori.</p>
            <p className="t-body mt-4">È una casa di campagna con più di due secoli. Intorno, i filari.</p>
            <RealMedia id="giardino-casolare" className="mt-8" deco={["sun"]} />
          </div>
        </Wrap>
      </Room>

      {/* 3. I tre ettari dall'alto */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 className="t-giant md:col-span-8">Tre ettari: due di agrumi, il resto orto</h2>
            <p className="t-body md:col-span-4">Due ettari di agrumeto sono stati recuperati. Sul resto c&apos;è un orto biologico intensivo. In mezzo, il casolare.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
            <div className="md:col-span-8"><AerialPlot /></div>
            <div className="md:col-span-4">
              <ul className="flex flex-col gap-4">
                {AERIAL_KEY.map((k) => (
                  <li key={k.label} className="flex items-center gap-4 t-body"><KeySwatch swatch={k.swatch} dot={k.dot} line={k.line} />{k.label}</li>
                ))}
              </ul>
              <p className="t-body mt-6 text-[0.95rem]">Schema illustrativo dall&apos;alto: le proporzioni non sono in scala.</p>
            </div>
          </div>
          <RealMedia id="giardino-agrumeto" className="mt-12" deco={["branch", "birds"]} sizes="(min-width: 1536px) 1440px, 96vw" />
        </Wrap>
      </Room>

      {/* 4. Un anno nell'orto, a strisce */}
      <Room tone="orange" className="py-16 sm:py-20">
        <Wrap>
          <h2 className="t-giant max-w-[18ch]">Un anno nell&apos;orto</h2>
          <p className="t-lead mt-5">Agrumeto e orto seguono le stagioni. Questo è il calendario generale della coltura, non un programma dell&apos;azienda.</p>
        </Wrap>
      </Room>
      {seasons.map(({ name, tone, Scene, text }, i) => (
        <Room key={name} tone={tone} className="py-14 sm:py-20" aria-label={name}>
          <Wrap className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div className={i % 2 ? "md:order-2" : ""}>
              <p className="t-label">Stagione {i + 1} di 4</p>
              <h3 className="t-scene mt-2">{name}</h3>
              <p className="t-lead mt-5">{text}</p>
            </div>
            <div className={i % 2 ? "md:order-1" : ""}><Scene /></div>
          </Wrap>
        </Room>
      ))}

      {/* 5. Laboratorio */}
      <Room tone="green" className="py-20 sm:py-28">
        <Wrap>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 className="t-giant md:col-span-7">Dal campo al barattolo</h2>
            <div className="md:col-span-5">
              <p className="t-lead">Il giardino ha un laboratorio di trasformazione agroalimentare e un centro di distribuzione dei prodotti.</p>
              <p className="t-body mt-4">Tra i prodotti di ABES ci sono sughi, conserve dolci e salate, pasta, farine e legumi.</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <div className="md:flex-[2]"><LabScene /></div>
            <RealMedia id="giardino-laboratorio" className="md:flex-1" shape="polaroid" tilt={-1.5} />
          </div>
        </Wrap>
      </Room>

      {/* 6. Chi ci lavora */}
      <Room tone="yellow" className="py-20 sm:py-28">
        <Wrap>
          <h2 className="t-giant max-w-[16ch]">Al lavoro, insieme</h2>
          <p className="t-lead mt-5">Il giardino coinvolge, con finalità educative e terapeutiche, quattro gruppi di persone.</p>
          <ul className="mt-12 grid gap-5 md:grid-cols-12">
            {groups.map((g) => (
              <li key={g.title} className={`lw-panel flex items-center gap-6 p-6 sm:p-8 ${g.span} ${g.tone === "green" ? "lw-green" : g.tone === "orange" ? "lw-orange" : "lw-white"}`} style={{ color: g.tone === "green" ? "var(--c-white)" : "var(--c-ink)" }}>
                <CrewIcon color={g.color} pose={g.pose} />
                <h3 className="t-head">{g.title}</h3>
              </li>
            ))}
          </ul>
        </Wrap>
      </Room>

      {/* 7. Partner */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap>
          <h2 className="t-giant max-w-[20ch]">Chi siede al tavolo con noi</h2>
          <p className="t-lead mt-5">Questi sono i partner dichiarati del progetto.</p>
          <div className="mx-auto mt-10 max-w-4xl"><WideTable /></div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {partners.map((p) => (
              <li key={p.name} className={`rounded-full px-6 py-3 font-[family-name:var(--font-display)] text-lg font-bold sm:text-xl ${p.cls}`}>{p.name}</li>
            ))}
          </ul>
        </Wrap>
      </Room>

      <ClosingRoom
        tone="orange"
        media={<RealMedia id="giardino-video" className="mx-auto mb-16 max-w-5xl sm:mb-20" />}
        title="Quello che cresce qui lo trovi su ABES"
        text="I prodotti ABES sono biologici e siciliani, nati su terreni confiscati a Castelvetrano. Si comprano su abes.bio. Poi c'è un altro terreno confiscato, dove si gioca."
        links={[
          { href: paths.abes, label: "Scopri ABES" },
          { href: paths.shop, label: "Vai allo shop" },
          { href: paths.placeField, label: "Il Campo Polivalente" },
        ]}
      />
    </>
  );
}
