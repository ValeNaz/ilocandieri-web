import type { Metadata } from "next";
import Image from "next/image";
import { AbesLogo } from "@/components/brand/AbesLogo";
import { PillLink } from "@/components/public/abes/PillLink";
import { C } from "@/components/public/art/parts";
import { HeroScene } from "@/components/public/art/abes/hero";
import { STATIONS, STATION_TONES } from "@/components/public/art/abes/stations";
import { Kinetic, LitWords } from "@/components/public/kit/Kinetic";
import { Marquee } from "@/components/public/kit/Marquee";
import { PinScene } from "@/components/public/kit/PinScene";
import { Room, Wrap } from "@/components/public/kit/Room";
import { RealMedia } from "@/components/public/real/RealMedia";
import { paths } from "@/lib/paths";
import "./abes.css";

export const metadata: Metadata = {
  title: "Dal seme al barattolo",
  description: "ABES, il progetto agricolo de I Locandieri: dal chicco di grano Tumminia ai vasetti e alla pasta, passo dopo passo, su terreni confiscati a Castelvetrano.",
};

const STEPS = [
  { name: "Seme", title: "Un chicco di Tumminia", text: "Tumminia è un antico grano duro siciliano a ciclo breve. ABES lo coltiva in biologico a Castelvetrano, su terreni confiscati alla criminalità organizzata." },
  { name: "Terra", title: "Beni confiscati, di nuovo al lavoro", text: "La legge 109/1996 permette di affidare i beni confiscati a cooperative per fini sociali. Qui tornano campi, e il metodo è biologico." },
  { name: "Campo", title: "Grano, ortaggi, agrumi", text: "Al Giardino delle Arance: due ettari di agrumeto recuperati e un orto biologico intensivo. Poi il grano Tumminia e la verdura di stagione." },
  { name: "Raccolta", title: "Una cassetta alla volta", text: "In campo lavorano insieme persone con disabilità o svantaggio, giovani, adulti immigrati. Il lavoro è anche inclusione lavorativa." },
  { name: "Laboratorio", title: "Si trasforma sul posto", text: "Il Giardino ha un laboratorio agroalimentare. Le verdure dell'orto, al giusto punto di maturazione, vanno nei vasetti con olio extravergine Nocellara del Belice." },
  { name: "Barattoli", title: "Vasetti, pasta, farine", text: "Caponata siciliana, cipollata in agrodolce, sugo al basilico, ceci. Busiate e abbracci di Tumminia, farina di ceci, semolato." },
  { name: "Tavola", title: "Poi si mangia", text: "Ordini, prezzi e spedizioni sono sul negozio abes.bio: da lì il vasetto arriva fino a casa tua." },
] as const;

const BAND = ["Grano duro Tumminia", "Frutta e verdura di stagione", "Conserve dolci e salate", "Sughi", "Pasta", "Farine", "Legumi"];

const VALUES = [
  { label: "Etica", phrase: "Rispetto per la terra, per chi lavora, per chi compra.", text: "È l'etica di ABES: ambiente, persone, chi acquista e inclusione lavorativa." },
  { label: "Sociale", phrase: "Al centro ci sono le persone.", text: "Il valore sociale viene prima: il progetto agricolo esiste per loro." },
  { label: "Visione", phrase: "Un'economia che si misura in persone.", text: "Coesione e inclusione. Il valore si conta in persone, relazioni e risorse del territorio." },
] as const;

/** The bench of real photos (public/foto): one slot each in the .abes-bench mosaic (abes.css). */
const BENCH = [
  { slot: "jars", src: "/foto/vasetti-abes.jpg", alt: "Vasetti ABES con l'etichetta, chiusi con tela di juta", caption: "Vasetti con l'etichetta ABES", sizes: "(min-width:1024px) 40vw, 92vw", pos: "50% 45%" },
  { slot: "crates", src: "/foto/cassette-verdure.jpg", alt: "Cassette di verdure davanti al muro ABES", caption: "Verdura di stagione, in cassetta", sizes: "(min-width:1024px) 58vw, 92vw", pos: "50% 72%" },
  { slot: "pasta", src: "/foto/abbracci-banco.jpg", alt: "Confezione di pasta Abbracci ABES su un tavolo di legno", caption: "Abbracci di Tumminia", sizes: "(min-width:1024px) 32vw, 46vw", pos: "52% 55%" },
  { slot: "ceci", src: "/foto/ceci-juta.jpg", alt: "Ceci in un sacco di juta", caption: "Ceci, in sacco di juta", sizes: "(min-width:1024px) 26vw, 46vw", pos: "50% 60%" },
] as const;

function Grains() {
  return (
    <svg viewBox="0 0 40 24" className="inline-block h-5 w-8" aria-hidden="true" focusable="false">
      <ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-24 12 12)" fill={C.yellow} />
      <ellipse cx="28" cy="12" rx="9" ry="6" transform="rotate(24 28 12)" fill={C.yellow} />
    </svg>
  );
}

