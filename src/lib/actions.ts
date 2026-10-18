import type { ZodError } from "zod";

/** Shape returned by server actions used with `useActionState`. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
} | null;

export const actionOk = (message = "Salvato."): ActionState => ({ ok: true, message });
export const actionError = (message: string, fieldErrors?: Record<string, string>): ActionState => ({ ok: false, message, fieldErrors });

/** First Zod issue per field -> { field: message } */
export function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
