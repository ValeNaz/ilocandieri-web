import type { Metadata } from "next";
import Link from "next/link";
import { DayStrips } from "./day";
import { WelcomeHeroScene } from "@/components/public/art/accoglienza/LitHouse";
import { ProcessDoor, ProcessEdu, ProcessWork, ServiceCas, ServiceMinors } from "@/components/public/art/accoglienza/DayArt";
import { LogoMark } from "@/components/brand/Logo";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { RealMedia } from "@/components/public/real/RealMedia";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Accoglienza",
  description: "Dal 2008 I Locandieri accolgono persone migranti a Castelvetrano: il CAS Locanda, una comunità per minori stranieri non accompagnati, percorsi educativi, formativi e di inserimento.",
};

const Arrow = () => <span className="arrow" aria-hidden="true">→</span>;
function Pill({ href, children, kind = "solid" }: { href: string; children: React.ReactNode; kind?: "solid" | "line" }) {
  return <Link href={href} className={cn("pill", kind === "solid" ? "pill-solid" : "pill-line")}>{children}<Arrow /></Link>;
}

const SERVICES = [
  {
    name: "CAS Locanda",
    text: "Un centro di accoglienza straordinaria, in convenzione con la Prefettura di Trapani. Una casa dove stare, i pasti, persone con cui parlare. Poi le attività che servono a orientarsi: educative, formative, di inserimento.",
    Art: ServiceCas,
    panel: "bg-[var(--c-orange)] strip-a",
  },
  {
    name: "Comunità per minori stranieri non accompagnati",
    text: "In convenzione con il Comune di Castelvetrano. I minori arrivati senza famiglia trovano un posto dove stare e adulti che li accompagnano: attività educative, sport, formazione.",
    Art: ServiceMinors,
    panel: "bg-[var(--c-yellow)] strip-b",
  },
];

const STEPS = [
  { n: "01", name: "Educativo", text: "Si impara a stare insieme: le regole della casa, la lingua, lo sport, il tempo libero.", Art: ProcessEdu, panel: "bg-[var(--c-white)] rounded-t-[999px] rounded-b-[2rem]" },
  { n: "02", name: "Formativo", text: "Si impara un lavoro, nell'orto e nel laboratorio di trasformazione. Si prova, si sbaglia, si ripete.", Art: ProcessWork, panel: "bg-[var(--c-orange)] rounded-[3rem_1rem_4rem_1rem]" },
  { n: "03", name: "Inserimento", text: "Si entra nel territorio: una casa, un lavoro, una rete di persone. Con scuole, enti e imprese che collaborano con noi.", Art: ProcessDoor, panel: "bg-[var(--c-green)] rounded-[2rem_6rem_2rem_6rem]" },
];

export default function Page() {
  return (
    <>
      {/* 1. Hero: text and scene in two zones that never touch */}
      <Room tone="green" className="relative isolate">
        <Wrap className="grid gap-8 pt-10 sm:pt-14 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-5 lg:self-center lg:py-16">
            <p className="t-label text-[var(--pop-text)]">Accoglienza dal 2008</p>
            <Kinetic as="h1" text="Una casa con le luci accese." className="t-giant mt-4" />
            <p className="t-lead mt-6">Dal 2008 accogliamo persone migranti a Castelvetrano. Accogliere vuol dire una casa, un pasto, una lingua da imparare e un lavoro da fare. Poi viene il resto, un passo alla volta.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Pill href="#giornata">Una giornata in casa</Pill></div>
          </div>
          <div className="relative -mx-5 aspect-[2/1] sm:-mx-10 lg:col-span-7 lg:mx-0 lg:-mr-10">
            <WelcomeHeroScene />
          </div>
        </Wrap>
      </Room>

      {/* 2. What it means: two services */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap>
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p><span className="t-label block">Dal</span><span className="t-giant block text-[var(--c-orange)]">2008</span></p>
              <h2 className="t-scene mt-8">Due servizi, un modo di accogliere.</h2>
              <p className="t-body mt-6">Accogliere non è dare un tetto e basta. È una casa con regole, orari, compiti e persone che ti accompagnano. Lo facciamo con due servizi.</p>
            </div>
            <RealMedia id="accoglienza-casa" className="w-full lg:col-span-5" shape="polaroid" tilt={-1.5} />
          </div>
          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            {SERVICES.map((s, i) => (
              <article key={s.name} className={cn("rise flex flex-col overflow-hidden p-7 sm:p-10", s.panel, i === 0 ? "lg:col-span-6 lg:self-start" : "lg:col-span-6 lg:mt-20 lg:self-start")}>
                <h3 className="t-head max-w-[16ch]">{s.name}</h3>
                <p className="t-body mt-4">{s.text}</p>
                <div className="mt-8 aspect-[400/220] w-full"><s.Art /></div>
              </article>
            ))}
          </div>
        </Wrap>
      </Room>

      {/* 3. The path: educational, training, inclusion */}
      <Room tone="yellow" className="py-20 sm:py-28">
        <Wrap>
          <h2 className="t-scene max-w-[20ch]">Un percorso in tre parti.</h2>
          <ol className="mt-14 grid gap-x-10 gap-y-16 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.n} className={cn("rise", i === 1 && "lg:mt-24", i === 2 && "lg:mt-10")}>
                <div className={cn("aspect-square w-full overflow-hidden", s.panel)}><s.Art /></div>
                <h3 className="t-head mt-6"><span className="mr-3">{s.n}</span>{s.name}</h3>
                <p className="t-body mt-3 max-w-[34ch]">{s.text}</p>
              </li>
            ))}
          </ol>
        </Wrap>
      </Room>

      {/* 4. A day, as strips */}
      <DayStrips />

      {/* 5. Closing */}
      <Room tone="white" className="py-20 sm:py-28">
        <Wrap className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="t-scene">Per conoscere la casa, basta bussare.</h2>
            <p className="t-lead mt-6">Puoi visitare il Giardino delle Arance, candidarti per lavorare con noi o scriverci per una collaborazione.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill href={paths.placeGarden}>Il Giardino delle Arance</Pill>
              <Pill href={paths.careers} kind="line">Lavora con noi</Pill>
              <Pill href={paths.contacts} kind="line">Contatti</Pill>
            </div>
          </div>
          <div className="lg:col-span-4">
            <LogoMark build="view" className="ml-auto h-auto w-36 sm:w-44 lg:w-full lg:max-w-[13rem]" />
          </div>
        </Wrap>
      </Room>
    </>
  );
}
