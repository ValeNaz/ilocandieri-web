import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/public/news/NewsArticle";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getNewsRow } from "@/lib/news/admin";
import { toArticle } from "@/lib/news/public";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Anteprima news", ...noIndex };

/** Draft/scheduled preview. Only reachable by an authenticated admin (requireAdmin); never indexed. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const row = await getNewsRow(id);
  if (!row) notFound();
  const article = await toArticle(row);
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      <div role="status" className="flex flex-wrap items-center justify-center gap-3 bg-ink px-4 py-3 text-center text-sm text-paper">
        <Badge tone="warning">Anteprima</Badge>
        {row.status === "draft" ? "Questa è una bozza: i visitatori non la vedono." : "Così appare la versione salvata."}
      </div>
      <NewsArticle article={article} related={[]} />
    </div>
  );
}
