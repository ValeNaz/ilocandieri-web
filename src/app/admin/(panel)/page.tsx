import { AdminPlaceholder } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Dashboard" };

// Placeholder: CAREERS module builds the dashboard (counters).
export default async function DashboardPage() {
  const user = await requireAdmin();
  return <AdminPlaceholder title={`Ciao${user.name ? `, ${user.name}` : ""}`} description="Il riepilogo di eventi, iscrizioni, candidature e news." module="Dashboard" />;
}
