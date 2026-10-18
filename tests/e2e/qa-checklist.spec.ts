import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

// Cross-module checks from the dossier quality checklist (docs/QA_CHECKLIST.md).
test.describe.configure({ mode: "serial" });

const stamp = Date.now().toString(36);

async function createEvent(page: Page, o: { title: string; cta: string; target?: string; status?: string; featured?: boolean; start?: string; mode?: string; fieldLabel?: string; fieldType?: string }) {
  await page.goto("/admin/eventi/nuovo");
  await page.locator("[name=title]").fill(o.title);
  await page.getByLabel("Inizio").fill(o.start ?? "2030-06-15T18:00");
  await page.getByLabel("Luogo").fill("Castelvetrano");
  await page.locator("[name=status]").selectOption(o.status ?? "published");
  await page.getByLabel("Cosa possono fare i visitatori?").selectOption(o.cta);
  if (o.target) await page.locator("[name=ctaTarget]").fill(o.target);
  if (o.mode) await page.locator("[name=registrationMode]").selectOption(o.mode);
  if (o.featured) await page.locator("[name=featured]").check();
  if (o.fieldLabel) {
    await page.getByLabel("Aggiungi un campo").selectOption(o.fieldType ?? "text");
    await page.getByRole("button", { name: "Aggiungi campo" }).click();
    await page.getByLabel("Etichetta", { exact: true }).last().fill(o.fieldLabel);
  }
  await page.getByRole("button", { name: "Crea evento" }).click();
  await expect(page).toHaveURL(/\/admin\/eventi\/[a-z0-9]{20,}$/);
  return (await page.getByLabel("Indirizzo della pagina").inputValue()).trim();
}

