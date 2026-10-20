import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { BlockDataOf } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import { RealMedia } from "../../real/RealMedia";
import "../../art/home-story/story.css";
import { GardenArt, FieldArt } from "../../art/home-story/places";
import { SceneConfiscated, SceneFarm, SceneSport, SceneWelcome } from "../../art/home-story/scenes";
import { StoryRig } from "../../art/home-story/StoryRig";
import { Room, Wrap, type RoomTone } from "../../kit/Room";
import type { SlotMap, SlotProps } from "./types";

/* ============================ Cosa facciamo: one pinned story, four rooms ============================ */

type Room4 = { tone: RoomTone; panel: string; Scene: () => ReactNode; alt: string; re: RegExp };
const ROOMS: Room4[] = [
  { tone: "white", panel: "green", Scene: SceneWelcome, re: /accogl|inclus/i, alt: "Due persone con la valigia arrivano a una casa con la luce accesa e si siedono a tavola." },
  { tone: "orange", panel: "yellow", Scene: SceneConfiscated, re: /confisc|beni/i, alt: "Il cancello si apre e il casolare chiuso si risveglia: tetti di coppi, finestre accese, fiori, edera; le persone entrano." },
  { tone: "yellow", panel: "green", Scene: SceneSport, re: /sport|campo/i, alt: "Bambini vicino alla rete di pallavolo: il pallone passa sopra la rete in un lungo arco." },
  { tone: "green", panel: "white", Scene: SceneFarm, re: /agric|abes|terra|coltiv/i, alt: "Il grano spunta nei solchi, un germoglio cresce in primo piano, una persona porta una cassetta accanto alle altre." },
];
const roomFor = (title: string, i: number) => ROOMS.find((r) => r.re.test(title)) ?? ROOMS[i % ROOMS.length]!;

function CosaFacciamo({ data, level }: SlotProps) {
  const d = data as BlockDataOf<"pillars">;
  const H = level === 1 ? "h1" : "h2";
  const rooms = d.items.map((it, i) => ({ it, room: roomFor(it.title, i) }));
  return (
    <Room id={d.slot} tone="yellow" className="!overflow-x-clip">
      <Wrap className="grid gap-8 pb-14 pt-16 sm:pb-20 sm:pt-24 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-12">
          {d.eyebrow && <p className="t-label mb-5">{d.eyebrow}</p>}
          <H className="t-giant rise">{d.title}</H>
        </div>
        {d.intro && <p className="t-lead rise lg:col-span-6">{d.intro}</p>}
      </Wrap>
      <StoryRig titles={rooms.map((r) => r.it.title)} label={d.eyebrow || "Cosa facciamo"}>
        <ol className="hs-list">
          {rooms.map(({ it, room }, i) => (
            <li key={i} id={`cosa-${i}`} data-n={i} className={`room room-${room.tone} hs-layer`} style={{ "--i": i, "--zi": i + 1 } as CSSProperties}>
              <div className="hs-inner">
                <div className="hs-copy">
                  <p className="hs-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="t-scene hs-title">{it.title}</h3>
                  <p className="hs-text">{it.text}</p>
                </div>
                <div className={`hs-art hs-panel-${room.panel}`} role="img" aria-label={room.alt}>
                  <room.Scene />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </StoryRig>
      {/* the real thing, after the four drawn rooms: a short video of a day at the places (empty slot = nothing) */}
      <Wrap className="hs-real"><RealMedia id="home-video" className="w-full" /></Wrap>
    </Room>
  );
}

/* ============================ Luoghi: drawing + real photo, one row per place ============================ */

const PLACES = [
  { re: /arance|giardino/i, href: paths.placeGarden, Art: GardenArt, panel: "var(--c-yellow)", photo: "home-giardino", alt: "Il Giardino delle Arance: il casolare, l'agrumeto accanto, l'orto davanti e persone al lavoro." },
  { re: /campo|unit|sport/i, href: paths.placeField, Art: FieldArt, panel: "var(--c-orange)", photo: "home-campo", alt: "Il Campo Polivalente: la rete, un pallone lanciato e bambini che giocano." },
] as const;

/** Luoghi: one row per place. The drawing tells the place, the real photo proves it; the text sits on plain white, beside them. */
function Luoghi({ data, level }: SlotProps) {
  const d = data as BlockDataOf<"places">;
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room id="luoghi" tone="white" className="py-16 sm:py-24">
      <Wrap>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-12">
            {d.eyebrow && <p className="t-label mb-5 text-[var(--c-green)]">{d.eyebrow}</p>}
            <H className="t-giant rise">{d.title}</H>
          </div>
          {d.text && <p className="t-lead rise lg:col-span-6">{d.text}</p>}
        </div>
        <ul className="mt-12 grid list-none gap-16 p-0 sm:mt-16 lg:gap-24">
          {d.items.map((it, i) => {
            const place = PLACES.find((p) => p.re.test(it.title)) ?? PLACES[i % PLACES.length]!;
            return (
              <li key={i} className={`hs-place ${i % 2 === 1 ? "hs-place-flip" : ""}`}>
                <div className="hs-place-rise hs-place-art">
                  <div className="hs-place-panel" style={{ background: place.panel }} role="img" aria-label={place.alt}>
                    <place.Art />
                  </div>
                </div>
                <div className="hs-place-copy">
                  <h3 className="t-head">{it.title}</h3>
                  <p className="t-body mt-3">{it.text}</p>
                  <Link href={place.href} className="mt-5 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-[family-name:var(--font-display)] text-base font-bold">
                    Entra nel luogo<span className="sr-only">: {it.title}</span> <span aria-hidden="true">→</span>
                  </Link>
                </div>
                <div className="hs-place-photo"><RealMedia id={place.photo} className="w-full" /></div>
              </li>
            );
          })}
        </ul>
        <div className="mt-14 flex flex-wrap gap-3 sm:mt-20">
          <Link href={paths.places} className="pill pill-solid">Tutti i luoghi <span className="arrow" aria-hidden="true">→</span></Link>
          {d.cta && <Link href={d.cta.href} className="pill pill-line">{d.cta.label} <span className="arrow" aria-hidden="true">→</span></Link>}
        </div>
      </Wrap>
    </Room>
  );
}

export const homebSlots: SlotMap = {
  "home:cosa-facciamo": CosaFacciamo,
  "home:luoghi": Luoghi,
};
