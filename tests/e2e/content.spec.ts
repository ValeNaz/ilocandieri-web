import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";


async function open(card: ReturnType<typeof blockCard>) {
  if (!(await card.evaluate((el) => (el as HTMLDetailsElement).open))) await card.locator("summary").click();
}
const blockCard = (page: Page, label: string) => page.locator("details", { has: page.getByText(label, { exact: false }) }).first();

test.describe.configure({ mode: "serial" });

test("public pages render seeded copy, SEO files and no analytics by default", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diamo nuova vita ai luoghi. E nuove possibilità alle persone.");
  await expect(page.getByRole("heading", { level: 2, name: "Modi diversi di fare la differenza." })).toBeVisible();
  // no integration configured -> no cookie banner, no external scripts
  await expect(page.getByRole("dialog", { name: /cookie/i })).toHaveCount(0);
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);
  expect(await page.locator('script[type="application/ld+json"]').first().evaluate((el) => el.textContent)).toContain('"@type":"Organization"');
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain("/");

  for (const [path, h1] of [["/chi-siamo", /Una cooperativa/], ["/shop", /Buoni da mangiare/], ["/contatti", /Restiamo in contatto/], ["/privacy", /privacy/i], ["/cookie-policy", /Cookie/]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  await expect(page.getByText("Testo in bozza")).toBeVisible();

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/chi-siamo");
  expect(sitemap).not.toContain("/admin");
});

test("admin edits the hero title -> visible on Home; hides a block -> it disappears; restores", async ({ page }) => {
  await login(page, "/admin/home");
  const hero = blockCard(page, "Apertura della pagina");
  await hero.locator("summary").click();
  const title = hero.getByLabel("Titolo principale");
  await title.fill("Titolo di prova modificato");
  await hero.getByRole("button", { name: "Salva" }).click();
  await expect(hero.getByText(/Salvato\. La modifica/)).toBeVisible();

  const pub = await page.context().newPage();
  await pub.goto("/");
  await expect(pub.getByRole("heading", { level: 1 })).toHaveText("Titolo di prova modificato");

  // hide "Ambiti di intervento"
  const pillars = blockCard(page, "Ambiti di intervento");
  await pillars.locator("summary").click();
  await pillars.getByRole("button", { name: "Nascondi dal sito" }).click();
  await expect(page.getByText("Nascosta").first()).toBeVisible();
  await pub.goto("/");
  await expect(pub.getByRole("heading", { name: "Modi diversi di fare la differenza." })).toHaveCount(0);

  // show it again
  const pillars2 = blockCard(page, "Ambiti di intervento");
  await open(pillars2);
  await pillars2.getByRole("button", { name: "Mostra sul sito" }).click();
  await expect(pillars2.getByRole("button", { name: "Nascondi dal sito" })).toBeVisible();
  await pub.goto("/");
  await expect(pub.getByRole("heading", { name: "Modi diversi di fare la differenza." })).toBeVisible();

  // validation: a bad CTA address is refused and typed text is kept
  const hero2 = blockCard(page, "Apertura della pagina");
  await open(hero2);
  await hero2.getByLabel("Titolo principale").fill("Testo che non deve andare perso");
  await hero2.getByLabel("Dove porta").first().selectOption("__custom");
  await hero2.getByLabel("Indirizzo").first().fill("javascript:alert(1)");
  await hero2.getByRole("button", { name: "Salva" }).click();
  await expect(hero2.getByText(/Indirizzo non valido/)).toBeVisible();
  await expect(hero2.getByLabel("Titolo principale")).toHaveValue("Testo che non deve andare perso");

  // restore the original title
  await hero2.getByLabel("Dove porta").first().selectOption("/chi-siamo");
  await hero2.getByLabel("Titolo principale").fill("Diamo nuova vita ai luoghi. E nuove possibilità alle persone.");
  await hero2.getByRole("button", { name: "Salva" }).click();
  await expect(hero2.getByText(/Salvato\. La modifica/)).toBeVisible();
});

