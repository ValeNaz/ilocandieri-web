import { createClient } from "@libsql/client";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const email = "admin@example.test";
const password = "e2e-Password-123!";
const SHOTS = process.env.SHOTS_DIR;
const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\n"), Buffer.alloc(300, 0x20), Buffer.from("\n%%EOF")]);

async function login(page: Page, next = "/admin") {
  await page.goto(`/admin/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/\//g, "\\/") + "$"));
}

async function shot(page: Page, name: string) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

test.describe.serial("careers flow", () => {
  let cvPath = "";

  // Dev server compiles pages lazily and Fast Refresh re-renders the form (new timing token) mid-test: warm up first.
  test.beforeAll(async ({ request }) => {
    for (const u of ["/lavora-con-noi", "/admin/login"]) await request.get(u);
  });

  test("public page: empty state, validation errors, then a real application with CV", async ({ page }) => {
    await page.goto("/lavora-con-noi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Le persone fanno la differenza");
    await expect(page.getByText("Non ci sono posizioni aperte al momento. Puoi comunque inviarci una candidatura spontanea.")).toBeVisible();
    await shot(page, "lavora-desktop-1");

    // Fake file renamed .pdf is refused with a clear message
    await page.getByLabel(/^Nome/).fill("Ada");
    await page.getByLabel(/^Cognome/).fill("Lovelace");
    await page.getByLabel(/^Email/).fill("ada@example.test");
    await page.getByLabel(/^Ambito/).selectOption("Accoglienza");
    await page.getByLabel(/^Messaggio/).fill("Ho esperienza in accoglienza e vorrei collaborare con voi.");
    await page.getByLabel(/^Curriculum/).setInputFiles({ name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("MZ this is not a pdf at all") });
    await page.getByRole("checkbox").check();
    await page.waitForTimeout(3300); // minimum human time enforced by the form token
    await page.getByRole("button", { name: "Invia la candidatura" }).click();
    await expect(page.getByText("Formato non supportato. Usa PDF, DOC o DOCX.")).toBeVisible();
    await expect(page.getByLabel(/^Nome/)).toHaveValue("Ada"); // values survive the error

    // Missing privacy -> clear error
    await page.getByLabel(/^Curriculum/).setInputFiles({ name: "Il mio CV.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.getByRole("checkbox").uncheck();
    await page.getByRole("button", { name: "Invia la candidatura" }).click();
    await expect(page.getByText("Per inviare la candidatura devi confermare di aver letto l'informativa privacy.")).toBeVisible();
    await shot(page, "lavora-desktop-errors");

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Invia la candidatura" }).click();
    await expect(page.getByText("Grazie per averci contattato. La tua candidatura è stata ricevuta correttamente. Potremo ricontattarti qualora emergessero opportunità coerenti con il tuo profilo.")).toBeVisible();
    await shot(page, "lavora-desktop-success");
  });

  test("admin sees it; CV download works only when authenticated", async ({ page, request }) => {
    await login(page, "/admin/candidature");
    await expect(page.getByRole("link", { name: /Ada Lovelace/ })).toBeVisible();
    await shot(page, "admin-candidature");
    await page.getByRole("link", { name: /Ada Lovelace/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeVisible();
    await shot(page, "admin-candidatura-dettaglio");
    const href = await page.getByRole("link", { name: "Scarica il CV" }).getAttribute("href");
    expect(href).toMatch(/^\/admin\/candidature\/[^/]+\/cv$/);

    const ok = await page.request.get(href!);
    expect(ok.status()).toBe(200);
    expect(ok.headers()["content-disposition"]).toMatch(/^attachment; filename="Il mio CV\.pdf"/);
    expect(ok.headers()["cache-control"]).toContain("no-store");
    expect(ok.headers()["content-type"]).toBe("application/pdf");
    expect((await ok.body()).subarray(0, 5).toString()).toBe("%PDF-");

    // Anonymous: redirected to login (proxy) or 401, never the file
    const anon = await request.get(href!, { maxRedirects: 0 });
    expect([307, 401]).toContain(anon.status());
    expect(anon.headers()["content-type"] ?? "").not.toContain("pdf");

    // Private storage is not reachable from the public site
    const db = createClient({ url: "file:./data/careers-e2e.db" });
    const r = await db.execute("select cv_path from applications limit 1");
    cvPath = String(r.rows[0]!.cv_path);
    db.close();
    expect(cvPath).toMatch(/\.pdf$/);
    for (const u of [`/media/${cvPath}`, `/storage/private/${cvPath}`, `/private/${cvPath}`, `/${cvPath}`]) {
      const res = await request.get(u, { maxRedirects: 0 });
      expect(res.status(), u).toBe(404);
    }
  });

  test("status change, outbox, dashboard and delete", async ({ page }) => {
    await login(page, "/admin/candidature");
    await page.getByRole("link", { name: /Ada Lovelace/ }).click();
    await page.getByRole("button", { name: "Metti in esame" }).click();
    await expect(page.getByText("Stato aggiornato.")).toBeVisible();
    await expect(page.getByText("In esame").first()).toBeVisible();
    await page.goto("/admin/candidature?stato=reviewing");
    await expect(page.getByRole("link", { name: /Ada Lovelace/ })).toBeVisible();
    await page.goto("/admin/candidature?stato=archived");
    await expect(page.getByText("Nessuna candidatura corrisponde ai filtri")).toBeVisible();

    // Emails land in the outbox as not_configured (no SMTP), banner visible
    await page.goto("/admin/email/invii");
    await expect(page.getByText("SMTP non configurato: le email non vengono inviate.")).toBeVisible();
    await expect(page.getByText("Abbiamo ricevuto la tua candidatura")).toBeVisible();
    await page.getByRole("link", { name: "Abbiamo ricevuto la tua candidatura" }).click();
    await expect(page.getByText("Per tutelare la privacy il testo del messaggio non viene mostrato qui.")).toBeVisible();
    await page.getByRole("button", { name: "Riprova" }).click();
    await expect(page.getByText("SMTP non configurato: l'email non è stata inviata.")).toBeVisible();
    await shot(page, "admin-email-invii");

    // Dashboard
    await page.goto("/admin");
    const card = page.getByRole("link", { name: /Candidature nuove/ });
    await expect(card).toBeVisible(); // now 0: reviewing
    await expect(page.getByText("Da configurare").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nuovo evento" })).toBeVisible();
    await shot(page, "admin-dashboard");

    // Delete with confirmation
    await page.goto("/admin/candidature");
    await page.getByRole("link", { name: /Ada Lovelace/ }).click();
    await page.getByRole("button", { name: "Elimina" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Elimina definitivamente" }).click();
    await expect(page.getByText("Candidatura e CV eliminati.")).toBeVisible();
    await expect(page.getByText("Ancora nessuna candidatura")).toBeVisible();
    const gone = await page.request.get(`/admin/candidature/${(await page.url()).split("/").pop()}/cv`);
    expect([401, 404]).toContain(gone.status());
  });

  test("email templates: edit, preview, restore", async ({ page }) => {
    await login(page, "/admin/email");
    await expect(page.getByRole("link", { name: "Candidatura: conferma a chi si candida" })).toBeVisible();
    await page.getByRole("link", { name: "Candidatura: conferma a chi si candida" }).click();
    await expect(page.getByText("{{candidato.nome}}").first()).toBeVisible();
    await page.getByLabel(/^Oggetto/).fill("Candidatura ricevuta, grazie");
    await page.getByRole("button", { name: "Anteprima" }).click();
    await expect(page.getByText("[candidato.nome]").first()).toBeVisible();
    await page.getByRole("button", { name: "Salva" }).click();
    await expect(page.getByText("Modello salvato.")).toBeVisible();
    await page.getByRole("button", { name: "Ripristina il testo originale" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Ripristina" }).click();
    await expect(page.getByText("Testo originale ripristinato.")).toBeVisible();
    await expect(page.getByLabel(/^Oggetto/)).toHaveValue("Abbiamo ricevuto la tua candidatura");
  });

  test("retention and openings", async ({ page }) => {
    await login(page, "/admin/candidature");
    await page.getByLabel("Giorni di conservazione delle candidature").fill("30");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByText("Tempi di conservazione salvati.")).toBeVisible();
    await page.goto("/admin/candidature/posizioni");
    const form = page.locator("form").filter({ hasText: "Aggiungi posizione" });
    await form.getByLabel(/^Titolo/).fill("Educatore/educatrice");
    await form.getByLabel(/^Stato/).selectOption("open");
    await form.getByRole("button", { name: "Aggiungi posizione" }).click();
    await expect(page.getByText("Posizione salvata.")).toBeVisible();
    await page.goto("/lavora-con-noi");
    await expect(page.getByRole("heading", { name: "Educatore/educatrice" })).toBeVisible();
    await expect(page.getByText("Non ci sono posizioni aperte al momento.")).toHaveCount(0);
    await shot(page, "lavora-desktop-openings");
  });

  test("mobile screenshots", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("/lavora-con-noi");
    await shot(page, "lavora-mobile");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.goto(`/admin/login?next=${encodeURIComponent("/admin")}`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Accedi" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await shot(page, "admin-dashboard-mobile");
    await ctx.close();
  });
});
