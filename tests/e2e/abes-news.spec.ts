import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

const PRODUCT_HREF = /^https:\/\/abes\.bio\/products\/[a-z0-9_-]+$/;

const homeLinks = (page: Page) => page.locator('a[data-abes-product]');
async function hrefs(page: Page) {
  return page.locator("a[data-abes-product]").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
}

test.describe("ABES showcase", () => {
  test("Home shows real, distinct product cards that open THAT product on abes.bio", async ({ page }) => {
    await page.goto("/");
    const links = await hrefs(page);
    expect(links.length).toBeGreaterThanOrEqual(4);
    for (const h of links) expect(h).toMatch(PRODUCT_HREF);
    expect(new Set(links).size).toBe(links.length);
    const first = homeLinks(page).first();
    await expect(first).toHaveAttribute("target", "_blank");
    await expect(first).toHaveAttribute("rel", /noopener/);
    await expect(first.getByText("Scopri il prodotto")).toBeVisible();
    await expect(first.locator("img")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Esplora lo shop ABES/ }).first()).toHaveAttribute("href", "https://abes.bio/collections/all");
    // no internal commerce
    await expect(page.getByText(/acquista ora|aggiungi al carrello|checkout/i)).toHaveCount(0);
    // manual catalogue: no price, no availability claims
    await expect(page.getByText(/Disponibile|esaurito|€/)).toHaveCount(0);
  });

  test("admin reorders, hides and shows a product and the public site follows", async ({ page }) => {
    await login(page);
    await page.goto("/");
    const before = await hrefs(page);

    await page.goto("/admin/prodotti");
    await expect(page.getByRole("heading", { level: 1, name: "Prodotti ABES" })).toBeVisible();
    await expect(page.getByText("Catalogo manuale")).toBeVisible();
    // move the 2nd product up -> becomes the 1st on the Home
    const items = page.getByRole("list", { name: /Prodotti della vetrina/ }).getByRole("listitem");
    await items.nth(1).getByRole("button", { name: /più in alto/ }).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/");
    const swapped = await hrefs(page);
    expect(swapped[0]).toBe(before[1]);
    expect(swapped[1]).toBe(before[0]);

    // hide the first product -> disappears from Home and Shop
    await page.goto("/admin/prodotti");
    await page.getByRole("list", { name: /Prodotti della vetrina/ }).getByRole("listitem").first().getByRole("button", { name: "Nascondi" }).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/");
    expect(await hrefs(page)).not.toContain(swapped[0]);
    await page.goto("/shop");
    expect(await hrefs(page)).not.toContain(swapped[0]);

    // show it again
    await page.goto("/admin/prodotti");
    await page.getByRole("list", { name: /Prodotti della vetrina/ }).getByRole("listitem").first().getByRole("button", { name: "Mostra" }).click();
    await page.waitForLoadState("networkidle");
    await page.goto("/");
    expect(await hrefs(page)).toContain(swapped[0]);
  });

  test("manual create validates the ABES URL and adds the product", async ({ page }) => {
    await login(page);
    await page.goto("/admin/prodotti/nuovo");
    await page.getByLabel(/Nome del prodotto/).fill("Prodotto di prova");
    await page.getByLabel(/Link alla scheda su ABES/).fill("https://abes.bio/collections/all");
    await page.getByLabel(/Indirizzo della foto/).fill("https://cdn.shopify.com/s/files/1/0830/7612/0899/files/IMG_8170.jpg?v=1717750049");
    await page.getByRole("button", { name: "Salva" }).click();
    await expect(page.getByText(/deve essere la pagina di un prodotto/)).toBeVisible();

    await page.getByLabel(/Link alla scheda su ABES/).fill("https://abes.bio/products/prodotto-di-prova");
    await page.getByRole("button", { name: "Salva" }).click();
    await expect(page).toHaveURL(/\/admin\/prodotti$/);
    await expect(page.getByRole("link", { name: "Prodotto di prova" })).toBeVisible();

    // duplicate URL is refused
    await page.goto("/admin/prodotti/nuovo");
    await page.getByLabel(/Nome del prodotto/).fill("Doppione");
    await page.getByLabel(/Link alla scheda su ABES/).fill("https://abes.bio/products/prodotto-di-prova");
    await page.getByLabel(/Indirizzo della foto/).fill("https://cdn.shopify.com/s/files/1/0830/7612/0899/files/IMG_8170.jpg?v=1717750049");
    await page.getByRole("button", { name: "Salva" }).click();
    await expect(page.getByText("Questo prodotto è già nella lista.")).toBeVisible();

    // cleanup: remove it
    await page.goto("/admin/prodotti");
    await page.getByRole("link", { name: "Prodotto di prova" }).click();
    await page.getByRole("button", { name: "Rimuovi dalla vetrina" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Rimuovi" }).click();
    await expect(page).toHaveURL(/\/admin\/prodotti$/);
    await expect(page.getByRole("link", { name: "Prodotto di prova" })).toHaveCount(0);
  });

  test("admin product pages require a session", async ({ request }) => {
    for (const p of ["/admin/prodotti", "/admin/prodotti/nuovo", "/admin/news", "/admin/news/nuova"]) {
      const res = await request.get(p, { maxRedirects: 0 });
      expect(res.status(), p).toBe(307);
    }
  });
});

