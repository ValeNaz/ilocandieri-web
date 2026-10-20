import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";

export const alt = "I luoghi restituiti alla città.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return ogImage({ title: "I luoghi restituiti alla città.", kicker: "Luoghi" });
}
