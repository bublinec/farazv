import { expect, test } from "@playwright/test";

test("design comparison selects v2 across public pages and restores v1", async ({
  page
}) => {
  await page.goto("/design/v1");
  await expect(page.locator("[data-public-design]")).toHaveCount(0);
  const original = await page.getByRole("heading", { level: 1 }).textContent();

  await page.goto("/design");
  await expect(
    page.getByRole("link", { name: "Otvoriť návrh 02 →" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Otvoriť návrh 02 →" }).click();
  await expect(page.locator("[data-public-design=parish]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(original!);
  await expect(
    page.getByRole("heading", { name: "Naša farnosť. Náš kostol." })
  ).toBeVisible();

  const font = await page
    .locator("h1")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(font).toContain("Source Serif 4");
  await page.goto("/sviatosti/sviatost-krstu");
  await expect(page.locator("[data-public-design=parish]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sviatosť krstu"
  );
  await page.getByRole("link", { name: "Porovnať s návrhom 01" }).click();
  await expect(page).toHaveURL(/\/sviatosti\/sviatost-krstu$/);
  await expect(page.locator("[data-public-design]")).toHaveCount(0);
  expect(
    await page
      .locator("h1")
      .evaluate((element) => getComputedStyle(element).fontFamily)
  ).toContain("Ubuntu");
});

test("design selectors stay uncached, noindex, and cannot redirect off-site", async ({
  request
}) => {
  const response = await request.get(
    "/design/v2?returnTo=https://attacker.invalid",
    { maxRedirects: 0 }
  );
  expect(response.status()).toBe(303);
  expect(response.headers().location).toBe("/");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(response.headers()["set-cookie"]).toContain("HttpOnly");
  expect((await request.get("/design/unknown")).status()).toBe(404);
});

test("v2 stays readable at narrow widths and keeps admin outside the theme", async ({
  page
}) => {
  await page.goto("/design/v2");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nasledujúci deň", exact: true })
    ).toBeVisible();
  }
  await page.goto("/admin/login");
  await expect(page.locator("[data-public-design]")).toHaveCount(0);
  expect(
    await page
      .locator("h1")
      .evaluate((element) => getComputedStyle(element).fontFamily)
  ).toContain("Ubuntu");
});
