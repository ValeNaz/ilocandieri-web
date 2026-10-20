import { LogoMark } from "@/components/brand/Logo";
import { Vignette, vignetteFor, type ArtRoom } from "@/components/public/art/liste/generic";
import { LitWords } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { BlockDataOf } from "@/lib/content/blocks";
import type { ImageMap, ResolvedImage } from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import "../liste/liste.css";
import { BlockHeading, CtaLink, MediaImage, OptionalEyebrow, Paragraphs, pickImage, type HeadingLevel } from "./shared";

/*
 * GENERIC section views: used only for blocks without a dedicated view on their page (see blocks/slots), for example a
 * block the admin adds later. They follow DESIGN.md v3.1: rooms in white + logo colours, one clear title per room,
 * kit.css type, illustrations with <Person>, no stock media, the logo only as <LogoMark> whole.
 */

const num = (i: number) => String(i + 1).padStart(2, "0");

/** The admin's image in a rounded frame, or an illustrated vignette on a cut-out panel of `panel` colour. */
function Visual({ image, title, index, panel }: { image: ResolvedImage | null; title: string; index: number; panel: ArtRoom }) {
  if (image) return <MediaImage image={image} className="aspect-[4/3] w-full rounded-[2rem] border-2 border-[var(--c-ink)]" />;
  return (
    <div aria-hidden="true" className={cn("relative aspect-[400/260] w-full overflow-hidden rounded-[2rem]", `room room-${panel}`)}>
      <Vignette kind={vignetteFor(title, index)} room={panel} />
    </div>
  );
}

/** Title (+ optional label) on the left, a short intro on the right. */
function Head({ eyebrow, title, text, level }: { eyebrow?: string; title: string; text?: string; level: HeadingLevel }) {
  return (
    <div className="rise lr-head">
      <div>
        <OptionalEyebrow text={eyebrow ?? ""} />
        <BlockHeading level={level} className="t-scene">{title}</BlockHeading>
      </div>
      {text && <p className="t-body">{text}</p>}
    </div>
  );
}