export default function AbesPage() {
  return (
    <>
      {/* 1. Opening room. Scena: titolo a sinistra, a destra il pannello con i tre prodotti sul bordo del campo (HeroScene).
          Testo e scena in due colonne separate; si muovono solo il titolo (una volta) e il ciuffo di grano. */}
      <Room tone="yellow" className="min-h-[calc(100svh-var(--header-h))] py-10 sm:py-14">
        <Wrap className="grid items-center gap-8 lg:grid-cols-[1.12fr_1fr] lg:gap-6">
          <div className="relative z-10">
            <AbesLogo priority className="mb-6 w-44 sm:w-56" />
            <p className="t-label mb-5">Il progetto agricolo de I Locandieri</p>
            <Kinetic as="h1" text="Dal seme al barattolo." className="t-mega" />
            <p className="t-lead mt-6">Coltiviamo biologico su terreni confiscati a Castelvetrano. Qui trovi tutta la strada, dal chicco di grano al vasetto che arriva a casa tua.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href="#filiera">Scendi nel campo</PillLink>
              <PillLink href={paths.shop} kind="line">Vai allo shop</PillLink>
            </div>
          </div>
          <HeroScene />
        </Wrap>
      </Room>

      {/* 2. Scena: fascia di testo che scorre (cosa cresce e cosa si fa). Un solo movimento, nessuna illustrazione. */}
      <Room tone="green" as="div" className="py-6 sm:py-8">
        <Marquee
          t={46}
          className="t-head"
          separator={<Grains />}
          items={BAND.map((b) => <span key={b} className="[font-family:var(--font-display)] font-bold text-[clamp(1.35rem,2.4vw,2.1rem)]">{b}</span>)}
        />
      </Room>

      {/* 3. Scena fissa: sette stazioni, una alla volta; per stazione al massimo tre livelli che entrano e un solo loop
          (vedi stations.tsx). Il testo sta nella sua colonna (sotto, su telefono), mai sopra il pannello disegnato. */}
      <section id="filiera" aria-labelledby="filiera-titolo" className="scroll-mt-[var(--header-h)]">
        <h2 id="filiera-titolo" className="sr-only">La filiera ABES in sette stazioni: seme, terra, campo, raccolta, laboratorio, barattoli, tavola</h2>
        <PinScene steps={8} className="abes-pin" stageClassName="abes-stage" label="La filiera ABES, dal seme alla tavola">
          <div className="abes-rail" aria-hidden="true">
            <ol>
              <span className="abes-track" />
              <span className="abes-fill" />
              {STEPS.map((s, i) => (
                <li key={s.name} style={{ ["--s" as string]: i === 0 ? -0.05 : i / 7 }}><i /><span>{s.name}</span></li>
              ))}
            </ol>
          </div>
          <ol className="abes-world" aria-label="Le sette stazioni della filiera">
            {STEPS.map((s, i) => {
              const Scene = STATIONS[i]!;
              return (
                <li key={s.name} className={`abes-st room room-${STATION_TONES[i]!.room}`} style={{ ["--i" as string]: i }}>
                  <div className="abes-scene" style={{ background: `var(--c-${STATION_TONES[i]!.panel})` }}><Scene /></div>
                  <div className="abes-cap">
                    <p className="abes-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="t-head">{s.title}</h3>
                    <p>{s.text}</p>
                    {s.name === "Raccolta" && <RealMedia id="abes-raccolta" shape="arch" aspect="4/5" deco={["leaf"]} className="abes-cap-media" caption="La raccolta, dal vero." />}
                  </div>
                </li>
              );
            })}
          </ol>
        </PinScene>
      </section>

      {/* 4. Scena: dal vero, subito dopo la scena fissa. Il banco: le foto vere dei prodotti ABES in un mosaico regolare,
          stessa cornice per tutte, la didascalia come etichetta sulla foto. Nessun disegno qui (il titolo lo promette).
          Il video della filiera, quando c'è, chiude la stanza. */}
      <Room tone="orange" className="py-16 sm:py-24">
        <Wrap>
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <h2 className="t-giant lg:col-span-7">Questi non sono disegni.</h2>
            <p className="t-lead lg:col-span-5">Cassette, vasetti, pasta e ceci: le fotografie sono dei prodotti ABES, come arrivano sul banco.</p>
          </div>
          <div className="abes-bench mt-10 sm:mt-14">
            {BENCH.map((ph) => (
              <figure key={ph.src} className={`abes-ph abes-ph-${ph.slot}`}>
                <Image src={ph.src} alt={ph.alt} fill sizes={ph.sizes} className="object-cover" style={{ objectPosition: ph.pos }} />
                <figcaption className="abes-ph-tag">{ph.caption}</figcaption>
              </figure>
            ))}
          </div>
          <RealMedia id="abes-video" className="mt-12 max-w-[64rem] sm:mt-16" caption="Dal campo al barattolo, dal vero." />
        </Wrap>
      </Room>

      {/* 5. Scena: i tre valori come tipografia, nessuna illustrazione. Si accendono le parole della frase (LitWords). */}
      <Room tone="green" className="py-8 sm:py-16">
        <Wrap>
          <h2 className="t-label pt-6 text-[var(--pop-text)]">I tre valori di ABES</h2>
          {VALUES.map((v) => (
            <div key={v.label} className="abes-val-row grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-9">
                <h3 className="mb-3 [font-family:var(--font-display)] text-[1.5rem] font-bold leading-tight text-[var(--pop)]">{v.label}</h3>
                <p className="abes-val"><LitWords text={v.phrase} /></p>
              </div>
              <p className="t-body lg:col-span-3">{v.text}</p>
            </div>
          ))}
        </Wrap>
      </Room>

      {/* 6. Scena: chiusura, il logo ABES entra una volta (logo-build-view), accanto il testo e le due uscite. */}
      <Room tone="white" className="py-20 sm:py-32">
        <Wrap className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
          <AbesLogo className="logo-build-view mx-auto w-60 sm:w-72 lg:w-80" />
          <div>
            <h2 className="t-giant">Dal campo alla tua tavola.</h2>
            <p className="t-lead mt-6">Guarda i prodotti, poi ordina su abes.bio: prezzi, disponibilità e spedizioni li gestisce il negozio ABES.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href={paths.shop}>Guarda i prodotti</PillLink>
              <PillLink href={paths.abesShop} kind="line">Ordina su abes.bio</PillLink>
            </div>
          </div>
        </Wrap>
      </Room>
    </>
  );
}
