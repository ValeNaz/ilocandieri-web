"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { destroyCurrentSession, getCurrentUser } from "@/lib/auth/session";
import { flash } from "@/lib/flash";
import { adminPaths } from "@/lib/paths";

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroyCurrentSession();
  if (user) await audit(user.id, "logout");
  await flash("info", "Hai effettuato l'uscita.");
  redirect(adminPaths.login);
}
