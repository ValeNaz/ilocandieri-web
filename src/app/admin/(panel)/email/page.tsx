import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Email" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Email" description="Modelli dei messaggi automatici e registro degli invii." module="CAREERS" />;
}
