import { NightHouseArt } from "@/components/public/art/accoglienza/LitHouse";
import { SchoolArt, TableArt } from "@/components/public/art/accoglienza/DayArt";
import { FieldArt, GardenArt } from "@/components/public/art/chi-siamo/PlacesArt";
import { Room, Wrap } from "@/components/public/kit/Room";
import { cn } from "@/lib/utils";
import type { RoomTone } from "@/components/public/kit/Room";
import type { ComponentType } from "react";

const FieldStrip = () => <FieldArt ground="white" line="ink" p2="yellow" walker="yellow" />;

type Strip = { id: string; n: string; name: string; title: string; text: string; tone: RoomTone; bg: string; shape: string; Art: ComponentType };

const STRIPS: Strip[] = [
  { id: "tavola", n: "01", name: "Tavola", title: "Si comincia a tavola.", text: "La giornata parte con la colazione, tutti insieme. Si decide chi fa cosa, si parla, si ride.", tone: "orange", bg: "bg-[var(--c-yellow)]", shape: "strip-a", Art: TableArt },
  { id: "lingua", n: "02", name: "Lingua", title: "Si impara a parlare.", text: "Italiano ogni giorno: per salutare i vicini, fare la spesa, leggere un foglio. Una lingua si impara usandola.", tone: "green", bg: "bg-[var(--c-white)]", shape: "strip-b", Art: SchoolArt },
  { id: "orto", n: "03", name: "Orto", title: "Si lavora la terra.", text: "Al Giardino delle Arance si semina, si raccoglie, si porta in laboratorio. Lavorare la terra è un modo di imparare un mestiere.", tone: "white", bg: "bg-[var(--c-yellow)]", shape: "strip-c", Art: GardenArt },
  { id: "sport", n: "04", name: "Sport", title: "Si gioca, insieme.", text: "Al Campo Polivalente si corre, si palleggia, si fa squadra con tanti altri ragazzi. Lo sport è una lingua che tutti capiscono.", tone: "yellow", bg: "bg-[var(--c-green)]", shape: "strip-d", Art: FieldStrip },
  { id: "casa", n: "05", name: "Casa", title: "Si torna a casa.", text: "La sera si cena, si parla, si riposa. Le luci si accendono una finestra alla volta.", tone: "orange", bg: "bg-[var(--c-green)]", shape: "strip-e", Art: NightHouseArt },
];

/** The day as five full-width strips, each in its own room colour, each with a cut-out scene. */
export function DayStrips() {
  return (
    <>
      {STRIPS.map((s, i) => (
        <Room key={s.id} tone={s.tone} id={i === 0 ? "giornata" : undefined} className="py-14 sm:py-20">
          <Wrap>
            {i === 0 && (
              <div className="mb-14 max-w-[40rem]">
                <h2 className="t-scene">Una giornata in casa.</h2>
                <p className="t-lead mt-5">Cinque momenti, sempre gli stessi, che tengono insieme le persone. È il ritmo di una casa.</p>
              </div>
            )}
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
              <div className={cn("lg:col-span-5", i % 2 ? "lg:order-2" : "")}>
                <p className="t-label">{s.n} · {s.name}</p>
                <h3 className="t-head mt-3">{s.title}</h3>
                <p className="t-body mt-5">{s.text}</p>
              </div>
              <div className={cn("rise lg:col-span-7", i % 2 ? "lg:order-1" : "")}>
                <div className={cn("aspect-[640/520] w-full overflow-hidden", s.bg, s.shape)}><s.Art /></div>
              </div>
            </div>
          </Wrap>
        </Room>
      ))}
    </>
  );
}
