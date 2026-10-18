import { PageEditor } from "@/components/admin/content/PageEditor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Home" };

export default async function Page() {
  await requireAdmin();
  return <PageEditor pageKey="home" title="Home" description="Testi, immagini, pulsanti, ordine e visibilità di ogni sezione della pagina iniziale. Eventi, news e prodotti da mostrare si scelgono nelle rispettive sezioni del pannello." />;
}
