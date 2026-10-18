import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max, `Massimo ${max} caratteri.`).optional().default("");

export const newsInputSchema = z.object({
  title: z.string().trim().min(3, "Scrivi un titolo (almeno 3 caratteri).").max(160, "Massimo 160 caratteri."),
  slug: optionalText(80),
  excerpt: optionalText(400),
  body: z.string().max(200_000, "Il testo è troppo lungo.").optional().default(""),
  categoryId: optionalText(40),
  featured: z.preprocess((v) => v === "on" || v === "true" || v === "1", z.boolean()),
  publishedAtLocal: optionalText(20),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  coverAlt: optionalText(200),
  intent: z.enum(["save", "publish", "unpublish"]).optional().default("save"),
});
export type NewsInput = z.infer<typeof newsInputSchema>;

export const categoryNameSchema = z.string().trim().min(2, "Almeno 2 caratteri.").max(50, "Massimo 50 caratteri.");
