import { Container } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { HeroSceneArt } from "../art/hero-scene";
import { PosterArt, type PosterTone } from "../art/poster";
import { Stamp } from "../art/primitives";
import { BlockHeading, CtaLink, FIELD, OptionalEyebrow, Paragraphs, TITLE, pickImage, toneForPage, type HeadingLevel } from "./shared";

/** Padlock and chain that hang on the gate at the start of the journey. Falls away as you scroll (journey.css). */
function Padlock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 160" className="padlock">
      <g fill="none" strokeWidth="9" className="stroke-ink">
        {[-112, -84, -56, 56, 84, 112].map((dx, i) => <rect key={i} x={150 + dx - 13} y="86" width="26" height="14" rx="7" />)}
      </g>
      <path d="M118 78 V52 a32 32 0 0 1 64 0 V78" fill="none" strokeWidth="13" strokeLinecap="round" className="stroke-ink" />
      <rect x="98" y="72" width="104" height="78" rx="16" className="fill-terracotta stroke-ink" strokeWidth="6" />
      <circle cx="150" cy="106" r="10" className="fill-ink" />
      <rect x="146" y="108" width="8" height="24" rx="3" className="fill-ink" />
    </svg>
  );
}

/**
 * Home hero. A sealed place (grey, behind a closed gate) that, as you scroll, opens and takes color. Where scroll-driven
 * animation is unavailable or motion is reduced, the gate is already open. The copy sits on a label, so it never depends on the art.
 */
function GateHero({ data, images, level }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel }) {
  const image = pickImage(images, data.imageId);
  return (
    <section id={data.slot} data-chapter className="hero">
      <div className="hero-stage">
        <div className="hero-art">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- local /media files
            <img className="hero-photo" src={image.url} alt={image.alt} fetchPriority="high" decoding="async" />
          ) : (
            <>
              <svg aria-hidden="true" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="hero-svg wide"><HeroSceneArt /></svg>
              <svg aria-hidden="true" viewBox="630 100 620 540" preserveAspectRatio="xMidYMid slice" className="hero-svg narrow"><HeroSceneArt /></svg>
            </>
          )}
          <div aria-hidden="true" className="hero-veil" />
          <div aria-hidden="true" className="hero-dim" />
          <div aria-hidden="true" className="gate">
            <div className="gate-leaf gate-left" />
            <div className="gate-leaf gate-right" />
          </div>
          <Padlock />
        </div>

        <div className="hero-label">
          {data.eyebrow && <p className="mb-4"><Stamp className="text-terracotta-deep">{data.eyebrow}</Stamp></p>}
          <BlockHeading level={level} className={cn("reveal font-extrabold text-[clamp(1.85rem,7.6vw,2.7rem)] leading-[1.02] tracking-[-0.025em] min-[900px]:text-[clamp(2.2rem,3.7vw,3.7rem)]")}>
            {data.title}
          </BlockHeading>
          <div className="reveal mt-4 max-w-xl space-y-3 text-[0.98rem] leading-relaxed text-ink-soft [animation-delay:120ms] sm:text-[1.05rem] min-[900px]:mt-5">
            <Paragraphs text={data.text} />
          </div>
          <div className="reveal mt-5 flex flex-wrap gap-x-3 gap-y-3 [animation-delay:220ms] min-[900px]:mt-7">
            <CtaLink cta={data.primaryCta} size="lg" />
            <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" />
          </div>
        </div>
        <p aria-hidden="true" className="hero-hint"><Stamp className="text-ink">Scorri ↓</Stamp></p>
      </div>
    </section>
  );
}

/** Title block of an inner page: a field of color from the page's identity, huge heading, large ornament drifting at the edge. */
function PosterHero({ data, level, pageKey }: { data: BlockDataOf<"hero">; level: HeadingLevel; pageKey?: string }) {
  const tone: PosterTone = toneForPage(pageKey, data.title);
  const dark = tone === "limone" || tone === "kraft";
  return (
    <section id={data.slot} className={cn("relative isolate overflow-hidden", FIELD[tone])}>
      <PosterArt tone={tone} className="pointer-events-none absolute -bottom-24 -right-28 -z-10 hidden w-[22rem] sm:block lg:-bottom-28 lg:-right-20 lg:w-[30rem] xl:w-[36rem]" />
      <Container className="relative py-14 sm:py-24 lg:py-32">
        <PosterArt tone={tone} className="mb-8 ml-auto w-32 sm:hidden" />
        <div className="max-w-4xl lg:max-w-[58%]">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn("reveal", TITLE.hero)}>{data.title}</BlockHeading>
          <div className={cn("reveal mt-7 max-w-2xl space-y-4 text-lg leading-relaxed sm:text-xl [animation-delay:120ms]", dark ? "text-ink" : "text-paper")}>
            <Paragraphs text={data.text} />
          </div>
          {(data.primaryCta || data.secondaryCta) && (
            <div className="reveal mt-9 flex flex-wrap gap-3 [animation-delay:220ms]">
              <CtaLink cta={data.primaryCta} size="lg" dark={!dark} />
              <CtaLink cta={data.secondaryCta} kind="secondary" size="lg" dark={!dark} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function HeroBlock({ data, images, level, pageKey }: { data: BlockDataOf<"hero">; images: ImageMap; level: HeadingLevel; pageKey?: string }) {
  return data.size === "large" ? <GateHero data={data} images={images} level={level} /> : <PosterHero data={data} level={level} pageKey={pageKey} />;
}
