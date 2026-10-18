import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Prodotti ABES" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Prodotti ABES" description="I prodotti mostrati nella vetrina, con link allo shop ABES." module="ABES" />;
}
