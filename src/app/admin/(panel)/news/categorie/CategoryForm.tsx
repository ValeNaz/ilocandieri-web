"use client";

import { useActionState } from "react";
import { SaveBar } from "@/components/admin";
import { Input } from "@/components/ui";
import { createCategoryAction } from "../actions";

export function CategoryForm() {
  const [state, action] = useActionState(createCategoryAction, null);
  return (
    <form action={action} onReset={(e) => e.preventDefault()} className="space-y-4 rounded-card border border-line bg-card p-6 shadow-card">
      <h2 className="font-display text-xl">Nuova categoria</h2>
      <Input name="name" label="Nome" required maxLength={50} error={state?.fieldErrors?.name} hint="Es. Eventi, Progetti, Comunità." />
      <SaveBar state={state} label="Aggiungi" sticky={false} />
    </form>
  );
}