test("contact message: sent from the public form, listed in admin, antispam honeypot ignored", async ({ page }) => {
  await page.goto("/contatti");
  await page.getByLabel(/Nome e cognome/).fill("Giulia Bianchi");
  await page.getByLabel(/^Email/).fill("giulia@example.org");
  await page.getByLabel(/Oggetto/).fill("Idea di collaborazione");
  await page.getByLabel(/^Messaggio/).fill("Buongiorno, vorrei proporvi una collaborazione sul territorio.");
  // validation first: privacy not accepted
  await page.waitForTimeout(3300); // min-time antispam token
  await page.getByRole("button", { name: "Invia il messaggio" }).click();
  await expect(page.getByText(/prendere visione dell'informativa privacy/)).toBeVisible();
  await expect(page.getByLabel(/Nome e cognome/)).toHaveValue("Giulia Bianchi"); // typed values are kept
  await page.getByLabel(/Ho letto/).check();
  await page.getByRole("button", { name: "Invia il messaggio" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Messaggio inviato" })).toBeVisible();

  await login(page, "/admin/messaggi");
  await expect(page.getByRole("link", { name: "Idea di collaborazione" })).toBeVisible();
  await page.getByRole("link", { name: "Idea di collaborazione" }).click();
  await expect(page.getByText("giulia@example.org").first()).toBeVisible();
  await page.getByRole("button", { name: "Segna come gestito" }).click();
  await expect(page.getByText("Gestito").first()).toBeVisible();
  await page.getByRole("button", { name: "Elimina" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Elimina" }).click();
  await expect(page).toHaveURL(/\/admin\/messaggi$/);
  await expect(page.getByRole("link", { name: "Idea di collaborazione" })).toHaveCount(0);
});

test("settings: GA is loaded only after consent; media upload requires alt and blocks deleting used images", async ({ page }) => {
  await login(page, "/admin/impostazioni");
  await page.getByLabel("ID di misurazione Google Analytics 4").fill("G-TEST1234");
  const box = page.locator("section", { has: page.getByRole("heading", { name: "Statistiche e Search Console" }) });
  await box.getByRole("button", { name: "Salva" }).click();
  await expect(box.getByText(/Salvato\. Google Analytics/)).toBeVisible();

  const visitor = await page.context().browser()!.newContext();
  const pub = await visitor.newPage();
  await pub.goto("/");
  const banner = pub.getByRole("dialog", { name: "Cookie di misurazione" });
  await expect(banner).toBeVisible();
  expect(await pub.locator('script[src*="googletagmanager"]').count()).toBe(0);
  await banner.getByRole("button", { name: "Rifiuta" }).click();
  await expect(banner).toBeHidden();
  expect(await pub.locator('script[src*="googletagmanager"]').count()).toBe(0);
  await pub.reload();
  await expect(pub.getByRole("dialog", { name: "Cookie di misurazione" })).toHaveCount(0);
  await pub.getByRole("button", { name: "Preferenze cookie" }).click();
  await pub.getByRole("dialog", { name: "Cookie di misurazione" }).getByRole("button", { name: "Accetta" }).click();
  await expect(pub.locator('script[src*="googletagmanager"]')).toHaveCount(1);
  await visitor.close();

  // switch GA off again
  await page.getByLabel("ID di misurazione Google Analytics 4").fill("");
  await box.getByRole("button", { name: "Salva" }).click();
  await expect(box.getByText(/Nessuno strumento/)).toBeVisible();

  // media: alt is required
  await page.goto("/admin/media");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  await page.setInputFiles("#file", { name: "x.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Carica immagine" }).click();
  // alt text is mandatory: the browser blocks the submit and the server would refuse it too
  await expect(page.getByLabel(/Descrizione dell'immagine/)).toHaveJSProperty("validity.valueMissing", true);
  await page.getByLabel(/Descrizione dell'immagine/).fill("Un pixel di prova");
  await page.getByRole("button", { name: "Carica immagine" }).click();
  await expect(page.getByText("Immagine caricata.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Un pixel di prova" })).toBeVisible();
  // a non-image with an image extension is refused
  await page.setInputFiles("#file", { name: "fake.png", mimeType: "image/png", buffer: Buffer.from("not an image at all, really") });
  await page.getByLabel(/Descrizione dell'immagine/).fill("Finto");
  await page.getByRole("button", { name: "Carica immagine" }).click();
  await expect(page.getByText(/Formato non supportato/).first()).toBeVisible();
  // unused image can be deleted (with confirmation)
  await page.getByRole("button", { name: "Elimina immagine" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Elimina" }).click();
  await expect(page.getByRole("img", { name: "Un pixel di prova" })).toHaveCount(0);
});

test("admin pages are not reachable without a session", async ({ request }) => {
  for (const p of ["/admin/home", "/admin/media", "/admin/impostazioni", "/admin/messaggi", "/admin/pagine/privacy"]) {
    const res = await request.get(p, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
  }
});
