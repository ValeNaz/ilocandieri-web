import { AbesLogo } from "@/components/brand/AbesLogo";
import { PillLink } from "@/components/public/abes/PillLink";
import { Crate, Jar, PastaPack } from "@/components/public/art/abes/parts";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { BlockDataOf } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import { AbesBlock } from "../Dynamic";
import { FOTO, pickImage } from "../shared";
import type { SlotMap, SlotProps } from "./types";

/* Scena: stanza bianca (il logo ABES sta sul bianco), titolo a sinistra; a destra la foto vera dei vasetti ABES in un arco verde, con due prodotti disegnati fermi
   agli angoli (fuori dal testo). Nessun loop: si muove solo il titolo all'ingresso. */
function ShopHero({ data, images, level }: SlotProps) {
  const d = data as BlockDataOf<"hero">;
  const img = pickImage(images, d.imageId);
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room tone="white" className="py-10 sm:py-16">
      <Wrap className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          {level === 1 && <AbesLogo priority className="mb-6 w-40 sm:w-52" />}
          {d.eyebrow && <p className="t-label mb-5">{d.eyebrow}</p>}
          <Kinetic as={H} text={d.title} className="t-giant" />
          {d.text && <p className="t-lead mt-6">{d.text}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {d.primaryCta && <PillLink href={d.primaryCta.href}>{d.primaryCta.label}</PillLink>}
            {d.secondaryCta && <PillLink href={d.secondaryCta.href} kind="line">{d.secondaryCta.label}</PillLink>}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[34rem] pb-6">
          <div className="ph ph-arch ph-tilt aspect-[4/5]" style={{ background: "var(--c-green)", padding: "0.9rem 0.9rem 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local /media or /foto file */}
            <img src={img?.url ?? FOTO.vasetti.src} alt={img?.alt ?? FOTO.vasetti.alt} className="size-full rounded-[inherit] object-cover" style={{ borderRadius: "999px 999px 1.4rem 1.4rem" }} />
          </div>
          <svg viewBox="0 0 120 170" className="pointer-events-none absolute -left-4 bottom-0 w-24 -rotate-6 sm:-left-10 sm:w-32" aria-hidden="true" focusable="false"><Jar x={60} y={162} s={0.95} label="orange" content="green" lid="white" name={["Sugo", "al basilico"]} /></svg>
          <svg viewBox="0 0 120 190" className="pointer-events-none absolute -right-3 -top-6 w-20 rotate-6 sm:-right-8 sm:w-28" aria-hidden="true" focusable="false"><PastaPack x={60} y={182} s={0.95} label="orange" name={["Abbracci", "Tumminia"]} /></svg>
        </div>
      </Wrap>
    </Room>
  );
}

/* Scena: la storia della filiera in testo a sinistra; a destra la foto vera delle cassette di verdura, con una cassetta
   disegnata ferma all'angolo (gialla, contrasta col verde della stanza). Nessun loop. */
function ShopStoria({ data, images, level }: SlotProps) {
  const d = data as BlockDataOf<"feature">;
  const img = pickImage(images, d.imageId);
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room tone="green" className="py-16 sm:py-28">
      <Wrap className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {d.eyebrow && <p className="t-label mb-4 text-[var(--pop-text)]">{d.eyebrow}</p>}
          <H className="t-giant">{d.title}</H>
          <p className="t-lead mt-6">{d.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={d.cta?.href ?? paths.abes}>{d.cta?.label ?? "Dal seme al barattolo"}</PillLink>
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="ph ph-leaf ph-tilt aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element -- local file */}
            <img src={img?.url ?? FOTO.cassette.src} alt={img?.alt ?? FOTO.cassette.alt} className="size-full object-cover" />
          </div>
          <svg viewBox="0 0 160 100" className="pointer-events-none absolute -bottom-6 -right-2 w-28 sm:-right-8 sm:w-36" aria-hidden="true" focusable="false">
            <Crate x={80} y={94} w={130} h={50} produce="orange" />
          </svg>
        </div>
      </Wrap>
    </Room>
  );
}

const Vetrina = ({ data, level }: SlotProps) => <AbesBlock data={data as BlockDataOf<"abes_showcase">} level={level} />;

export const shopSlots: SlotMap = { "shop:hero": ShopHero, "shop:storia": ShopStoria, "shop:vetrina": Vetrina };

/** Scena: chiusura di /shop, stanza bianca, il logo ABES entra una volta; accanto il testo e due uscite. */
export function ShopClosing() {
  return (
    <Room tone="white" className="py-20 sm:py-32">
      <Wrap className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
        <AbesLogo className="logo-build-view mx-auto w-60 sm:w-72 lg:w-80" />
        <div>
          <h2 className="t-giant">Ordini e spedizioni sono su abes.bio.</h2>
          <p className="t-lead mt-6">Da qui scegli. Il negozio ABES pensa a prezzi, disponibilità e consegna.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={paths.abesShop}>Vai su abes.bio</PillLink>
            <PillLink href={paths.abes} kind="line">Dal seme al barattolo</PillLink>
          </div>
        </div>
      </Wrap>
    </Room>
  );
}
