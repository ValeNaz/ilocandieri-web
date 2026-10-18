import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Home" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Home" description="Testi, immagini e sezioni della pagina iniziale." module="CONTENT" />;
}
