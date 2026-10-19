import type { Metadata } from "next";
import { PageBlocks } from "@/components/public/blocks";
import { JsonLd } from "@/components/public/JsonLd";
import { getPageBlocks } from "@/lib/content/queries";
import { getSiteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { getSetting } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home", "/");
}

export default async function HomePage() {
  const [org, content] = await Promise.all([getSetting("org"), getPageBlocks("home")]);
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
      <PageBlocks content={content} />
    </>
  );
}
