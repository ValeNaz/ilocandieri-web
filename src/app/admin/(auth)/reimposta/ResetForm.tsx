"use client";

import { useActionState } from "react";
import { Button, Input } from "@/components/ui";
import { resetAction } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetAction, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {state && !state.ok && state.message && <p role="alert" className="font-medium text-danger">{state.message}</p>}
      <Input name="password" type="password" label="Nuova password" required autoComplete="new-password" minLength={10} autoFocus error={state?.fieldErrors?.password} />
      <Input name="confirm" type="password" label="Ripeti la password" required autoComplete="new-password" error={state?.fieldErrors?.confirm} />
      <Button type="submit" size="lg" pending={pending} className="w-full">Salva la password</Button>
    </form>
  );
}
