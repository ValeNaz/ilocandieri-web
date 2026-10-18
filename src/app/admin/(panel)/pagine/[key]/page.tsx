import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/content/PageEditor";
import { requireAdmin } from "@/lib/auth/session";
import { isPageKey } from "@/lib/content/blocks";

const TITLES: Record<string, string> = {
  "chi-siamo": "Chi siamo", shop: "Shop ABES", contatti: "Contatti", privacy: "Privacy", cookie: "Cookie Policy",
  eventi: "Eventi: testi della pagina", news: "News: testi della pagina", "lavora-con-noi": "Lavora con noi: testi della pagina", home: "Home",
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return { title: TITLES[key] ?? "Pagina" };
}

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin();
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  return <PageEditor pageKey={key} title={TITLES[key]!} description="Modifica testi, immagini e pulsanti di ogni sezione." />;
}
