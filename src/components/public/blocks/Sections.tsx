import type { CSSProperties } from "react";
import { Container, Section } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { Emblem } from "../art/emblems";
import { Plate } from "../art/plates";
import { Seal } from "../art/primitives";
import { BlockHeading, CtaLink, MediaImage, OptionalEyebrow, Paragraphs, TITLE, pickImage, type HeadingLevel } from "./shared";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Colors of the four "cosa facciamo" panels (field + the three print colors of the emblem). Verified pairs:
 * paper on cobalto / olive-deep / terracotta, ink on limone / kraft (tests/unit/contrast.test.ts).
 */
const PANELS = [
  { field: "bg-cobalto text-paper on-dark", e: ["var(--color-limone)", "var(--color-arancio)", "var(--color-paper)"], num: "text-limone" },
  { field: "bg-limone text-ink", e: ["var(--color-cobalto)", "var(--color-terracotta)", "var(--color-paper)"], num: "text-terracotta-deep" },
  { field: "bg-olive-deep text-paper on-dark", e: ["var(--color-arancio)", "var(--color-limone)", "var(--color-paper)"], num: "text-limone" },
  { field: "bg-kraft text-ink", e: ["var(--color-terracotta)", "var(--color-olive)", "var(--color-paper)"], num: "text-terracotta-deep" },
  { field: "bg-terracotta text-paper on-dark", e: ["var(--color-limone)", "var(--color-paper)", "var(--color-cobalto)"], num: "text-limone" },
  { field: "bg-paper-deep text-ink", e: ["var(--color-cobalto)", "var(--color-arancio)", "var(--color-paper)"], num: "text-cobalto" },
] as const;

