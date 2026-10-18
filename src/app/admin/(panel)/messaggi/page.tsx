import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Messaggi contatti" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Messaggi contatti" description="Messaggi arrivati dal modulo contatti." module="CONTENT" />;
}
