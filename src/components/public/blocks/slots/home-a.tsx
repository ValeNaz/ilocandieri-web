import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import "@/components/public/art/home/home-a.css";
import { HeroLive } from "@/components/public/art/home/hero-live";
import { Live } from "@/components/public/kit/Live";
import { Room, Wrap } from "@/components/public/kit/Room";
import { RealMedia } from "@/components/public/real/RealMedia";
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
        <Live threshold={0}><HeroLive /></Live>
      </div>
    </Room>
  );
}

type IntroData = { eyebrow: string; title: string; text: string; cta: Cta | null };
type CtaData = { title: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null };

/** Chi siamo on white: the words, and the people (group photo) with a drawn sun and orange branch breaking the frame. */
function HomeIdentity({ data, level }: SlotProps) {
  const d = data as IntroData;
  return (
    <Room tone="white" id="identita" className="py-16 sm:py-24">
      <Wrap>
        <div className="ia-grid grid items-center gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            {d.eyebrow && <p className="t-label mb-4" style={{ color: "var(--pop-text)" }}>{d.eyebrow}</p>}
            <BlockHeading level={level} className="t-scene">{d.title}</BlockHeading>
            <p className="t-lead mt-6 !max-w-[34rem]">{d.text}</p>
            <div className="mt-8"><Pill cta={d.cta} solid /></div>
          </div>
          <div className="ia-photo"><RealMedia id="chi-siamo-squadra" aspect="4/3" deco={["sun", "branch"]} sizes="(min-width: 768px) 46vw, 92vw" /></div>
        </div>
        <div className="mt-16 grid items-center gap-6 rounded-[28px] bg-[var(--c-yellow)] p-7 text-[var(--c-ink)] md:mt-20 md:grid-cols-[auto_1fr] md:gap-14 md:p-12">
          <p className="t-scene" lang="grc-Latn">kalòs kai agathòs</p>
          <div>
            <p className="t-head">Bello e buono</p>
            <p className="t-body mt-3">È il motto della cooperativa. Per noi la bellezza nasce da come ci si comporta: bello è ciò che è buono.</p>
          </div>
        </div>
      </Wrap>
    </Room>
  );
}

/** Closing on yellow: an arch window onto the real garden (photo), drawn sun and birds around it. */
function HomeClosing({ data, level }: SlotProps) {
  const d = data as CtaData;
  return (
    <Room tone="yellow" id="contatti" className="py-16 sm:py-24">
      <Wrap className="ic-grid grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-14">
        <div className="relative z-10">
          <BlockHeading level={level} className="t-giant ic-title">{d.title}</BlockHeading>
          <p className="t-lead mt-6 max-w-[34rem]">{d.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill cta={d.primaryCta} solid />
            <Pill cta={d.secondaryCta} />
          </div>
        </div>
        <div className="ic-photo mx-auto w-full max-w-[30rem]"><RealMedia id="giardino-agrumeto" shape="arch" aspect="4/5" deco={["sun", "birds"]} sizes="(min-width: 768px) 40vw, 92vw" /></div>
      </Wrap>
    </Room>
  );
}

export const homeaSlots: SlotMap = {
  "home:hero": HomeHero as never,
  "home:identita": HomeIdentity as never,
  "home:contatti": HomeClosing as never,
};
