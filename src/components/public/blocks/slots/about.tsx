import Link from "next/link";
import type { BlockDataOf } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/Logo";
import "../../art/chi-siamo/about.css";
import { AbesScene } from "../../art/chi-siamo/AbesScene";
import { HeroScene } from "../../art/chi-siamo/HeroScene";
import { MissioneScene } from "../../art/chi-siamo/MissioneScene";
import { FieldArt, GardenArt } from "../../art/chi-siamo/PlacesArt";
import { STEP_LABELS, StepsScene } from "../../art/chi-siamo/StepsScene";
import { CoopArt, InclusionArt, LegalityArt, SustainArt } from "../../art/chi-siamo/ValuesArt";
import { Kinetic } from "../../kit/Kinetic";
import { Room, Wrap } from "../../kit/Room";
import { RealMedia } from "../../real/RealMedia";
import { Paragraphs } from "../shared";
import type { SlotMap, SlotProps } from "./types";

const Arrow = () => <span className="arrow" aria-hidden="true">→</span>;

function Pill({ href, children, kind = "solid" }: { href: string; children: React.ReactNode; kind?: "solid" | "line" }) {
  return <Link href={href} className={cn("pill", kind === "solid" ? "pill-solid" : "pill-line")}>{children}<Arrow /></Link>;
}