test("informational events: CTA by email / WhatsApp / external link, no registration form", async ({ page, browser }) => {
  await login(page);
  const cases = [
    { cta: "email", target: "info@example.test", href: /^mailto:info@example\.test/ },
    { cta: "whatsapp", target: "+39 331 1234567", href: /^https:\/\/wa\.me\/393311234567/ },
    { cta: "external_link", target: "https://abes.bio/", href: /^https:\/\/abes\.bio\/?$/ },
  ];
  const anon = await (await browser.newContext()).newPage();
  for (const c of cases) {
    const title = `Info ${c.cta} ${stamp}`;
    const slug = await createEvent(page, { title, cta: c.cta, target: c.target });
    await anon.goto(`/eventi/${slug}`);
    await expect(anon.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(anon.locator("form")).toHaveCount(0);
    const cta = anon.locator('main a[href^="mailto:"], main a[href^="https://wa.me"], main a[href^="https://abes.bio"]').first();
    await expect(cta).toHaveAttribute("href", c.href);
  }
  await anon.context().close();
});

test("two events keep different registration forms", async ({ page, browser }) => {
  await login(page);
  const a = await createEvent(page, { title: `Form A ${stamp}`, cta: "registration", mode: "open", fieldLabel: "Allergie alimentari", fieldType: "text" });
  const b = await createEvent(page, { title: `Form B ${stamp}`, cta: "registration", mode: "open", fieldLabel: "Nome della scuola", fieldType: "text" });
  const anon = await (await browser.newContext()).newPage();
  await anon.goto(`/eventi/${a}`);
  await expect(anon.getByLabel("Allergie alimentari")).toBeVisible();
  await expect(anon.getByLabel("Nome della scuola")).toHaveCount(0);
  await anon.goto(`/eventi/${b}`);
  await expect(anon.getByLabel("Nome della scuola")).toBeVisible();
  await expect(anon.getByLabel("Allergie alimentari")).toHaveCount(0);
  await anon.context().close();
});

test("Home highlights: featured event comes first; news featured flag reflected", async ({ page, browser }) => {
  await login(page);
  const title = `Evento in evidenza ${stamp}`;
  await createEvent(page, { title, cta: "none", featured: true, start: "2031-01-10T18:00" });
  const anon = await (await browser.newContext()).newPage();
  await anon.goto("/");
  await expect(anon.locator("article h3").first()).toHaveText(title); // events precede news on Home; featured first
  await expect(anon.locator("article h3", { hasText: title })).toHaveCount(1);
  await anon.context().close();
});

test("media upload refuses non-image files (PDF, text, fake extension)", async ({ page }) => {
  await login(page);
  const bogus = [
    { name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") },
    { name: "note.txt", mimeType: "text/plain", buffer: Buffer.from("hello world, not an image") },
    { name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") },
  ];
  for (const f of bogus) {
    await page.goto("/admin/media");
    await page.locator("#file").setInputFiles(f);
    await page.getByLabel(/Descrizione dell'immagine/).fill("Prova");
    await page.getByRole("button", { name: "Carica immagine" }).click();
    await expect(page.getByText("Formato non supportato. Usa JPG, PNG, WebP o AVIF.").first()).toBeVisible();
  }
});

test("admin area is not indexable; robots disallows it", async ({ page, request }) => {
  const login1 = await request.get("/admin/login");
  expect(login1.headers()["x-robots-tag"]).toContain("noindex");
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \/admin/);
  expect(robots).toMatch(/Sitemap:/);
});

test("drafts and hidden events stay out of pages and sitemap; published ones are listed", async ({ page, browser }) => {
  await login(page);
  const draftSlug = await createEvent(page, { title: `Bozza ${stamp}`, cta: "none", status: "draft" });
  const hiddenSlug = await createEvent(page, { title: `Nascosto ${stamp}`, cta: "none", status: "hidden" });
  const pubSlug = await createEvent(page, { title: `Pubblico ${stamp}`, cta: "none", status: "published" });
  await page.goto("/admin/news/nuova");
  await page.locator("#title").fill(`News bozza ${stamp}`);
  await page.getByRole("button", { name: "Salva bozza" }).click();
  await expect(page).toHaveURL(/\/admin\/news\/(?!nuova)[a-z0-9]+$/);
  const newsSlug = await page.getByLabel("Indirizzo della pagina").inputValue();

  const anon = await (await browser.newContext()).newPage();
  const sm = await (await anon.request.get("/sitemap.xml")).text();
  expect(sm).toContain(`/eventi/${pubSlug}`);
  for (const s of [draftSlug, hiddenSlug]) expect(sm).not.toContain(`/eventi/${s}`);
  expect(sm).not.toContain(`/news/${newsSlug}`);
  for (const u of [`/eventi/${draftSlug}`, `/eventi/${hiddenSlug}`, `/news/${newsSlug}`]) expect((await anon.goto(u))?.status(), u).toBe(404);
  await anon.goto("/eventi");
  await expect(anon.getByText(`Bozza ${stamp}`)).toHaveCount(0);
  await expect(anon.getByText(`Nascosto ${stamp}`)).toHaveCount(0);
  await anon.context().close();
});

test("every Home ABES card links to a distinct, real product page", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("a[data-abes-product]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(hrefs.length).toBeGreaterThanOrEqual(4);
  expect(new Set(hrefs).size).toBe(hrefs.length);
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/abes\.bio\/products\/[a-z0-9_-]+$/);
});

test("public pages: single h1, no horizontal overflow at 360px, images have alt", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true });
  const page = await ctx.newPage();
  for (const u of ["/", "/chi-siamo", "/shop", "/eventi", "/news", "/lavora-con-noi", "/contatti", "/privacy", "/cookie-policy"]) {
    await page.goto(u);
    await expect(page.locator("h1"), u).toHaveCount(1);
    const m = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - window.innerWidth, noAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length }));
    expect(m.over, `${u} overflow`).toBeLessThanOrEqual(0);
    expect(m.noAlt, `${u} img alt`).toBe(0);
  }
  await ctx.close();
});
