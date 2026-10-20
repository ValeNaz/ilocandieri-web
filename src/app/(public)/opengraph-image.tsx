import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";

export const alt = "I Locandieri, cooperativa sociale di Castelvetrano";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ title: "Luoghi che tornano a vivere." });
}