/* ---------- hero: text and scene in two zones that never touch (stacked on phones, side by side from lg) ---------- */
function Hero({ data, level }: SlotProps) {
  const d = data as unknown as BlockDataOf<"hero">;
  return (
    <Room tone="green" className="relative isolate">
      <Wrap className="grid gap-8 pt-10 sm:pt-14 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-5 lg:self-center lg:py-16">
          {d.eyebrow && <p className="t-label text-[var(--pop-text)]">{d.eyebrow}</p>}
          <Kinetic as={level === 1 ? "h1" : "h2"} text={d.title} by="word" className="t-giant mt-4" />
          <p className="t-lead mt-6">{d.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill href={paths.places}>Vedi i luoghi</Pill>
            <Pill href={paths.welcome} kind="line">Come accogliamo</Pill>
          </div>
        </div>
        <div className="relative -mx-5 aspect-[2/1] sm:-mx-10 lg:col-span-7 lg:mx-0 lg:-mr-10">
          <HeroScene />
        </div>
      </Wrap>
    </Room>
  );
}

/* ---------- missione: the circle, and the real photo of the people in it ---------- */
function Missione({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"feature">;
  return (
    <Room tone="white" id={d.slot} className="py-20 sm:py-28">
      <Wrap className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2 className="t-scene">{d.title}</h2>
          <div className="mt-8 space-y-5">
            <Paragraphs text={d.text} className="t-body" />
          </div>
        </div>
        <div className="grid content-start gap-10 lg:col-span-7">
          <div className="aspect-[2/1] w-full"><MissioneScene /></div>
          <RealMedia id="chi-siamo-squadra" className="w-full" deco={["sun", "branch"]} />
        </div>
      </Wrap>
    </Room>
  );
}

/* ---------- valori: four objects, four shapes ---------- */
const VALUE_SHAPES = [
  { art: LegalityArt, wrap: "lg:col-span-4 lg:col-start-1 lg:row-start-1 max-w-[19rem] lg:max-w-none", panel: "ab-value-arch bg-[var(--c-green)] aspect-[4/5]" },
  { art: InclusionArt, wrap: "lg:col-span-5 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mt-28 lg:self-start ml-auto max-w-[22rem] lg:max-w-none", panel: "rounded-full bg-[var(--c-white)] aspect-square" },
  { art: SustainArt, wrap: "lg:col-span-5 lg:col-start-2 lg:row-start-2", panel: "ab-value-tilt bg-[var(--c-orange)] aspect-square lg:max-w-[34rem]" },
  { art: CoopArt, wrap: "lg:col-span-12 lg:row-start-3", panel: "ab-value-pill bg-[var(--c-green)] text-[var(--c-white)]" },
] as const;

function Valori({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"values">;
  return (
    <Room tone="yellow" id={d.slot} className="py-20 sm:py-28">
      <Wrap>
        <h2 className="t-scene max-w-[22ch]">{d.title}</h2>
        <ul className="mt-12 grid gap-x-10 gap-y-16 lg:grid-cols-12">
          {d.items.map((it, i) => {
            const sh = VALUE_SHAPES[i % VALUE_SHAPES.length]!;
            const Art = sh.art;
            const text = (
              <>
                <h3 className="t-head">{it.title}</h3>
                <p className="t-body mt-3 max-w-[34ch]">{it.text}</p>
              </>
            );
            if (i % VALUE_SHAPES.length === 3)
              return (
                <li key={it.title} className={cn("rise", sh.wrap)}>
                  <div className={cn(sh.panel, "grid items-center gap-6 overflow-hidden pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 lg:p-0 lg:pl-14")}>
                    <div className="px-6 lg:px-0">{text}</div>
                    <div className="aspect-[900/330] w-full"><Art /></div>
                  </div>
                </li>
              );
            return (
              <li key={it.title} className={cn("rise", sh.wrap)}>
                <div className={cn(sh.panel, "overflow-hidden")}><Art /></div>
                <div className="mt-6">{text}</div>
              </li>
            );
          })}
        </ul>
      </Wrap>
    </Room>
  );
}

/* ---------- accoglienza: four steps; their names are HTML under the scene, never inside it ---------- */
function Accoglienza({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"feature">;
  return (
    <Room tone="orange" id={d.slot} className="py-20 sm:py-28">
      <Wrap className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="t-scene">{d.title}</h2>
          <div className="mt-8 space-y-5"><Paragraphs text={d.text} className="t-body" /></div>
          <div className="mt-8"><Pill href={paths.welcome}>Come accogliamo</Pill></div>
        </div>
        <div className="lg:col-span-7">
          <div className="aspect-[10/7] w-full"><StepsScene /></div>
          <ol className="mt-4 grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4" aria-label="Il percorso">
            {STEP_LABELS.map((l, i) => (
              <li key={l} className="min-w-0">
                <span className="t-label block">0{i + 1}</span>
                <span className="mt-1 block font-bold leading-tight">{l}</span>
              </li>
            ))}
          </ol>
        </div>
      </Wrap>
    </Room>
  );
}

/* ---------- beni confiscati: the two places ---------- */
function Beni({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"feature">;
  const places = [
    { art: GardenArt, bg: "bg-[var(--c-yellow)]", shape: "ab-place-a", href: paths.placeGarden, cls: "lg:col-span-7" },
    { art: FieldArt, bg: "bg-[var(--c-green)]", shape: "ab-place-b", href: paths.placeField, cls: "lg:col-span-5 lg:mt-24" },
  ];
  return (
    <Room tone="white" id={d.slot} className="py-20 sm:py-28">
      <Wrap>
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="t-scene lg:col-span-7">{d.title}</h2>
          <div className="lg:col-span-5"><p className="t-body">{d.text}</p></div>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-16 lg:grid-cols-12">
          {d.items.slice(0, 2).map((it, i) => {
            const p = places[i]!;
            const Art = p.art;
            return (
              <article key={it.title} className={cn("ab-place", p.cls)}>
                <div className={cn(p.shape, p.bg, "aspect-[640/520] overflow-hidden")}><Art /></div>
                <h3 className="t-head mt-6">{it.title}</h3>
                <p className="t-body mt-3">{it.text}</p>
                <div className="mt-5"><Link href={p.href} className="pill pill-line">Visita {i === 0 ? "il giardino" : "il campo"}<span className="sr-only">: {it.title}</span><Arrow /></Link></div>
              </article>
            );
          })}
        </div>
      </Wrap>
    </Room>
  );
}

/* ---------- ABES: the scene tells, the real photo of the garden proves ---------- */
function Abes({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"feature">;
  return (
    <Room tone="green" id={d.slot} className="py-20 sm:py-28">
      <Wrap className="grid items-start gap-12 lg:grid-cols-12">
        <div className="relative order-2 mx-auto aspect-square w-full max-w-[34rem] lg:order-1 lg:col-span-6 lg:max-w-none">
          <AbesScene />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <h2 className="t-scene">{d.title}</h2>
          <div className="mt-8 space-y-5"><Paragraphs text={d.text} className="t-body" /></div>
          <div className="mt-8 flex flex-wrap gap-3">
            {d.cta && <Pill href={d.cta.href}>{d.cta.label}</Pill>}
            <Pill href={paths.abes} kind="line">Dal seme al vasetto</Pill>
          </div>
          <RealMedia id="chi-siamo-lavoro" className="mt-12 w-full" shape="polaroid" tilt={1.5} />
        </div>
      </Wrap>
    </Room>
  );
}

/* ---------- chiusura: the motto and the house assembling ---------- */
function Chiusura({ data }: SlotProps) {
  const d = data as unknown as BlockDataOf<"cta">;
  return (
    <Room tone="yellow" id={d.slot} className="overflow-hidden pb-20 pt-20 sm:pb-28 sm:pt-28">
      <Wrap>
        <p className="t-label">Il nostro motto</p>
        <p className="ab-motto rise mt-4" lang="grc-Latn">kalòs kai agathòs</p>
        <p className="t-body mt-3">Bello e buono: per noi è bello ciò che è buono.</p>
        <div className="mt-16 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="t-scene">{d.title}</h2>
            <p className="t-lead mt-5">{d.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {d.primaryCta && <Pill href={d.primaryCta.href}>{d.primaryCta.label}</Pill>}
              <Pill href={paths.careers} kind="line">Lavora con noi</Pill>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="logo-build-view ml-auto w-fit rounded-[2.5rem] bg-[var(--c-white)] p-8 sm:p-10">
              <LogoMark className="h-auto w-28 sm:w-36 lg:w-44" />
            </div>
          </div>
        </div>
      </Wrap>
    </Room>
  );
}

export const aboutSlots: SlotMap = {
  "chi-siamo:hero": Hero,
  "chi-siamo:missione": Missione,
  "chi-siamo:valori": Valori,
  "chi-siamo:accoglienza": Accoglienza,
  "chi-siamo:beni-confiscati": Beni,
  "chi-siamo:abes": Abes,
  "chi-siamo:chiusura": Chiusura,
};

