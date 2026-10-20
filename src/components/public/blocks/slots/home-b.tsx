import type { ReactNode } from "react";
import Link from "next/link";
import type { BlockDataOf } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import { CompareSlider } from "../../real/CompareSlider";
import { resolveSlot } from "../../real/resolve";
import "../../real/photo.css";
import "../../art/home-story/story.css";
import { GardenArt, FieldArt } from "../../art/home-story/places";
import { SceneConfiscated, SceneFarm, SceneSport, SceneWelcome } from "../../art/home-story/scenes";
import { Room, Wrap } from "../../kit/Room";
import type { SlotMap, SlotProps } from "./types";

/* ============================ Cosa facciamo: four rooms side by side, no pinning ============================ */

type Room4 = { panel: string; Scene: () => ReactNode; alt: string; re: RegExp };
const ROOMS: Room4[] = [
  { panel: "green", Scene: SceneWelcome, re: /accogl|inclus/i, alt: "Due persone con la valigia arrivano a una casa con la luce accesa e si siedono a tavola." },
  { panel: "orange", Scene: SceneConfiscated, re: /confisc|beni/i, alt: "Il cancello si apre e il casolare chiuso si risveglia: tetti di coppi, finestre accese, fiori, edera; le persone entrano." },
  { panel: "yellow", Scene: SceneSport, re: /sport|campo/i, alt: "Bambini vicino alla rete di pallavolo: il pallone passa sopra la rete in un lungo arco." },
  { panel: "green", Scene: SceneFarm, re: /agric|abes|terra|coltiv/i, alt: "Il grano spunta nei solchi, un germoglio cresce in primo piano, una persona porta una cassetta accanto alle altre." },
];
const roomFor = (title: string, i: number) => ROOMS.find((r) => r.re.test(title)) ?? ROOMS[i % ROOMS.length]!;

/**
 * Four cards in a row (2x2 on tablets, a column on phones). Each scene plays its little story once as its card scrolls
 * in (story.css .hs-card drives --a from the view timeline), then keeps its loops of life while visible.
 */
function CosaFacciamo({ data, level }: SlotProps) {
  const d = data as BlockDataOf<"pillars">;
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room id={d.slot} tone="white" className="py-16 sm:py-24">
      <Wrap>
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            {d.eyebrow && <p className="t-label mb-4 text-[var(--pop-text)]">{d.eyebrow}</p>}
            <H className="t-scene">{d.title}</H>
          </div>
          {d.intro && <p className="t-body lg:col-span-5">{d.intro}</p>}
        </div>
        <ol className="hs-cards mt-10 sm:mt-14">
          {d.items.map((it, i) => {
            const room = roomFor(it.title, i);
            return (
              <li key={i} className="hs-card">
                <div className={`hs-card-art hs-panel-${room.panel}`} role="img" aria-label={room.alt}><room.Scene /></div>
                <p className="hs-card-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-head">{it.title}</h3>
                <p className="t-body mt-2">{it.text}</p>
              </li>
            );
          })}
        </ol>
      </Wrap>
    </Room>
  );
}

/* ============================ Luoghi: one big card per place, drawing over photo ============================ */

const PLACES = [
  { re: /arance|giardino/i, href: paths.placeGarden, Art: GardenArt, panel: "var(--c-yellow)", photo: "home-giardino", alt: "Il Giardino delle Arance: il casolare, l'agrumeto accanto, l'orto davanti e persone al lavoro." },
  { re: /campo|unit|sport/i, href: paths.placeField, Art: FieldArt, panel: "var(--c-orange)", photo: "home-campo", alt: "Il Campo Polivalente: la rete, un pallone lanciato e bambini che giocano." },
] as const;

/** The drawing tells the place; drag to uncover the photo under it. Without a photo: the drawing alone, same frame. */
async function PlaceVisual({ place, title }: { place: (typeof PLACES)[number]; title: string }) {
  const media = await resolveSlot(place.photo);
  const art = <div className="hs-place-panel" style={{ background: place.panel }} role="img" aria-label={place.alt}><place.Art /></div>;
  if (!media || media.origin === "placeholder" || media.type !== "photo") return art;
  return (
    <figure className="pf">
      <CompareSlider before={art} label={`${title}: sposta per confrontare il disegno con la foto`} left="Il disegno" right="La foto" className="pf-box hs-place-cmp">
        {/* eslint-disable-next-line @next/next/no-img-element -- slot photo, cropped by CSS */}
        <img src={media.src} srcSet={media.origin === "stock" && media.small ? `${media.small} 1000w, ${media.src} ${media.width ?? 2000}w` : undefined}
          sizes="(min-width: 1024px) 45vw, 92vw" alt={media.alt} width={media.width} height={media.height} loading="lazy" decoding="async" />
        {media.origin === "stock" && <a className="pf-credit" href={media.credit.url} target="_blank" rel="noopener noreferrer">Foto indicativa · {media.credit.author} / Pexels</a>}
      </CompareSlider>
    </figure>
  );
}

function Luoghi({ data, level }: SlotProps) {
  const d = data as BlockDataOf<"places">;
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room id="luoghi" tone="white" className="py-16 sm:py-24">
      <Wrap>
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            {d.eyebrow && <p className="t-label mb-4 text-[var(--pop-text)]">{d.eyebrow}</p>}
            <H className="t-scene">{d.title}</H>
          </div>
          {d.text && <p className="t-body lg:col-span-5">{d.text}</p>}
        </div>
        <ul className="hs-places mt-10 sm:mt-14">
          {d.items.map((it, i) => {
            const place = PLACES.find((p) => p.re.test(it.title)) ?? PLACES[i % PLACES.length]!;
            return (
              <li key={i}>
                <PlaceVisual place={place} title={it.title} />
                <h3 className="t-head mt-6">{it.title}</h3>
                <p className="t-body mt-2 max-w-[52ch]">{it.text}</p>
                <Link href={place.href} className="mt-4 inline-flex min-h-11 items-center gap-2 border-b-2 border-current font-[family-name:var(--font-display)] text-base font-bold">
                  Entra nel luogo<span className="sr-only">: {it.title}</span> <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={paths.places} className="pill pill-solid">Tutti i luoghi <span className="arrow" aria-hidden="true">→</span></Link>
          {d.cta && <Link href={d.cta.href} className="pill pill-line">{d.cta.label} <span className="arrow" aria-hidden="true">→</span></Link>}
        </div>
      </Wrap>
    </Room>
  );
}

export const homebSlots: SlotMap = {
  "home:cosa-facciamo": CosaFacciamo,
  "home:luoghi": Luoghi as never,
};
