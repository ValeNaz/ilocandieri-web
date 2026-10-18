import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "News" };

export default async function Page() {
  await requireAdmin();
  return <AdminPlaceholder title="News" description="Articoli e novità del sito." module="NEWS" />;
}
