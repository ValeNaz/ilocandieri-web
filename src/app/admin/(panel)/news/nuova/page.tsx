import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories, recentMedia } from "@/lib/news/admin";
import { mediaUrl } from "@/lib/storage";
import { NewsForm } from "../NewsForm";

export const metadata = { title: "Nuova news" };

export default async function NewNewsPage() {
  await requireAdmin();
  const [cats, lib] = await Promise.all([listCategories(), recentMedia()]);
  return (
    <div className="max-w-4xl">
      <PageHeader title="Nuova news" description="Si salva come bozza: sul sito non compare finché non premi «Pubblica»." />
      <NewsForm
        values={{ status: "draft", title: "", slug: "", excerpt: "", body: "", categoryId: "", featured: false, publishedAtLocal: "", seoTitle: "", seoDescription: "", cover: null, og: null, gallery: [] }}
        categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        library={lib.map((m) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt }))}
      />
    </div>
  );
}
