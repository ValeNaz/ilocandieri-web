import type { Metadata } from "next";
import { PageView } from "@/components/public/blocks/PageView";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("shop", paths.shop);
}

export default function Page() {
  return <PageView pageKey="shop" />;
}