/** Identity scene (home): the statement on a field of tomato, with the cooperative's seal turning as you scroll. */
export function IntroBlock({ data, images, level }: { data: BlockDataOf<"intro">; images: ImageMap; level: HeadingLevel }) {
  const image = pickImage(images, data.imageId);
  const sage = data.tone === "sage";
  return (
    <section id={data.slot} data-chapter className={cn("relative isolate overflow-hidden", sage ? "bg-olive-deep text-paper on-dark" : "bg-terracotta text-paper on-dark")}>
      <div aria-hidden="true" className="absolute -bottom-72 -right-48 -z-10 size-[40rem] rounded-full border-[3px] border-paper/20 lg:-bottom-56 lg:right-[-14rem]" />
      <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:gap-10 lg:py-36">
        <div className="rise lg:col-span-7">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={TITLE.scene}>{data.title}</BlockHeading>
          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed sm:text-xl">
            <Paragraphs text={data.text} />
          </div>
          {data.cta && <div className="mt-10"><CtaLink cta={data.cta} dark size="lg" /></div>}
        </div>
        <div className="relative grid place-items-center lg:col-span-5">
          {image ? (
            <div className="misprint w-full max-w-md rounded-[1.75rem]" style={{ "--misprint": "var(--color-limone)" } as Vars}>
              <MediaImage image={image} className="aspect-[4/5] w-full rounded-[1.75rem] border-[3px] border-ink" />
            </div>
          ) : (
            <div style={{ "--seal-bg": "var(--color-paper)", "--seal-ink": "var(--color-ink)" } as Vars} className="w-[min(21rem,72vw)] drop-shadow-[0.7rem_0.7rem_0_var(--color-ink)] lg:w-[min(26rem,100%)]">
              <Seal className="w-full" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/** Text + visual section with optional "schede" (Chi siamo, Shop). The visual is a real image or an emblem on a field. */
export function FeatureBlock({ data, images, level, index = 0 }: { data: BlockDataOf<"feature">; images: ImageMap; level: HeadingLevel; index?: number }) {
  const image = pickImage(images, data.imageId);
  const left = data.imageSide === "left";
  const panel = PANELS[(index + 1) % PANELS.length]!;
  const useSeal = /missione|storia/.test(data.slot ?? "");
  return (
    <Section id={data.slot} tone={data.tone === "deep" ? "deep" : "paper"} className="py-16 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className={cn("rise lg:col-span-7", left && "lg:order-2")}>
            <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
            <BlockHeading level={level} className={cn(TITLE.section, "max-w-3xl")}>{data.title}</BlockHeading>
            <div className="mt-7 max-w-2xl space-y-5 text-lg leading-relaxed text-ink-soft sm:text-[1.2rem]">
              <Paragraphs text={data.text} />
            </div>
            {data.cta && <div className="mt-9"><CtaLink cta={data.cta} /></div>}
          </div>
          <div className={cn("lg:col-span-5", left && "lg:order-1")}>
            {image ? (
              <div className="misprint rounded-[1.75rem]" style={{ "--misprint": "var(--color-limone)" } as Vars}>
                <MediaImage image={image} className="aspect-[4/3] w-full rounded-[1.75rem] border-[3px] border-ink lg:aspect-square" />
              </div>
            ) : (
              <div
                className={cn("relative grid aspect-square place-items-center overflow-hidden rounded-[1.75rem] border-[3px] border-ink", panel.field)}
                style={{ "--e1": panel.e[0], "--e2": panel.e[1], "--e3": panel.e[2] } as Vars}
              >
                {useSeal ? (
                  <div style={{ "--seal-bg": "var(--color-paper)", "--seal-ink": "var(--color-ink)" } as Vars} className="w-[70%]"><Seal className="w-full" /></div>
                ) : (
                  <Emblem slot={data.slot} index={index} className="drift-a w-[62%]" />
                )}
              </div>
            )}
          </div>
        </div>
        {data.items.length > 0 && (
          <ul className={cn("mt-14 grid gap-x-10 gap-y-12 sm:mt-20", data.items.length > 1 && "md:grid-cols-2")}>
            {data.items.map((it, i) => {
              const img = pickImage(images, it.imageId);
              return (
                <li key={i} className="rise border-t-[3px] border-ink pt-6">
                  <p aria-hidden="true" className="font-stencil text-5xl font-bold leading-none text-terracotta">{String(i + 1).padStart(2, "0")}</p>
                  {img && <MediaImage image={img} className="mt-5 aspect-[16/10] w-full rounded-[1.25rem] border-[3px] border-ink" />}
                  <h3 className="mt-5 text-2xl font-extrabold sm:text-[1.9rem]">{it.title}</h3>
                  <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">{it.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}

/**
 * "Cosa facciamo": each activity is a panel printed on its own color; the panels stack like labels on a crate as you scroll.
 * Stacking is pure CSS (position: sticky) and is turned off under reduced motion.
 */
export function PillarsBlock({ data, level }: { data: BlockDataOf<"pillars">; level: HeadingLevel }) {
  return (
    <section id={data.slot} data-chapter className="bg-paper pb-24 pt-20 sm:pb-36 sm:pt-32">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="rise lg:col-span-8">
            <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
            <BlockHeading level={level} className={TITLE.scene}>{data.title}</BlockHeading>
          </div>
          {data.intro && <p className="rise text-lg leading-relaxed text-ink-soft lg:col-span-4">{data.intro}</p>}
        </div>
        <ol className="stack mt-12 sm:mt-20">
          {data.items.map((it, i) => {
            const p = PANELS[i % PANELS.length]!;
            return (
              <li key={i} style={{ "--i": i } as Vars}>
                <div
                  className={cn("stack-panel relative grid items-center gap-8 overflow-hidden rounded-[2rem] border-[3px] border-ink p-7 shadow-[0_18px_40px_-22px_rgb(30_25_18/0.55)] sm:p-12 lg:grid-cols-12 lg:p-16", p.field)}
                  style={{ "--e1": p.e[0], "--e2": p.e[1], "--e3": p.e[2] } as Vars}
                >
                  <div className="lg:col-span-7">
                    <p aria-hidden="true" className={cn("font-stencil text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.85]", p.num)}>{String(i + 1).padStart(2, "0")}</p>
                    <h3 className={cn("mt-5", TITLE.panel)}>{it.title}</h3>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed sm:text-xl">{it.text}</p>
                  </div>
                  <div className="grid place-items-center lg:col-span-5">
                    <Emblem index={i} className="w-44 sm:w-60 lg:w-[22rem]" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/** Values: a typographic list, big stencil numerals on a field of lemon. */
export function ValuesBlock({ data, level }: { data: BlockDataOf<"values">; level: HeadingLevel }) {
  return (
    <Section id={data.slot} className="bg-limone py-16 text-ink sm:py-28">
      <Container>
        <div className="rise">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className={cn(TITLE.section, "max-w-3xl")}>{data.title}</BlockHeading>
        </div>
        <ul className="mt-14 grid gap-x-14 gap-y-12 sm:grid-cols-2">
          {data.items.map((it, i) => (
            <li key={i} className="rise border-t-[3px] border-ink pt-5">
              <p aria-hidden="true" className="font-stencil text-6xl font-bold leading-none text-cobalto">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-3xl font-extrabold">{it.title}</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed">{it.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Places: two plates on a field of olive, offset against each other and drifting at different speeds as you scroll. */
export function PlacesBlock({ data, images, level }: { data: BlockDataOf<"places">; images: ImageMap; level: HeadingLevel }) {
  return (
    <section id={data.slot} data-chapter className="relative overflow-hidden bg-olive-deep py-20 text-paper on-dark sm:py-32">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="rise lg:col-span-8">
            <OptionalEyebrow text={data.eyebrow} className="text-limone" />
            <BlockHeading level={level} className={cn(TITLE.scene, "text-paper")}>{data.title}</BlockHeading>
          </div>
          {data.text && <p className="rise text-lg leading-relaxed lg:col-span-4">{data.text}</p>}
        </div>
        <ul className="mt-14 grid gap-16 sm:mt-24 md:grid-cols-2 md:gap-12">
          {data.items.map((it, i) => {
            const img = pickImage(images, it.imageId);
            return (
              <li key={i} className={cn(i % 2 === 1 && "md:mt-32", i % 2 === 0 ? "drift-a" : "drift-b")}>
                <figure className="rounded-[2rem] bg-paper p-3 shadow-[0.7rem_0.7rem_0_0_var(--color-limone)]">
                  <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] border-[3px] border-ink">
                    {img ? <MediaImage image={img} className="size-full" /> : <Plate index={i} className="size-full" />}
                  </div>
                </figure>
                <h3 className="mt-8 text-3xl font-extrabold text-paper sm:text-4xl">{it.title}</h3>
                <p className="mt-3 max-w-md text-lg leading-relaxed">{it.text}</p>
              </li>
            );
          })}
        </ul>
        {data.cta && <div className="mt-16"><CtaLink cta={data.cta} dark size="lg" /></div>}
      </Container>
    </section>
  );
}

/** Closing call to action: the last scene, in cobalto, with a rising sun. */
export function CtaBlock({ data, level }: { data: BlockDataOf<"cta">; level: HeadingLevel }) {
  return (
    <section id={data.slot} data-chapter className="relative isolate overflow-hidden bg-cobalto pb-24 pt-52 text-paper on-dark sm:py-36">
      <div aria-hidden="true" className="drift-b absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-limone sm:-right-32 sm:top-8 sm:size-[38rem]" />
      <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-80 rounded-full border-[3px] border-limone/60 sm:-right-44 sm:top-[-1rem] sm:size-[46rem]" />
      <Container>
        <div className="rise max-w-4xl">
          <BlockHeading level={level} className={cn(TITLE.hero, "text-paper")}>{data.title}</BlockHeading>
          {data.text && <p className="mt-8 max-w-xl rounded-2xl bg-cobalto-deep p-5 text-lg leading-relaxed sm:text-xl">{data.text}</p>}
          {(data.primaryCta || data.secondaryCta) && (
            <div className="mt-10 flex flex-wrap gap-3">
              <CtaLink cta={data.primaryCta} dark size="lg" />
              <CtaLink cta={data.secondaryCta} dark kind="secondary" size="lg" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/** Compact heading for list pages (events/news/careers sections). */
export function SectionHeadingBlock({ data, level }: { data: BlockDataOf<"section_heading">; level: HeadingLevel }) {
  return (
    <section id={data.slot} className="pb-2 pt-16 sm:pt-24">
      <Container>
        <div className="rise">
          <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
          <BlockHeading level={level} className={cn(TITLE.section, "max-w-3xl")}>{data.title}</BlockHeading>
          {data.text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{data.text}</p>}
        </div>
      </Container>
    </section>
  );
}
