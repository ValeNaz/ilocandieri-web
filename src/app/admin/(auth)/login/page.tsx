import { redirect } from "next/navigation";
import { Heading } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { adminPaths } from "@/lib/paths";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Accedi" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect(adminPaths.dashboard);
  const { next } = await searchParams;
  return (
    <>
      <Heading as="h1" size="lg">Accedi al pannello</Heading>
      <p className="mb-8 mt-3 text-ink-soft">Area riservata a chi gestisce i contenuti del sito.</p>
      <LoginForm next={next} />
    </>
  );
}