/** Numbered rows separated by a line in the room's text colour: numeral, title, text. */
function Rows({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="border-b-2 border-current">
      {items.map((it, i) => (
        <li key={i} className="rise grid gap-3 border-t-2 border-current py-7 sm:py-9 lg:grid-cols-12 lg:items-baseline lg:gap-10">
          <span aria-hidden="true" className="t-head tabular-nums text-[var(--pop)] lg:col-span-1">{num(i)}</span>
          <h3 className="t-head lg:col-span-5">{it.title}</h3>
          {it.text && <p className="t-body lg:col-span-6">{it.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/** Manifesto: the statement lights up word by word; text and an illustration (or the admin's image) below. */
export function IntroBlock({ data, images, level }: { data: BlockDataOf<"intro">; images: ImageMap; level: HeadingLevel }) {
  return (
    <Room tone="white" id={data.slot} className="py-20 sm:py-28">
      <Wrap>
        <OptionalEyebrow text={data.eyebrow} />
        <BlockHeading level={level} className="t-scene max-w-[22ch]"><LitWords text={data.title} /></BlockHeading>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="rise space-y-4 lg:col-span-5"><Paragraphs text={data.text} className="t-body" />
            {data.cta && <div className="pt-4"><CtaLink cta={data.cta} kind="secondary" /></div>}
          </div>
          <div className="lg:col-span-6 lg:col-start-7"><Visual image={pickImage(images, data.imageId)} title={data.title} index={0} panel="orange" /></div>
        </div>
      </Wrap>
    </Room>
  );
}

/** Text section: title and text beside an illustration or the admin's image; optional numbered items below. */
export function FeatureBlock({ data, images, level, index = 0 }: { data: BlockDataOf<"feature">; images: ImageMap; level: HeadingLevel; index?: number }) {
  const left = data.imageSide === "left";
  const tone = data.tone === "deep" ? "yellow" : "white";
  return (
    <Room tone={tone} id={data.slot} className="py-20 sm:py-28">
      <Wrap>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className={cn("rise lg:col-span-5", left && "lg:order-2 lg:col-start-8")}>
            <OptionalEyebrow text={data.eyebrow} />
            <BlockHeading level={level} className="t-scene">{data.title}</BlockHeading>
            <div className="mt-6 space-y-4"><Paragraphs text={data.text} className="t-body" /></div>
            {data.cta && <div className="mt-8"><CtaLink cta={data.cta} /></div>}
          </div>
          <div className={cn("lg:col-span-6", left ? "lg:order-1" : "lg:col-start-7")}>
            <Visual image={pickImage(images, data.imageId)} title={`${data.slot ?? ""} ${data.title}`} index={index} panel={tone === "yellow" ? "green" : "yellow"} />
          </div>
        </div>
        {data.items.length > 0 && <div className="mt-16"><Rows items={data.items} /></div>}
      </Wrap>
    </Room>
  );
}

/** What the cooperative does: a green room of numbered rows. */
export function PillarsBlock({ data, level }: { data: BlockDataOf<"pillars">; level: HeadingLevel }) {
  return (
    <Room tone="green" id={data.slot} className="py-20 sm:py-28">
      <Wrap>
        <Head eyebrow={data.eyebrow} title={data.title} text={data.intro} level={level} />
        <Rows items={data.items} />
      </Wrap>
    </Room>
  );
}

/** Values: a yellow room of numbered rows. */
export function ValuesBlock({ data, level }: { data: BlockDataOf<"values">; level: HeadingLevel }) {
  return (
    <Room tone="yellow" id={data.slot} className="py-20 sm:py-28">
      <Wrap>
        <Head eyebrow={data.eyebrow} title={data.title} level={level} />
        <Rows items={data.items} />
      </Wrap>
    </Room>
  );
}

/** Places: cut-out panels in different logo colours, each with its scene (or the admin's photo), title and text. */
const PANELS = ["yellow", "orange", "green", "yellow"] as const;
export function PlacesBlock({ data, images, level }: { data: BlockDataOf<"places">; images: ImageMap; level: HeadingLevel }) {
  return (
    <Room tone="white" id={data.slot} className="py-20 sm:py-28">
      <Wrap>
        <Head eyebrow={data.eyebrow} title={data.title} text={data.text} level={level} />
        <ul className={cn("grid gap-6", data.items.length > 1 && "md:grid-cols-2")}>
          {data.items.map((it, i) => {
            const panel = PANELS[i % PANELS.length]!;
            const img = pickImage(images, it.imageId);
            return (
              <li key={i} className={cn("rise cut", `cut-${panel}`, "!p-4 sm:!p-5")}>
                {img ? <MediaImage image={img} className="aspect-[400/260] w-full rounded-[1.5rem]" /> : (
                  <div aria-hidden="true" className="relative aspect-[400/260] overflow-hidden rounded-[1.5rem]"><Vignette kind={vignetteFor(it.title, i)} room={panel} /></div>
                )}
                <div className="px-2 pb-3 pt-5 sm:px-3">
                  <h3 className="t-head">{it.title}</h3>
                  {it.text && <p className="t-body mt-3">{it.text}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        {data.cta && <div className="mt-12"><CtaLink cta={data.cta} kind="secondary" /></div>}
      </Wrap>
    </Room>
  );
}

/** Closing room: the logo enters whole as it scrolls in, one title, the invitation to come in. */
export function CtaBlock({ data, level }: { data: BlockDataOf<"cta">; level: HeadingLevel }) {
  return (
    <Room tone="white" id={data.slot} className="py-20 sm:py-28">
      <Wrap className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-3"><LogoMark build="view" className="h-28 w-auto sm:h-36" /></div>
        <div className="rise lg:col-span-8 lg:col-start-5">
          <BlockHeading level={level} className="t-giant max-w-[18ch]">{data.title}</BlockHeading>
          {data.text && <p className="t-lead mt-6">{data.text}</p>}
          {(data.primaryCta || data.secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink cta={data.primaryCta} />
              <CtaLink cta={data.secondaryCta} kind="secondary" />
            </div>
          )}
        </div>
      </Wrap>
    </Room>
  );
}

/** Compact heading for list pages (events/news/careers sections). */
export function SectionHeadingBlock({ data, level }: { data: BlockDataOf<"section_heading">; level: HeadingLevel }) {
  return (
    <Room tone="white" id={data.slot} className="pb-2 pt-14 sm:pt-20">
      <Wrap>
        <div className="rise">
          <OptionalEyebrow text={data.eyebrow} />
          <BlockHeading level={level} className="t-scene max-w-[24ch]">{data.title}</BlockHeading>
          {data.text && <p className="t-body mt-4">{data.text}</p>}
        </div>
      </Wrap>
    </Room>
  );
}
