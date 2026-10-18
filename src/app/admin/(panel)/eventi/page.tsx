import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Eventi" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Eventi" description="Eventi, moduli di iscrizione e regole di partecipazione." module="EVENTS" />;
}
