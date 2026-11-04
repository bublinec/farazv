import { expect, test } from "@playwright/test";

for (const route of [
  "/",
  "/kontakt",
  "/farnost/o-farnosti",
  "/sviatosti/sviatost-krstu",
  "/farnost/nase-spolocenstvo",
  "/farnost/farske-oznamy",
  "/podnety"
]) {
  test(`public metadata stays complete and preview-safe: ${route}`, async ({
    page
  }) => {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).pathname).toBe(route);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S/
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:\/\//
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      canonical!
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "sk");
    if (route === "/kontakt") {
      await expect(page).toHaveTitle(
        "Kontakt a úradné hodiny | Farnosť Zvolen – mesto"
      );
      await expect(page.locator("main h1")).toHaveText("Sme tu pre vás");
    }
    if (route === "/") {
      const data = await page
        .locator('script[type="application/ld+json"]')
        .textContent();
      expect(
        JSON.parse(data!)["@graph"].some(
          (entry: { "@type": string }) => entry["@type"] === "WebSite"
        )
      ).toBe(true);
    }
  });
}

test("fixture deployments expose no indexable sitemap", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("<loc>");
});
