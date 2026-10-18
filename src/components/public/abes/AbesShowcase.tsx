// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable (`id` is an optional addition for the journey rail).
import Image from "next/image";
import { ButtonLink, Container } from "@/components/ui";
import type { ShowcaseProduct } from "@/lib/abes/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { Stamp } from "../art/primitives";

export type AbesShowcaseProps = {
  products: ShowcaseProduct[];
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string; // global CTA -> https://abes.bio/collections/all
  cardCtaLabel: string; // "Scopri il prodotto"
  headingLevel?: 2 | 3;
  id?: string;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={cn("size-4", className)}>
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}

/** One product = one label. The whole card is a link to THAT product on abes.bio. */
function ProductCard({ p, index, cta, Heading }: { p: ShowcaseProduct; index: number; cta: string; Heading: "h2" | "h3" | "h4" }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      data-abes-product
      className="group/card relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-card text-ink transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-2 hover:rotate-[-1.2deg] hover:shadow-[0.5rem_0.5rem_0_0_var(--color-ink)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cobalto"
    >
      <div className="relative aspect-square overflow-hidden border-b-[3px] border-ink bg-white">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.imageAlt}
            fill
            loading={index < 4 ? "eager" : "lazy"}
            sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 72vw"
            className="object-contain p-3 transition-transform duration-500 ease-out-expo group-hover/card:scale-[1.06]"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center font-display text-5xl font-extrabold text-terracotta/40">ABES</span>
        )}
        <span aria-hidden="true" className="absolute left-3 top-3 rounded-md bg-ink px-2 py-1 font-stencil text-[0.78rem] font-bold tracking-widest text-limone">
          N° {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {p.category && <p className="font-stencil text-[0.78rem] font-bold uppercase tracking-[0.16em] text-olive-deep">{p.category}</p>}
        <Heading className="text-[1.2rem] font-extrabold leading-tight">{p.title}</Heading>
        {(p.priceText || p.available !== null) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {p.priceText && <span className="font-bold">{p.priceText}</span>}
            {p.available === false && <span className="text-ink-soft">Al momento esaurito</span>}
            {p.available === true && <span className="text-olive-deep">Disponibile</span>}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[0.95rem] font-bold text-cobalto">
          <span className="marker group-hover/card:[background-size:100%_44%]">{cta}</span>
          <ArrowUpRight className="transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
          <span className="sr-only"> (si apre su abes.bio)</span>
        </span>
      </div>
    </a>
  );
}

/**
 * ABES showcase: real products, each card is one link to THAT product on abes.bio (new tab).
 * No cart, no "buy now". Mobile = accessible scroll-snap strip, >= md = grid (alternate cards sit lower, like labels on a shelf).
 * A ticker of the real product categories runs above the scene. Empty list = plain CTA to the catalogue.
 */
export function AbesShowcase({ products, eyebrow, title, text, ctaLabel, cardCtaLabel, headingLevel = 2, id }: AbesShowcaseProps) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const CardH = headingLevel === 2 ? "h3" : "h4";
  const cols = products.length === 3 || products.length === 6 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const categories = [...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))];
  return (
    <section id={id} data-chapter aria-labelledby="abes-showcase-title" className="relative isolate overflow-hidden bg-limone text-ink">
      {categories.length > 0 && (
        <div aria-hidden="true" className="ticker border-b-[3px] border-ink bg-ink py-3 text-limone">
          {[0, 1].map((n) => (
            <div key={n} className="ticker-track font-stencil text-lg font-bold uppercase tracking-[0.2em]">
              {[...categories, ...categories].map((c, i) => <span key={i}>{c} ✺</span>)}
            </div>
          ))}
        </div>
      )}
      <Container className="py-20 sm:py-32">
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="rise">
            {eyebrow && <p className="mb-5"><Stamp className="stamp-in">{eyebrow}</Stamp></p>}
            <H id="abes-showcase-title" className="max-w-[16ch] text-[clamp(2.4rem,6.4vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">{title}</H>
          </div>
          <div className="space-y-6">
            {text && <p className="max-w-prose text-[1.08rem] leading-relaxed sm:text-xl">{text}</p>}
            <div className="hidden lg:block">
              <ButtonLink href={paths.abesShop} size="lg">
                {ctaLabel}
                <ArrowUpRight className="size-5" />
              </ButtonLink>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-12 sm:mt-20">
            <p className="mb-3 font-stencil text-sm font-bold uppercase tracking-widest md:hidden" aria-hidden="true">Scorri per vedere tutti i prodotti →</p>
            <ul
              role="list"
              // Cards are links, so the scrollable strip is keyboard reachable (focus scrolls them into view).
              aria-label="Prodotti ABES"
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-8 pt-2 [scrollbar-width:thin] sm:-mx-8 sm:px-8",
                "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0", cols,
              )}
            >
              {products.map((p, i) => (
                <li key={p.id} className="w-[72%] max-w-[19rem] shrink-0 snap-start scroll-ml-5 sm:scroll-ml-8 md:w-auto md:max-w-none md:[&:nth-child(even)]:mt-10 lg:[&:nth-child(even)]:mt-14">
                  <ProductCard p={p} index={i} cta={cardCtaLabel} Heading={CardH} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-10 max-w-prose text-lg">Il catalogo completo, con tutte le schede, prezzi e disponibilità aggiornati, è sul negozio ABES.</p>
        )}

        <div className={cn("mt-8 sm:mt-14", products.length > 0 && "lg:hidden")}>
          <ButtonLink href={paths.abesShop} size="lg">
            {ctaLabel}
            <ArrowUpRight className="size-5" />
          </ButtonLink>
        </div>
        {products.length > 0 && (
          <p className="mt-8 hidden max-w-xl text-sm lg:block">Prezzi, disponibilità, ordini e spedizioni sono gestiti da ABES: ogni scheda ti porta alla pagina del prodotto sul loro negozio.</p>
        )}
      </Container>
    </section>
  );
}
