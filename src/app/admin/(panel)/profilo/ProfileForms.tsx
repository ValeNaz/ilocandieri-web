"use client";

import { useActionState } from "react";
import { SaveBar } from "@/components/admin";
import { Input } from "@/components/ui";
import { changePasswordAction, updateProfileAction } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
      <h2 className="font-display text-2xl">I tuoi dati</h2>
      <Input name="name" label="Nome" defaultValue={name} autoComplete="name" error={state?.fieldErrors?.name} />
      <Input name="email" label="Email di accesso" defaultValue={email} readOnly hint="Per cambiare email contatta chi gestisce il sito." />
      <SaveBar state={state} sticky={false} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="space-y-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
      <h2 className="font-display text-2xl">Cambia password</h2>
      <Input name="current" type="password" label="Password attuale" required autoComplete="current-password" error={state?.fieldErrors?.current} />
      <Input name="password" type="password" label="Nuova password" required minLength={10} autoComplete="new-password" hint="Almeno 10 caratteri." error={state?.fieldErrors?.password} />
      <Input name="confirm" type="password" label="Ripeti la nuova password" required autoComplete="new-password" error={state?.fieldErrors?.confirm} />
      <SaveBar state={state} label="Aggiorna password" sticky={false} />
    </form>
  );
}
