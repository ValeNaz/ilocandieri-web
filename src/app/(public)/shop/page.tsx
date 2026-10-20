import type { Metadata } from "next";
import "@/app/(public)/abes/abes.css";
import { PageView } from "@/components/public/blocks/PageView";
import { ShopClosing } from "@/components/public/blocks/slots/shop";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("shop", paths.shop);
}

export default function Page() {
  return <PageView pageKey="shop" after={<ShopClosing />} />;
}
