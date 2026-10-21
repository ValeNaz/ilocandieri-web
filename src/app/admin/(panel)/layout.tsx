import { AdminShell } from "@/components/admin";
import { Icon } from "@/components/admin/icons";
import "@/components/admin/admin.css";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBadges } from "@/lib/dashboard/stats";
import { logoutAction } from "./actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Real guard (DB session). Every page, server action and route handler under /admin must ALSO call requireAdmin().
  const user = await requireAdmin();
  const badges = await getAdminBadges();
  return (
    <AdminShell
      userLabel={user.name || user.email}
      badges={badges}
      footer={
        <form action={logoutAction}>
          <button type="submit" title="Esci" className="adm-iconbtn"><Icon name="logout" /><span className="sr-only">Esci</span></button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
