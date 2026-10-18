import { z } from "zod";
import { normalizeAbesProductUrl, normalizeProductImageUrl } from "./url";

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === "1" || v === true, z.boolean());

export const productInputSchema = z.object({
  title: z.string().trim().min(2, "Inserisci il nome del prodotto.").max(160),
  url: z.string().trim().superRefine((v, ctx) => {
    const r = normalizeAbesProductUrl(v);
    if (!r.ok) ctx.addIssue({ code: "custom", message: r.error });
  }).transform((v) => {
    const r = normalizeAbesProductUrl(v);
    return r.ok ? r.url : v;
  }),
  /** Remote image URL (cdn.shopify.com). May be empty when a file is uploaded or an existing image is kept. */
  imageUrl: z.string().trim().max(600).optional().default(""),
  imageAlt: z.string().trim().max(200).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  priceText: z.string().trim().max(40).optional().default(""),
  /** yyyy-mm-dd of the last manual check of the price. */
  priceCheckedOn: z.string().trim().optional().default(""),
  visible: checkbox,
  featuredHome: checkbox,
});
export type ProductInput = z.infer<typeof productInputSchema>;

export function resolveImageUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  return normalizeProductImageUrl(raw);
}
