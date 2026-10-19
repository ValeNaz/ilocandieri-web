import { AdminShell } from "@/components/admin";
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
          <button type="submit" className="flex min-h-10 w-full items-center rounded-xl px-3 text-[0.95rem] hover:bg-paper-deep">Esci</button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
