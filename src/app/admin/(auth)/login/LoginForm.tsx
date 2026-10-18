"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Input } from "@/components/ui";
import { adminPaths } from "@/lib/paths";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state && !state.ok && state.message && (
        <p role="alert" className="rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-[0.95rem] font-medium text-danger">{state.message}</p>
      )}
      <Input name="email" type="email" label="Email" required autoComplete="username" autoFocus error={state?.fieldErrors?.email} />
      <Input name="password" type="password" label="Password" required autoComplete="current-password" error={state?.fieldErrors?.password} />
      <Button type="submit" size="lg" pending={pending} className="w-full">Accedi</Button>
      <p className="text-center text-sm"><Link className="underline hover:text-terracotta-deep" href={adminPaths.forgot}>Hai dimenticato la password?</Link></p>
    </form>
  );
}
