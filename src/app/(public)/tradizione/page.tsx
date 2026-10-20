import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Ingrediente } from "@/components/public/art/tradizione/Ingrediente";
import { ScenaAgrumi, ScenaCretto, ScenaOlive, ScenaPane, ScenaSelinunte, ScenaTavola, ScenaTumminia, TradLand, TradPeople, TradSky } from "@/components/public/art/tradizione/scenes";
import "@/components/public/art/tradizione/tradizione.css";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Marquee } from "@/components/public/kit/Marquee";
import { Room, Wrap } from "@/components/public/kit/Room";
import { Layer, Stage } from "@/components/public/kit/Stage";
import { RealMedia } from "@/components/public/real/RealMedia";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Tradizione | I Locandieri",
  description: "Selinunte e le Cave di Cusa, il grano Tumminia e il pane nero, le olive Nocellara del Belice, gli agrumi, la memoria del Belice: il territorio che sta dietro i prodotti e i luoghi dei Locandieri.",
  alternates: { canonical: paths.tradition },
};

const Pill = ({ href, children, line }: { href: string; children: React.ReactNode; line?: boolean }) => (
  <Link href={href} className={`pill ${line ? "pill-line" : "pill-solid"}`}>{children} <span className="arrow" aria-hidden="true">→</span></Link>
);

const NAMES = ["Selinunte", "Cave di Cusa", "Tumminia", "Pane nero di Castelvetrano", "Nocellara del Belice", "Agrumi", "Gibellina", "Cretto di Burri"];

