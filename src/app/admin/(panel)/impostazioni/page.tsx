import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Impostazioni" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Impostazioni" description="Recapiti, notifiche, analisi e SEO." module="CONTENT" />;
}
