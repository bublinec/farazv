import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

/** Automated checks complement keyboard, content and screen-reader review. */
async function checkAccessibility(page: Page, testInfo: TestInfo) {
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summarize = (items: typeof result.violations) =>
    items.map((item) => ({
      id: item.id,
      impact: item.impact,
      help: item.help,
      helpUrl: item.helpUrl,
      nodes: item.nodes.map((node) => ({
        target: node.target,
        failureSummary: node.failureSummary
      }))
    }));
  await testInfo.attach("accessibility-results", {
    body: Buffer.from(
      JSON.stringify(
        {
          path: new URL(page.url()).pathname,
          viewport: page.viewportSize(),
          violations: summarize(result.violations),
          incomplete: summarize(result.incomplete),
          passedChecks: result.passes.length
        },
        null,
        2
      )
    ),
    contentType: "application/json"
  });
  expect(
    summarize(result.violations),
    "No axe-detected WCAG A/AA violations"
  ).toEqual([]);
}
async function openPage(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  expect(await page.locator("html").getAttribute("lang")).toBe("sk");
}

const routes = [
  { name: "homepage desktop", path: "/", width: 1440 },
  { name: "homepage mobile", path: "/", width: 390 },
  { name: "weekly bulletin", path: "/farnost/farske-oznamy", width: 390 },
  { name: "contact", path: "/kontakt", width: 1440 },
  { name: "baptism", path: "/sviatosti/sviatost-krstu", width: 390 },
  { name: "article listing", path: "/farnost/nase-spolocenstvo", width: 1440 },
  { name: "gallery", path: "/farnost/galeria", width: 1440 },
  { name: "editor login", path: "/admin/login", width: 390 }
];
for (const route of routes) {
  test(`accessibility: ${route.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: route.width, height: 1000 });
    await openPage(page, route.path);
    await checkAccessibility(page, testInfo);
  });
}
test("accessibility: complete article detail", async ({ page }, testInfo) => {
  const response = await page.request.get("/api/articles");
  expect(response.ok()).toBeTruthy();
  const { items } = await response.json();
  expect(items.length).toBeGreaterThan(0);
  await openPage(
    page,
    items[0].href || `/farnost/nase-spolocenstvo/${items[0].slug}`
  );
  await checkAccessibility(page, testInfo);
});
test("accessibility: open mobile navigation dialog", async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, "/");
  await page.getByRole("button", { name: "Otvoriť menu", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Navigácia", exact: true })
  ).toBeVisible();
  await checkAccessibility(page, testInfo);
});
test("accessibility: open photograph viewer", async ({ page }, testInfo) => {
  await openPage(page, "/farnost/galeria");
  const opener = page
    .getByRole("button", { name: /Zväčšiť fotografiu/ })
    .first();
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await checkAccessibility(page, testInfo);
});

test("accessibility: unavailable historical image uses an accessible fallback", async ({
  page
}, testInfo) => {
  const path = process.env.A11Y_MISSING_IMAGE_PATH;
  test.skip(
    !path,
    "Set a known unavailable-image article path for migrated-content verification."
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, path!);
  await page
    .getByRole("button", { name: /Zväčšiť fotografiu/ })
    .first()
    .scrollIntoViewIfNeeded();
  await expect(
    page
      .getByRole("img", { name: /Obrázok momentálne nie je dostupný/ })
      .first()
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        Array.from(document.images).filter(
          (image) =>
            image.complete && image.naturalWidth === 0 && image.currentSrc
        ).length
    )
  ).toBe(0);
  await checkAccessibility(page, testInfo);
  await page
    .getByRole("button", {
      name: /Zväčšiť fotografiu:.*Obrázok momentálne nie je dostupný/
    })
    .first()
    .click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toBeVisible();
  await expect(
    viewer.getByRole("img", {
      name: /Obrázok momentálne nie je dostupný/
    })
  ).toBeVisible();
  await checkAccessibility(page, testInfo);
});
