import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";

export const alt = "Il Giardino delle Arance.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ title: "Il Giardino delle Arance.", kicker: "Luoghi · Castelvetrano" });
}
