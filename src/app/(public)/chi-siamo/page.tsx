import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/public/PlaceholderPage";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("chi-siamo", "/chi-siamo");
}

export default function Page() {
  return <PlaceholderPage title="Chi siamo" />;
}
