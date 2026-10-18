import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Media" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Media" description="Le immagini caricate sul sito." module="CONTENT" />;
}
