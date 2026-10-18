import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/public/PlaceholderPage";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home", "/");
}

export default function HomePage() {
  return <PlaceholderPage title="I Locandieri" />;
}
