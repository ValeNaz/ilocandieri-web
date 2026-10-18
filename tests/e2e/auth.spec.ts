import { expect, test } from "@playwright/test";

import { adminEmail as email, adminPassword as password } from "./helpers";

test("unauthenticated /admin redirects to login (and keeps noindex)", async ({ page, request }) => {
  const res = await request.get("/admin/candidature", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/admin/login");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Accedi al pannello" })).toBeVisible();
});

test("wrong credentials show a generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page.getByText("Email o password non corrette.")).toBeVisible();
});

test("login, navigate panel, logout", async ({ page }) => {
  await page.goto("/admin/candidature");
  await expect(page).toHaveURL(/next=%2Fadmin%2Fcandidature/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(/\/admin\/candidature$/);
  await expect(page.getByRole("heading", { level: 1, name: "Candidature" })).toBeVisible();
  for (const label of ["Dashboard", "Home", "Pagine", "Media", "Prodotti ABES", "News", "Eventi", "Iscrizioni", "Candidature", "Messaggi contatti", "Email", "Impostazioni"]) {
    await expect(page.getByRole("navigation", { name: "Navigazione pannello" }).getByRole("link", { name: new RegExp(`^${label}`) })).toBeVisible();
  }
  await page.getByRole("link", { name: /^Profilo/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Il tuo profilo" })).toBeVisible();
  await page.getByRole("button", { name: "Esci" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("public site renders with nav, footer contacts and 404", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigazione principale" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("+39 331 8586827");
  const res = await page.goto("/pagina-che-non-esiste");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Questa strada");
  expect((await page.goto("/eventi/non-esiste"))?.status()).toBe(404);
});

test("media route: no traversal, no private files", async ({ request }) => {
  expect((await request.get("/media/..%2f..%2fprivate%2fx.pdf")).status()).toBe(404);
  expect((await request.get("/media/nope.jpg")).status()).toBe(404);
});
