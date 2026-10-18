import { AdminShell } from "@/components/admin";
import { Button } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { logoutAction } from "./actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Real guard (DB session). Every page, server action and route handler under /admin must ALSO call requireAdmin().
  const user = await requireAdmin();
  return (
    <AdminShell
      userLabel={user.name || user.email}
      footer={
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start rounded-xl px-3 text-[0.95rem]">Esci</Button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