export default function TradizionePage() {
  return (
    <>
      {/* Apertura */}
      <Room tone="orange" className="flex min-h-[100svh] flex-col pt-24 sm:pt-28">
        <Wrap className="mb-10 sm:mb-14">
          <p className="t-label mb-5">La tradizione</p>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <Kinetic as="h1" text="Una terra di colonne, grano e ulivi" className="t-mega lg:col-span-8" />
            <p className="t-lead lg:col-span-4">Dietro i prodotti ABES e i luoghi della cooperativa c&apos;è un territorio preciso: la Valle del Belice, a pochi chilometri dal mare e da Selinunte. Qui sono le cose vere, una per una.</p>
          </div>
        </Wrap>
        <Stage className="tr-hero" tilt>
          <Layer z={-30}><TradSky /></Layer>
          <Layer z={0}><TradLand /></Layer>
          <Layer z={22}><TradPeople /></Layer>
        </Stage>
      </Room>

      {/* Striscia dei nomi */}
      <Room tone="yellow" className="names overflow-hidden" aria-label="Luoghi e prodotti del territorio">
        <ul className="sr-only">{NAMES.map((n) => <li key={n}>{n}</li>)}</ul>
        <Marquee t={46} separator={<span className="dot" />} items={NAMES.map((n) => <span key={n} className="t-head">{n}</span>)} />
      </Room>

      <Ingrediente id="selinunte" tone="white" side="left" ar="14/15" label="La pietra" scene={<ScenaSelinunte />}>
        <h2 id="selinunte-t" className="t-scene">Selinunte e le Cave di Cusa.</h2>
        <p className="t-body">Selinunte è una colonia greca fondata nel VII secolo a.C., tradizionalmente intorno al 628 a.C., da coloni venuti da Megara Iblea. I suoi grandi templi sono dorici.</p>
        <p className="t-body">I rocchi delle colonne si tagliavano alle Cave di Cusa, a Campobello di Mazara. Il lavoro si fermò di colpo e molti rocchi sono rimasti lì, incompiuti: ancora oggi si vedono a ogni stadio, dal cerchio appena inciso al pezzo pronto da portare via.</p>
      </Ingrediente>

      <Ingrediente id="tumminia" tone="yellow" side="right" ar="7/8" label="Il grano" scene={<ScenaTumminia />} real={<RealMedia id="tradizione-grano" shape="arch" aspect="4/5" className="ing-real" caption="Tumminia coltivata da ABES." />}>
        <h2 id="tumminia-t" className="t-scene">Tumminia, un grano antico.</h2>
        <p className="t-body">La Tumminia, o Timilia, è un antico grano duro siciliano. Ha un ciclo breve e una farina scura. Tra i prodotti ABES c&apos;è il grano duro Tumminia, e con la sua farina si fa il pane nero di Castelvetrano.</p>
        <div className="ing-actions"><Pill href={paths.abes}>Da seme a barattolo</Pill></div>
      </Ingrediente>

      <Ingrediente id="pane" tone="green" side="left" ar="1/1" label="Il pane" scene={<ScenaPane />} real={<RealMedia id="tradizione-pane" shape="arch" aspect="4/5" className="ing-real" caption="Pane nero di Castelvetrano." />}>
        <h2 id="pane-t" className="t-scene">Il pane nero di Castelvetrano.</h2>
        <p className="t-body">Il pane nero di Castelvetrano si fa con la farina di Tumminia. È un prodotto tradizionale della città e un presidio Slow Food. Si riconosce subito, dal colore.</p>
        <p className="t-body">Si spezza, si mangia con l&apos;olio buono della valle.</p>
      </Ingrediente>

      <Ingrediente id="olive" tone="white" side="right" ar="7/8" label="Le olive" scene={<ScenaOlive />}>
        <h2 id="olive-t" className="t-scene">Nocellara del Belice, oliva e olio.</h2>
        <p className="t-body">La Nocellara del Belice è un&apos;oliva da tavola DOP, grande e verde. Dalla stessa valle viene anche un olio DOP, la Valle del Belice, fatto con le olive di questa varietà.</p>
        <div className="ing-actions"><Pill href={paths.shop} line>Lo shop</Pill></div>
      </Ingrediente>

      <Ingrediente id="agrumi" tone="yellow" side="left" ar="1/1" label="Gli agrumi" scene={<ScenaAgrumi />}>
        <h2 id="agrumi-t" className="t-scene">Due ettari di agrumeto.</h2>
        <p className="t-body">Il Giardino delle Arance, vicino al centro storico di Castelvetrano, ha due ettari di agrumeto recuperato. Il casolare è di fine Settecento. Sul resto della terra c&apos;è un orto biologico.</p>
        <div className="ing-actions"><Pill href={paths.placeGarden}>Il Giardino delle Arance</Pill></div>
      </Ingrediente>

      <Ingrediente id="belice" tone="green" side="right" ar="30/26" label="La memoria" scene={<ScenaCretto />}>
        <h2 id="belice-t" className="t-scene">1968: il terremoto e il Cretto.</h2>
        <p className="t-body">Il terremoto del Belice distrusse Gibellina, Montevago, Salaparuta, Poggioreale e altri paesi della valle. Castelvetrano non fu distrutta come questi paesi, ma la valle è la stessa.</p>
        <p className="t-body">A Gibellina Alberto Burri coprì le macerie della vecchia città con cemento bianco: è il Cretto, iniziato negli anni Ottanta e completato nel 2015. Le fenditure tra i blocchi sono le vie che c&apos;erano.</p>
      </Ingrediente>

      <Ingrediente id="tavola" tone="orange" side="left" ar="12/5" label="La tavola" scene={<ScenaTavola />}>
        <h2 id="tavola-t" className="t-scene">Tutto arriva a tavola.</h2>
        <p className="t-body">Pane, olive, olio, agrumi. ABES mette nei barattoli quello che la terra dà: sughi, conserve dolci e salate, pasta, farine, legumi, grano duro Tumminia. Frutta e verdura di stagione, da terreni confiscati e coltivati in biologico.</p>
        <div className="ing-actions"><Pill href={paths.abes}>ABES</Pill><Pill href={paths.shop} line>Lo shop</Pill><Pill href={paths.places} line>I luoghi</Pill></div>
      </Ingrediente>

      {/* Chiusura */}
      <Room tone="white" className="py-24 sm:py-32" aria-labelledby="trad-chiusura">
        <Wrap className="flex flex-col items-center text-center">
          <div className="tr-logo logo-build-view"><LogoMark className="h-40 w-auto sm:h-56" /></div>
          <h2 id="trad-chiusura" className="t-scene mt-10 max-w-[18ch]">La terra e chi la lavora.</h2>
          <p className="t-lead mt-5">Il territorio è la materia. I luoghi della cooperativa sono dove diventa lavoro.</p>
          <div className="ing-actions justify-center"><Pill href={paths.history}>La storia</Pill><Pill href={paths.places} line>I luoghi</Pill></div>
        </Wrap>
      </Room>
    </>
  );
}
