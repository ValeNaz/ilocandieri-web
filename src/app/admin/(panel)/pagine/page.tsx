import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Pagine" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="Pagine" description="Chi siamo, Shop, Contatti, Privacy e Cookie Policy." module="CONTENT" />;
}
