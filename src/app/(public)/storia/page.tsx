import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { BeforeAfter } from "@/components/public/art/storia/BeforeAfter";
import { RouteSpine } from "@/components/public/art/storia/RouteSpine";
import { HeroLand, HeroPeople, HeroSky, GiardinoDopo, GiardinoPrima, ScenaAbes, ScenaAccoglienza, ScenaCampo, ScenaCasolare, ScenaLegge, ScenaOggi } from "@/components/public/art/storia/scenes";
import { Stop } from "@/components/public/art/storia/Stop";
import "@/components/public/art/storia/storia.css";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { Layer, Stage } from "@/components/public/kit/Stage";
import { RealMedia } from "@/components/public/real/RealMedia";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Storia | I Locandieri",
  description: "Dal casolare di fine Settecento al campo e all'orto: come la cooperativa sociale I Locandieri di Castelvetrano restituisce alla comunità i beni confiscati, un luogo alla volta.",
  alternates: { canonical: paths.history },
};

const Pill = ({ href, children, line }: { href: string; children: React.ReactNode; line?: boolean }) => (
  <Link href={href} className={`pill ${line ? "pill-line" : "pill-solid"}`}>{children} <span className="arrow" aria-hidden="true">→</span></Link>
);

export default function StoriaPage() {
  return (
    <>
      {/* Apertura */}
      <Room tone="yellow" className="flex min-h-[100svh] flex-col pt-24 sm:pt-28">
        <Wrap className="mb-10 sm:mb-14">
          <p className="t-label mb-5">La nostra storia</p>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <Kinetic as="h1" text="Cosa c'era prima, cosa c'è adesso" className="t-mega lg:col-span-8" />
            <p className="t-lead lg:col-span-4">I Locandieri sono una cooperativa sociale di Castelvetrano. La loro storia è fatta di luoghi: un casolare, un campo, un frutteto. Segui la linea, una tappa alla volta.</p>
          </div>
        </Wrap>
        <Stage className="st-hero" tilt>
          <Layer z={-30}><HeroSky /></Layer>
          <Layer z={0}><HeroLand /></Layer>
          <Layer z={22}><HeroPeople /></Layer>
        </Stage>
      </Room>

      <RouteSpine>
        <Stop n={1} id="casolare" tone="white" panel="yellow" side="left" label="Il luogo" scene={<ScenaCasolare />}>
          <h2 id="casolare-t" className="t-scene">Un casolare di fine Settecento, chiuso.</h2>
          <p className="t-body">Sta vicino al centro storico di Castelvetrano, dentro circa tre ettari di terra. È molto più vecchio della cooperativa. Un bene confiscato alla criminalità organizzata passa alla collettività, ma finché nessuno lo apre resta un cancello chiuso.</p>
          <p className="t-body">Il disegno qui accanto è fatto solo di linee, di proposito: è un luogo vuoto, ancora senza colore.</p>
          <div className="stop-actions"><Pill href={paths.placeGarden} line>Il Giardino delle Arance</Pill></div>
        </Stop>

        <Stop n={2} id="legge" tone="orange" panel="white" side="right" label="La cornice" scene={<ScenaLegge />}>
          <span className="num-big" aria-hidden="true">109/96</span>
          <h2 id="legge-t" className="t-scene">Una legge li restituisce a tutti.</h2>
          <p className="t-body">La legge 109 del 1996 stabilisce l&apos;uso sociale dei beni confiscati alla mafia: possono essere assegnati a enti e cooperative per fini sociali. Nasce da una raccolta di firme promossa da Libera.</p>
          <p className="t-body">È la cornice in cui lavorano molte realtà del Terzo settore, anche la nostra. La legge apre la porta. Poi serve chi ci entra e se ne prende cura.</p>
        </Stop>

        <Stop n={3} id="accoglienza" tone="green" panel="yellow" side="left" label="Le persone" scene={<ScenaAccoglienza />}>
          <span className="num-big" aria-hidden="true">dal 2008</span>
          <h2 id="accoglienza-t" className="t-scene">Una porta aperta a chi arriva.</h2>
          <p className="t-body">La cooperativa accoglie persone migranti dal 2008. Accogliere è un lavoro di tutti i giorni: una casa dove stare, un posto a tavola, qualcosa da fare insieme ad altri.</p>
          <div className="stop-actions"><Pill href={paths.welcome}>L&apos;accoglienza</Pill></div>
        </Stop>

        <Stop n={4} id="campo" tone="white" panel="yellow" side="right" label="Il campo" scene={<ScenaCampo />}>
          <h2 id="campo-t" className="t-scene">Un terreno diventa un campo da gioco.</h2>
          <p className="t-body">Il Campo Polivalente Unità d&apos;Italia, in via SS. Trinità a Castelvetrano, è destinato allo sport e alle attività ricreative. Ci vanno circa 200 tra bambini e ragazzi: avviamento allo sport dai 3 anni, pallavolo, attività per i minori accolti nelle comunità.</p>
          <div className="stop-actions"><Pill href={paths.placeField} line>Il Campo Polivalente</Pill></div>
        </Stop>

        <Stop n={5} id="giardino" tone="yellow" panel="white" ar="8/5" side="left" label="Il giardino" real={<>
          <RealMedia id="storia-prima" shape="polaroid" tilt={-2} className="stop-real stop-real-a" caption="Prima: il casolare chiuso." />
          <RealMedia id="storia-dopo" shape="polaroid" tilt={2} className="stop-real stop-real-b" caption="Adesso: stessa inquadratura, oggi." />
        </>} scene={<BeforeAfter label="Prima e adesso: trascina per colorare il giardino" before={<GiardinoPrima />} after={<GiardinoDopo />} />}>
          <h2 id="giardino-t" className="t-scene">Il giardino torna a dare frutti.</h2>
          <p className="t-body">Due ettari di agrumeto recuperato. Sul resto, un orto biologico intensivo. Poi un laboratorio per trasformare e un centro per distribuire.</p>
          <p className="t-body">Qui lavorano insieme persone con disabilità o svantaggio, giovani, minori stranieri non accompagnati, adulti immigrati: con finalità educative e terapeutiche.</p>
          <p className="stop-note">Trascina il cursore sul disegno, o scorri: il luogo si colora.</p>
          <div className="stop-actions"><Pill href={paths.placeGarden}>Vedi il giardino</Pill></div>
        </Stop>

        <Stop n={6} id="abes" tone="green" panel="orange" side="right" label="ABES" scene={<ScenaAbes />}>
          <h2 id="abes-t" className="t-scene">Dalla terra al barattolo.</h2>
          <p className="t-body">ABES è il progetto agroalimentare della cooperativa: agricoltura biologica sui terreni confiscati di Castelvetrano. Frutta e verdura di stagione, sughi, conserve dolci e salate, pasta, farine, legumi, grano duro Tumminia.</p>
          <div className="stop-actions"><Pill href={paths.abes}>Da seme a barattolo</Pill><Pill href={paths.shop} line>Lo shop</Pill></div>
        </Stop>

        <Stop n={7} id="oggi" tone="orange" panel="white" side="left" label="Oggi e domani" scene={<ScenaOggi />}>
          <h2 id="oggi-t" className="t-scene">Il resto si scrive con chi viene.</h2>
          <p className="t-body">C&apos;è un campo da usare, un orto da raccogliere, una tavola da apparecchiare, una porta da tenere aperta. Si scrive con chi viene: a un evento, a vedere un luogo, a lavorare con noi.</p>
          <div className="stop-actions"><Pill href={paths.events}>Gli eventi</Pill><Pill href={paths.careers} line>Lavora con noi</Pill><Pill href={paths.contacts} line>Scrivici</Pill></div>
        </Stop>
      </RouteSpine>

      {/* Chiusura */}
      <Room tone="white" className="py-24 sm:py-32" aria-labelledby="storia-chiusura">
        <Wrap className="flex flex-col items-center text-center">
          <div className="st-logo logo-build-view"><LogoMark className="h-40 w-auto sm:h-56" /></div>
          <h2 id="storia-chiusura" className="t-scene mt-10 max-w-[18ch]">Una casa fatta di persone.</h2>
          <p className="t-lead mt-5">Se la storia è fatta di luoghi, il territorio che li circonda è fatto di grano, olive e pietra.</p>
          <div className="stop-actions justify-center"><Pill href={paths.tradition}>La tradizione</Pill><Pill href={paths.places} line>I luoghi</Pill></div>
        </Wrap>
      </Room>
    </>
  );
}
