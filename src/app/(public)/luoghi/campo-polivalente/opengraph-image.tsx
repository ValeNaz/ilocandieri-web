import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";

export const alt = "Il Campo Polivalente Unità d'Italia.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ title: "Il Campo Polivalente Unità d'Italia.", kicker: "Luoghi · Castelvetrano" });
}
