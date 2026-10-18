// INTERFACE CONTRACT (owner: ABES+NEWS agent). Props must stay stable; implementation will be replaced.
import type { ShowcaseProduct } from "@/lib/abes/public";

export type AbesShowcaseProps = {
  products: ShowcaseProduct[];
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string; // global CTA -> https://abes.bio/collections/all
  cardCtaLabel: string; // "Scopri il prodotto"
  headingLevel?: 2 | 3;
};

export function AbesShowcase(_props: AbesShowcaseProps) {
  return null;
}
