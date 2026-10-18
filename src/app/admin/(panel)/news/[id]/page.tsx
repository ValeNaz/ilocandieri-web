import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, StatusBadge } from "@/components/admin";
import { ButtonLink, ConfirmDialog } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { getGalleryAdmin, getMedia, getNewsRow, listCategories, recentMedia } from "@/lib/news/admin";
import { isScheduled, toLocalDateTime } from "@/lib/news/core";
import { adminPaths, paths } from "@/lib/paths";
import { mediaUrl } from "@/lib/storage";
import { NewsForm } from "../NewsForm";
import { deleteNewsAction } from "../actions";

export const metadata = { title: "Modifica news" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const n = await getNewsRow(id);
  if (!n) notFound();
  const [cats, lib, gallery, cover, og] = await Promise.all([listCategories(), recentMedia(), getGalleryAdmin(id), getMedia(n.coverId), getMedia(n.ogImageId)]);
  const future = isScheduled(n);
  return (
    <div className="max-w-4xl">
      <PageHeader
        title={n.title}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <StatusBadge status={n.status} />
            {future && <span className="text-sm">Programmata: sarà visibile alla data indicata.</span>}
            {n.status === "published" && !future && <Link href={paths.newsItem(n.slug)} className="text-sm underline">Vedi sul sito</Link>}
          </span>
        }
        actions={
          <>
            <ButtonLink href={adminPaths.news} variant="ghost" size="sm">← Tutte le news</ButtonLink>
            <ConfirmDialog triggerLabel="Elimina" triggerVariant="secondary" title="Eliminare questa news?" description="L'articolo sparisce per sempre dal sito e dall'elenco. Le foto restano nella libreria. Se vuoi solo nasconderlo, usa «Ritira»." confirmLabel="Elimina" action={deleteNewsAction} fields={{ id }} />
          </>
        }
      />
      <NewsForm
        values={{
          id, status: n.status, title: n.title, slug: n.slug, excerpt: n.excerpt, body: n.body, categoryId: n.categoryId ?? "", featured: n.featured,
          publishedAtLocal: toLocalDateTime(n.publishedAt), seoTitle: n.seoTitle ?? "", seoDescription: n.seoDescription ?? "",
          cover: cover ? { id: cover.id, url: mediaUrl(cover.path), alt: cover.alt } : null,
          og: og ? { id: og.id, url: mediaUrl(og.path) } : null,
          gallery: gallery.map((g) => ({ id: g.id, url: mediaUrl(g.path), alt: g.alt, position: g.position })),
        }}
        categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        library={lib.map((m) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt }))}
      />
    </div>
  );
}
