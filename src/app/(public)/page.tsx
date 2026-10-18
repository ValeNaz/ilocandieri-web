import type { Metadata } from "next";
import { PageView } from "@/components/public/blocks/PageView";
import { JsonLd } from "@/components/public/JsonLd";
import { getSiteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { getSetting } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home", "/");
}

export default async function HomePage() {
  const org = await getSetting("org");
  const url = getSiteUrl();
  const sameAs = Object.values(org.social).filter(Boolean);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url,
    ...(org.phone ? { telephone: org.phone } : {}),
    ...(org.email ? { email: org.email } : {}),
    ...(org.address ? { address: org.address } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <>
      <JsonLd data={ld} />
      <PageView pageKey="home" />
    </>
  );
}
