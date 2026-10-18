"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Heading, Input } from "@/components/ui";
import { adminPaths } from "@/lib/paths";
import { forgotAction } from "./actions";

export default function ForgotPage() {
  const [state, action, pending] = useActionState(forgotAction, null);
  return (
    <>
      <Heading as="h1" size="lg">Recupera l&apos;accesso</Heading>
      <p className="mb-8 mt-3 text-ink-soft">Inserisci l&apos;email del tuo account: ti invieremo un link valido un&apos;ora per scegliere una nuova password.</p>
      {state?.ok ? (
        <p role="status" className="rounded-control border border-success/30 bg-success-soft px-4 py-3">{state.message}</p>
      ) : (
        <form action={action} className="space-y-5" noValidate>
          {state && !state.ok && <p role="alert" className="font-medium text-danger">{state.message}</p>}
          <Input name="email" type="email" label="Email" required autoComplete="username" autoFocus error={state?.fieldErrors?.email} />
          <Button type="submit" size="lg" pending={pending} className="w-full">Invia il link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link className="underline hover:text-terracotta-deep" href={adminPaths.login}>Torna all&apos;accesso</Link></p>
    </>
  );
}
