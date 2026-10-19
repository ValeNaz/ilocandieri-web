// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable (`id` is an optional addition).
import Image from "next/image";
import { ButtonLink, Container } from "@/components/ui";
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
  id?: string;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("size-4", className)}>
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
      className="group/card relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-card text-ink transition-[box-shadow,border-color] duration-300 ease-out-expo hover:border-line-strong/40 hover:shadow-pop"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={p.imageAlt}
            fill
            loading={index < 4 ? "eager" : "lazy"}
            sizes="(min-width:1024px) 22vw, (min-width:768px) 45vw, 72vw"
            className="object-contain p-4 transition-transform duration-500 ease-out-expo group-hover/card:scale-[1.04]"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center text-4xl font-semibold text-ink/20">ABES</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-5">
        {p.category && <p className="text-sm text-ink-soft">{p.category}</p>}
        <Heading className="text-[1.1rem] font-semibold leading-snug">{p.title}</Heading>
        {(p.priceText || p.available !== null) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {p.priceText && <span className="font-semibold">{p.priceText}</span>}
            {p.available === false && <span className="text-ink-soft">Al momento esaurito</span>}
            {p.available === true && <span className="text-olive-deep">Disponibile</span>}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[0.95rem] font-medium text-terracotta-deep">
          <span className="group-hover/card:underline group-hover/card:underline-offset-4">{cta}</span>
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
export function AbesShowcase({ products, eyebrow, title, text, ctaLabel, cardCtaLabel, headingLevel = 2, id }: AbesShowcaseProps) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const CardH = headingLevel === 2 ? "h3" : "h4";
  const cols = "lg:grid-cols-4";
  return (
    <section id={id} aria-labelledby="abes-showcase-title" className="bg-paper-deep">
      <Container wide className="py-20 sm:py-32">
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-16">
          <div className="rise lg:col-span-7">
            {eyebrow && <p className="stamp mb-4">{eyebrow}</p>}
            <H id="abes-showcase-title" className="max-w-[16ch] text-[clamp(2.1rem,4.4vw,3.8rem)] leading-[1.02] tracking-[-0.035em]">{title}</H>
          </div>
          <div className="space-y-6 lg:col-span-5">
            {text && <p className="max-w-prose text-lg leading-relaxed text-ink-soft">{text}</p>}
            <div className="hidden lg:block">
              <ButtonLink href={paths.abesShop} size="lg">
                {ctaLabel}
                <ArrowUpRight className="size-5" />
              </ButtonLink>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 sm:mt-14">
            <p className="mb-3 text-sm text-ink-soft md:hidden" aria-hidden="true">Scorri per vedere tutti i prodotti →</p>
            <ul
              role="list"
              // Cards are links, so the scrollable strip is keyboard reachable (focus scrolls them into view).
              aria-label="Prodotti ABES"
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-8 pt-2 [scrollbar-width:thin] sm:-mx-8 sm:px-8",
                "md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0", cols,
              )}
            >
              <li aria-hidden="true" className="hidden md:col-span-2 md:row-span-2 md:block">
                {/* eslint-disable-next-line @next/next/no-img-element -- static file in /public/foto */}
                <img src="/foto/ceci-juta.jpg" alt="" width={1600} height={900} loading="lazy" decoding="async" className="unveil size-full min-h-80 rounded-card object-cover" />
              </li>
              {products.map((p, i) => (
                <li key={p.id} className="w-[72%] max-w-[19rem] shrink-0 snap-start scroll-ml-5 sm:scroll-ml-8 md:w-auto md:max-w-none">
                  <ProductCard p={p} index={i} cta={cardCtaLabel} Heading={CardH} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-10 max-w-prose text-lg text-ink-soft">Il catalogo completo, con tutte le schede, prezzi e disponibilità aggiornati, è sul negozio ABES.</p>
        )}

        <div className={cn("mt-8 sm:mt-12", products.length > 0 && "lg:hidden")}>
          <ButtonLink href={paths.abesShop} size="lg">
            {ctaLabel}
            <ArrowUpRight className="size-5" />
          </ButtonLink>
        </div>
        {products.length > 0 && (
          <p className="mt-8 hidden max-w-xl text-sm text-ink-soft lg:block">Prezzi, disponibilità, ordini e spedizioni sono gestiti da ABES: ogni scheda ti porta alla pagina del prodotto sul loro negozio.</p>
        )}
      </Container>
    </section>
  );
}
