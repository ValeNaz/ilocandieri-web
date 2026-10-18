import { cookies } from "next/headers";

export type FlashType = "success" | "error" | "info";
export const FLASH_COOKIE = "il_flash";

/**
 * Queue a one-shot toast for the NEXT page render. Call in a server action right before `redirect()`:
 *   await flash("success", "Evento salvato."); redirect(adminPaths.events);
 * The <FlashReader /> client component (mounted in the root layout) shows it and deletes the cookie.
 * Messages must never contain personal data.
 */
export async function flash(type: FlashType, message: string): Promise<void> {
  (await cookies()).set(FLASH_COOKIE, encodeURIComponent(JSON.stringify({ type, message })), {
    path: "/",
    maxAge: 30,
    sameSite: "lax",
    httpOnly: false,
  });
}
