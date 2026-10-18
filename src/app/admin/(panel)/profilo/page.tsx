import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { PasswordForm, ProfileForm } from "./ProfileForms";

export const metadata = { title: "Profilo" };

export default async function ProfilePage() {
  const user = await requireAdmin();
  return (
    <>
      <PageHeader title="Il tuo profilo" description="Dati dell'account e sicurezza dell'accesso." />
      <div className="space-y-10">
        <ProfileForm name={user.name} email={user.email} />
        <PasswordForm />
      </div>
    </>
  );
}
