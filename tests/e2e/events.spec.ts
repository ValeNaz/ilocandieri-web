import { expect, test } from "@playwright/test";
import { login } from "./helpers";


test.describe.configure({ mode: "serial" });
test.setTimeout(90_000);

const stamp = Date.now().toString(36);
const title = `Cena di prova ${stamp}`;
let slug = "";

test("admin creates an event with a custom form, visitor registers, admin approves", async ({ page, browser }) => {
  await login(page);

  // ---- create event with a custom form (approval, 5 seats)
  await page.goto("/admin/eventi/nuovo");
  await page.locator("[name=title]").fill(title);
  await page.getByLabel("Inizio").fill("2030-05-10T18:00");
  await page.getByLabel("Luogo").fill("Castelvetrano");
  await page.locator("[name=status]").selectOption("published");
  await page.getByLabel("Cosa possono fare i visitatori?").selectOption("registration");
  await page.locator("[name=registrationMode]").selectOption("approval");
  await page.getByLabel("Capienza (facoltativa)").fill("5");
  // form builder: add a required select field
  await page.getByLabel("Aggiungi un campo").selectOption("select");
  await page.getByRole("button", { name: "Aggiungi campo" }).click();
  const labelInputs = page.getByLabel("Etichetta", { exact: true });
  await labelInputs.last().fill("Gruppo di provenienza");
  await page.getByLabel(/Opzioni/).fill("Scuola\nAssociazione\nAltro");
  await page.getByLabel(/Campo obbligatorio/).last().check();
  await page.getByRole("button", { name: "Crea evento" }).click();

  await expect(page).toHaveURL(/\/admin\/eventi\/[a-z0-9]{20,}$/);
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  slug = (await page.getByLabel("Indirizzo della pagina").inputValue()).trim();
  expect(slug).toContain("cena-di-prova");

  // ---- the visitor registers (new anonymous context)
  const ctx = await browser.newContext();
  const pub = await ctx.newPage();
  await pub.goto(`/eventi/${slug}`);
  await expect(pub.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await expect(pub.getByText("La partecipazione è soggetta a conferma dell'organizzazione.")).toBeVisible();
  await pub.waitForTimeout(3300); // minimum human time enforced server side
  await pub.getByLabel("Nome e cognome").fill("Maria Rossi");
  await pub.locator("[name=email]").fill(`maria.${stamp}@example.test`);
  await pub.getByLabel("Gruppo di provenienza").selectOption("Associazione");
  await pub.getByLabel(/Ho letto/).check();
  await pub.getByRole("button", { name: "Richiedi iscrizione" }).click();
  await expect(pub.getByText("Abbiamo ricevuto la tua richiesta. La partecipazione non è ancora confermata.")).toBeVisible();
  await expect(pub.getByText(/iscrizione è confermata/)).toHaveCount(0);

  // a second submit of the same person is refused (no duplicates)
  await pub.goto(`/eventi/${slug}`);
  await pub.waitForTimeout(3300);
  await pub.getByLabel("Nome e cognome").fill("Maria Rossi");
  await pub.locator("[name=email]").fill(`MARIA.${stamp}@example.test`);
  await pub.getByLabel("Gruppo di provenienza").selectOption("Altro");
  await pub.getByLabel(/Ho letto/).check();
  await pub.getByRole("button", { name: "Richiedi iscrizione" }).click();
  await expect(pub.getByText("risulta già una richiesta")).toBeVisible();
  await ctx.close();

  // ---- admin sees it, with the snapshot answers, and approves it
  await page.goto("/admin/iscrizioni");
  const row = page.getByRole("row", { name: new RegExp(`Maria Rossi.*${title}`) });
  await expect(row).toBeVisible();
  await expect(row.getByText("In attesa")).toBeVisible();
  await row.getByRole("link", { name: /Dettaglio/ }).click();
  await expect(page.getByText("Gruppo di provenienza")).toBeVisible();
  await expect(page.getByText("Associazione", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Approva" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Approva" }).click();
  await expect(page.getByText("Richiesta approvata")).toBeVisible();
  await expect(page.getByText("Confermata").first()).toBeVisible();

  // counters reflect the approval
  await page.goto("/admin/eventi");
  await expect(page.getByRole("row", { name: new RegExp(title) }).getByText(/1.*confermati.*su.*5/)).toBeVisible();
});

test("hidden events are not public; closing registrations is reflected on the page", async ({ page, browser }) => {
  await login(page);
  await page.goto("/admin/eventi");
  const row = page.getByRole("row", { name: new RegExp(title) });
  await row.getByRole("button", { name: "Chiudi iscrizioni" }).click();
  await expect(page.getByText("Iscrizioni chiuse.")).toBeVisible();

  const ctx = await browser.newContext();
  const pub = await ctx.newPage();
  await pub.goto(`/eventi/${slug}`);
  await expect(pub.getByText("Le iscrizioni a questo evento sono terminate.").first()).toBeVisible();
  await expect(pub.getByRole("button", { name: "Richiedi iscrizione" })).toHaveCount(0);

  await page.goto("/admin/eventi");
  await page.getByRole("row", { name: new RegExp(title) }).getByRole("button", { name: "Nascondi" }).click();
  await expect(page.getByText("Evento nascosto")).toBeVisible();
  const res = await pub.goto(`/eventi/${slug}`);
  expect(res?.status()).toBe(404);
  const list = await pub.goto("/eventi");
  expect(list?.status()).toBe(200);
  await expect(pub.getByText(title)).toHaveCount(0);
  await ctx.close();
});

test("admin events area requires login", async ({ request }) => {
  for (const path of ["/admin/eventi", "/admin/iscrizioni", "/admin/iscrizioni/export"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
  }
});
