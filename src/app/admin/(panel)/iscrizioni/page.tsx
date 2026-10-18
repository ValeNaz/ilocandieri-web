import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Iscrizioni" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Iscrizioni" description="Le richieste di partecipazione agli eventi." module="EVENTS" />;
}
