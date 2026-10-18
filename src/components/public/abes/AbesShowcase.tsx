// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable.
import Image from "next/image";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import type { ShowcaseProduct } from "@/lib/abes/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

export type AbesShowcaseProps = {
  products: ShowcaseProduct[];
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string; // global CTA -> https://abes.bio/collections/all
  cardCtaLabel: string; // "Scopri il prodotto"
  headingLevel?: 2 | 3;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("size-4", className)}>
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}

function ProductCard({ p, index, cta, Heading }: { p: ShowcaseProduct; index: number; cta: string; Heading: "h2" | "h3" | "h4" }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      data-abes-product
      className="group/card relative flex h-full flex-col overflow-hidden rounded-card bg-card text-ink shadow-card transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1.5 hover:shadow-pop focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sage"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.imageAlt}
            fill
            sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 72vw"
            className="object-contain p-3 transition-transform duration-500 ease-out-soft group-hover/card:scale-[1.04]"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center font-display text-5xl text-terracotta/40">ABES</span>
        )}
        <span aria-hidden="true" className="absolute left-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold tabular-nums tracking-widest text-ink-soft">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        {p.category && <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-olive">{p.category}</p>}
        <Heading className="font-display text-[1.3rem] font-medium leading-tight">{p.title}</Heading>
        {(p.priceText || p.available !== null) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {p.priceText && <span className="font-semibold">{p.priceText}</span>}
            {p.available === false && <span className="text-ink-soft">Al momento esaurito</span>}
            {p.available === true && <span className="text-olive-deep">Disponibile</span>}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[0.95rem] font-semibold text-terracotta-deep">
          <span className="border-b-2 border-terracotta/30 pb-0.5 transition-colors group-hover/card:border-terracotta">{cta}</span>
          <ArrowUpRight className="transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
          <span className="sr-only"> (si apre su abes.bio)</span>
        </span>
      </div>
    </a>
  );
}

/**
 * ABES showcase: real products, each card is one link to THAT product on abes.bio (new tab).
 * No cart, no "buy now". Mobile = accessible scroll-snap strip, >= md = grid. Empty list = plain CTA to the catalogue.
 */
export function AbesShowcase({ products, eyebrow, title, text, ctaLabel, cardCtaLabel, headingLevel = 2 }: AbesShowcaseProps) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const CardH = headingLevel === 2 ? "h3" : "h4";
  const cols = products.length === 3 || products.length === 6 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <section aria-labelledby="abes-showcase-title" className="relative isolate overflow-hidden bg-olive-deep py-16 text-paper on-dark sm:py-24">
      {/* Decorative: oversized outlined wordmark, purely ornamental */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 -z-10 select-none font-display text-[clamp(8rem,26vw,22rem)] font-semibold leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgb(169_179_138/0.16)]">
        ABES
      </span>
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            {eyebrow && <Eyebrow className="text-sage">{eyebrow}</Eyebrow>}
            <H id="abes-showcase-title" className="max-w-[18ch] text-[clamp(2.1rem,5.2vw,4rem)] font-medium leading-[1.04]">{title}</H>
          </div>
          <div className="space-y-6">
            {text && <p className="max-w-prose text-[1.05rem] leading-relaxed text-paper/85">{text}</p>}
            <div className="hidden lg:block">
              <ButtonLink href={paths.abesShop} variant="light" size="lg">
                {ctaLabel}
                <ArrowUpRight className="size-5" />
              </ButtonLink>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-12 sm:mt-16">
            <p className="mb-3 text-sm text-sage md:hidden" aria-hidden="true">Scorri per vedere tutti i prodotti →</p>
            <ul
              role="list"
              // Cards are links, so the scrollable strip is keyboard reachable (focus scrolls them into view).
              aria-label="Prodotti ABES"
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-1 [scrollbar-width:thin] sm:-mx-8 sm:px-8",
                "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0", cols,
              )}
            >
              {products.map((p, i) => (
                <li key={p.id} className="w-[72%] max-w-[19rem] shrink-0 snap-start scroll-ml-5 sm:scroll-ml-8 md:w-auto md:max-w-none">
                  <ProductCard p={p} index={i} cta={cardCtaLabel} Heading={CardH} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-10 max-w-prose text-paper/80">Il catalogo completo, con tutte le schede, prezzi e disponibilità aggiornati, è sul negozio ABES.</p>
        )}

        <div className={cn("mt-8 sm:mt-12", products.length > 0 && "lg:hidden", products.length === 0 && "")}>
          <ButtonLink href={paths.abesShop} variant="light" size="lg">
            {ctaLabel}
            <ArrowUpRight className="size-5" />
          </ButtonLink>
        </div>
        {products.length > 0 && (
          <p className="mt-6 hidden max-w-xl text-sm text-paper/70 lg:block">Prezzi, disponibilità, ordini e spedizioni sono gestiti da ABES: ogni scheda ti porta alla pagina del prodotto sul loro negozio.</p>
        )}
      </Container>
    </section>
  );
}
