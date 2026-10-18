import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

// Nothing under /admin is ever indexable (also enforced by robots.txt and the X-Robots-Tag header in proxy.ts).
export const metadata: Metadata = { ...noIndex, title: { default: "Pannello", template: "%s · Pannello I Locandieri" } };
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