test.describe("News", () => {
  test("empty state uses the exact dossier copy and no fake articles exist", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Nuove storie in arrivo. Stiamo preparando i prossimi aggiornamenti.")).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("draft is a 404 for visitors (even by direct URL), preview works for admin, publish makes it visible, unpublish hides it", async ({ page, browser }) => {
    await login(page);
    await page.goto("/admin/news/nuova");
    await page.locator("#title").fill("Festa del raccolto 2026");
    await page.getByLabel("Introduzione").fill("Una giornata nei campi con tutta la comunità.");
    const editor = page.getByRole("textbox", { name: "Testo dell'articolo" });
    await editor.click();
    await page.keyboard.type("Ci vediamo in campagna per la raccolta.");
    await page.getByRole("button", { name: "Salva bozza" }).click();
    await expect(page).toHaveURL(/\/admin\/news\/(?!nuova)[a-z0-9]+$/);
    const editUrl = page.url();
    const id = editUrl.split("/").pop()!;
    const slug = "festa-del-raccolto-2026";
    await expect(page.getByLabel("Indirizzo della pagina")).toHaveValue(slug);

    // anonymous visitor: draft not reachable, not in list, not in sitemap
    const anon = await (await browser.newContext()).newPage();
    const res = await anon.goto(`/news/${slug}`);
    expect(res?.status()).toBe(404);
    await anon.goto("/news");
    await expect(anon.getByText("Nuove storie in arrivo. Stiamo preparando i prossimi aggiornamenti.")).toBeVisible();
    const sm = await anon.request.get("/sitemap.xml");
    if (sm.ok()) expect(await sm.text()).not.toContain(slug);
    expect((await anon.request.get(`/admin/news/${id}/anteprima`, { maxRedirects: 0 })).status()).toBe(307);

    // admin preview works
    await page.goto(`/admin/news/${id}/anteprima`);
    await expect(page.getByRole("heading", { level: 1, name: "Festa del raccolto 2026" })).toBeVisible();
    await expect(page.getByText("Questa è una bozza")).toBeVisible();

    // publish
    await page.goto(editUrl);
    await page.getByRole("button", { name: "Pubblica", exact: true }).click();
    await expect(page.getByText("News pubblicata.").first()).toBeVisible();
    const pub = await anon.goto(`/news/${slug}`);
    expect(pub?.status()).toBe(200);
    await expect(anon.getByRole("heading", { level: 1, name: "Festa del raccolto 2026" })).toBeVisible();
    await expect(anon.getByText("Ci vediamo in campagna per la raccolta.")).toBeVisible();
    const ld = await anon.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld!)["@type"]).toBe("Article");
    await expect(anon.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await anon.goto("/news");
    await expect(anon.getByRole("link", { name: "Festa del raccolto 2026" })).toBeVisible();
    await anon.goto("/");
    await expect(anon.getByRole("link", { name: "Festa del raccolto 2026" })).toBeVisible();

    // unpublish -> 404 again
    await page.goto(editUrl);
    await page.getByRole("button", { name: /Ritira/ }).click();
    await expect(page.getByText(/non è più visibile/).first()).toBeVisible();
    expect((await anon.goto(`/news/${slug}`))?.status()).toBe(404);

    // delete with confirmation
    await page.goto("/admin/news");
    await page.getByRole("button", { name: "Elimina" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Elimina" }).click();
    await expect(page.getByText("Non ci sono ancora news")).toBeVisible();
  });

  test("slug collisions get a numeric suffix and categories filter the public list", async ({ page }) => {
    await login(page);
    await page.goto("/admin/news/categorie");
    await page.getByLabel(/^Nome/).fill("Progetti");
    await page.getByRole("button", { name: "Aggiungi" }).click();
    await expect(page.getByText("Categoria aggiunta.").first()).toBeVisible();

    const publishNew = async (title: string, category: string) => {
      await page.goto("/admin/news/nuova");
      await page.locator("#title").fill(title);
      await page.getByLabel("Introduzione").fill("Introduzione di prova.");
      await page.getByLabel("Categoria").selectOption({ label: category });
      await page.getByRole("button", { name: "Pubblica", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/news\/(?!nuova)[a-z0-9]+$/);
      return page.getByLabel("Indirizzo della pagina").inputValue();
    };
    expect(await publishNew("Stessa storia", "Progetti")).toBe("stessa-storia");
    expect(await publishNew("Stessa storia", "Nessuna categoria")).toBe("stessa-storia-2");

    await page.goto("/news");
    await expect(page.locator("article")).toHaveCount(2);
    await page.getByRole("link", { name: "Progetti", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(1);
  });
});
