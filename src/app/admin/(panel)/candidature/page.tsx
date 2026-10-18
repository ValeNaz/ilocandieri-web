import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Candidature" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Candidature" description="Candidature ricevute e curriculum." module="CAREERS" />;
}
