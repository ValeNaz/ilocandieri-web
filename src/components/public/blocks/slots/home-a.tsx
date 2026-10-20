import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import "@/components/public/art/home/home-a.css";
import { ClosingScene } from "@/components/public/art/home/closing-scene";
import { HeroLive } from "@/components/public/art/home/hero-live";
import { IdentityScene } from "@/components/public/art/home/identity-scene";
import { LitWords } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { Cta } from "@/lib/content/blocks";
import { BlockHeading } from "../shared";
import type { SlotMap, SlotProps } from "./types";

type HeroData = { eyebrow: string; title: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null };

function Pill({ cta, solid }: { cta: Cta | null; solid?: boolean }) {
  if (!cta) return null;
  const cls = `pill ${solid ? "pill-solid" : "pill-line"}`;
  const inner = <>{cta.label}<span className="arrow" aria-hidden="true">→</span></>;
  return /^https?:/.test(cta.href) ? <a href={cta.href} className={cls}>{inner}</a> : <Link href={cta.href} className={cls}>{inner}</Link>;
}

/**
 * Hero title: words enter one by one (kit .kin), the LAST word sits on a yellow band that draws itself after them.
 * Plain text for assistive tech (aria-label); the pieces are presentational.
 */
function HeroTitle({ text, level }: { text: string; level: SlotProps["level"] }) {
  const Tag = level === 1 ? "h1" : "h2";
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className="kin t-mega ha-title" aria-label={text} style={{ "--kin-delay": "250ms" } as CSSProperties}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className={`kw${i === words.length - 1 ? " hx-mark" : ""}`} style={{ "--i": i } as CSSProperties}>{w}</span>{" "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/** Hero on white: the copy in the empty left sky, the living valley across the whole width (see hero-live.tsx). */
function HomeHero({ data, level }: SlotProps) {
  const d = data as HeroData;
  return (
    <Room tone="white" id="hero" className="hh-hero">
      <Wrap className="hh-copy">
        {d.eyebrow && <p className="t-label hh-in mb-4" style={{ "--k": 0 } as CSSProperties}>{d.eyebrow}</p>}
        <HeroTitle text={d.title} level={level} />
        <p className="t-lead ha-lead hh-in mt-6 max-w-[33rem]" style={{ "--k": 3 } as CSSProperties}>{d.text}</p>
        <div className="ha-pills hh-in mt-8 flex flex-wrap gap-3" style={{ "--k": 4 } as CSSProperties}>
          <Pill cta={d.primaryCta} solid />
          <Pill cta={d.secondaryCta} />
        </div>
      </Wrap>
      <div className="hh-wrap" role="img" aria-label="Una valle di aranci con la casa de I Locandieri in cima al colle. Una persona sale il sentiero con una cassetta, un motocarro carico di arance attraversa la collina, due bambini si passano la palla, una ragazza coglie un'arancia, un uomo vanga.">
        <HeroLive />
      </div>
    </Room>
  );
}

type IntroData = { eyebrow: string; title: string; text: string; cta: Cta | null };
type CtaData = { title: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null };

function HomeIdentity({ data, level }: SlotProps) {
  const d = data as IntroData;
  return (
    <Room tone="green" id="identita" className="py-20 md:py-32">
      <Wrap>
        <div className="grid items-start gap-14 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div>
            {d.eyebrow && <p className="t-label rise mb-5" style={{ color: "var(--pop-text)" }}>{d.eyebrow}</p>}
            <BlockHeading level={level} className="t-scene rise">{d.title}</BlockHeading>
            <p className="t-lead mt-8 !max-w-[34rem]"><LitWords text={d.text} /></p>
            <div className="rise mt-10"><Pill cta={d.cta} solid /></div>
          </div>
          <div className="ia-art relative aspect-[600/680] w-full overflow-hidden rounded-[2rem] bg-[var(--c-white)]"><IdentityScene /></div>
        </div>
        <div className="mt-20 grid items-center gap-6 rounded-[2rem] bg-[var(--c-yellow)] p-7 text-[var(--c-ink)] md:mt-28 md:grid-cols-[auto_1fr] md:gap-14 md:p-12">
          <p className="t-scene rise" lang="grc-Latn">kalòs kai agathòs</p>
          <div className="rise">
            <p className="t-head">Bello e buono</p>
            <p className="t-body mt-3">È il motto della cooperativa. Per noi la bellezza nasce da come ci si comporta: bello è ciò che è buono.</p>
          </div>
        </div>
      </Wrap>
    </Room>
  );
}

function HomeClosing({ data, level }: SlotProps) {
  const d = data as CtaData;
  return (
    <Room tone="yellow" id="contatti">
      <Wrap className="grid min-h-[100svh] items-center gap-10 py-20 md:grid-cols-[1.05fr_1fr] md:gap-12 md:py-24">
        <div className="relative z-10">
          <BlockHeading level={level} className="t-giant ic-title rise">{d.title}</BlockHeading>
          <p className="t-lead rise mt-7 max-w-[34rem]">{d.text}</p>
          <div className="rise mt-9 flex flex-wrap gap-3">
            <Pill cta={d.primaryCta} solid />
            <Pill cta={d.secondaryCta} />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[34rem] md:max-w-none"><ClosingScene /></div>
      </Wrap>
    </Room>
  );
}

export const homeaSlots: SlotMap = {
  "home:hero": HomeHero as never,
  "home:identita": HomeIdentity as never,
  "home:contatti": HomeClosing as never,
};
