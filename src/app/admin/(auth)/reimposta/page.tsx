import Link from "next/link";
import { Heading } from "@/components/ui";
import { isResetTokenValid } from "@/lib/auth/reset";
import { adminPaths } from "@/lib/paths";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Nuova password" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = token ? await isResetTokenValid(token) : false;
  if (!token || !valid) {
    return (
      <>
        <Heading as="h1" size="lg">Link non valido</Heading>
        <p className="mb-6 mt-3 text-ink-soft">Il link è scaduto o è già stato usato. Richiedine uno nuovo.</p>
        <Link className="underline hover:text-terracotta-deep" href={adminPaths.forgot}>Richiedi un nuovo link</Link>
      </>
    );
  }
  return (
    <>
      <Heading as="h1" size="lg">Scegli una nuova password</Heading>
      <p className="mb-8 mt-3 text-ink-soft">Almeno 10 caratteri. Dopo il salvataggio dovrai accedere di nuovo.</p>
      <ResetForm token={token} />
    </>
  );
}
