"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import type { ActionState } from "@/lib/actions";

/**
 * Like `useActionState`, but submits through a transition so React 19 does NOT reset the (uncontrolled) fields
 * after the action: when validation fails the editor keeps what they typed.
 */
export function useSafeForm(action: (prev: ActionState, fd: FormData) => Promise<ActionState>) {
  const [state, run] = useActionState<ActionState, FormData>(action, null);
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => run(fd));
  };
  return { state, onSubmit, pending };
}
