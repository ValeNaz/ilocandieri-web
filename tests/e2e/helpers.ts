import { expect, type Cookie, type Page } from "@playwright/test";

export const adminEmail = "admin@example.test";
export const adminPassword = "e2e-Password-123!";

// The login endpoint is rate limited per IP (15 / 15 min). The whole suite signs in many times,
// so the first real login is cached and later calls reuse the session cookie (falling back to a
// real login if it was invalidated, e.g. after a logout test).
let cached: Cookie[] | null = null;

export async function login(page: Page, next = "/admin") {
  const nextRe = new RegExp(next.replace(/[/?=.&]/g, "\\$&") + "$");
  if (cached) {
    await page.context().addCookies(cached);
    await page.goto(next);
    if (nextRe.test(page.url())) return;
    await page.context().clearCookies();
  }
  await page.goto(`/admin/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(nextRe);
  cached = (await page.context().cookies()).filter((c) => c.name === "il_session");
}
