import { expect, test, type Page } from "@playwright/test";

const runtimeErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|hydrating|Minified React error/i.test(message.text())
    )
      errors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(
    runtimeErrors.get(page),
    "No uncaught browser or React hydration errors"
  ).toEqual([]);
});

test("desktop navigation opens by keyboard, closes with Escape, and uses the merged confirmation page", async ({
  page
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Hlavná navigácia",
    exact: true
  });
  const sacraments = navigation
    .locator("summary")
    .filter({ hasText: "Sviatosti" });
  await sacraments.focus();
  await page.keyboard.press("Enter");
  const candidates = navigation.getByRole("link", {
    name: "Birmovanie",
    exact: true
  });
  await expect(candidates).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(candidates).toBeHidden();
  await expect(sacraments).toBeFocused();
  await page.keyboard.press("Enter");
  await candidates.click();
  await expect(page).toHaveURL(/\/sviatosti\/sviatost-birmovania$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sviatosť birmovania"
  );
});

test("mobile menu contains focus, closes with Escape, and navigates to contact", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const opener = page.getByRole("button", {
    name: "Otvoriť menu",
    exact: true
  });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Navigácia", exact: true });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", {
    name: "Zavrieť menu",
    exact: true
  });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: "Rozpis svätých omší", exact: true })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("link", { name: "Domov", exact: true })
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await page
    .getByRole("banner")
    .getByRole("link", {
      name: /Farnosť sv\. Alžbety/
    })
    .evaluate((element) => (element as HTMLElement).focus());
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole("link", { name: "Kontakt", exact: true }).click();
  await expect(page).toHaveURL(/\/kontakt$/);
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sme tu pre vás"
  );
});

test("Mass hero labels today correctly and returns after selecting a different day", async ({
  page
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", {
    name: "Rozpis svätých omší",
    exact: true
  });
  const days = hero.getByRole("group", { name: "Vybrať deň", exact: true });
  const today = days.getByRole("button", { pressed: true });
  const todayLabel = await today.getAttribute("aria-label");
  await expect(today).toContainText("Dnes");
  await expect(hero.locator("time")).toHaveAttribute("datetime", "2026-10-31");
  const next = hero.getByRole("button", {
    name: "Nasledujúci deň",
    exact: true
  });
  if (await next.isEnabled()) await next.click();
  else
    await hero
      .getByRole("button", { name: "Predchádzajúci deň", exact: true })
      .click();
  await expect(hero.locator("time")).not.toHaveAttribute(
    "datetime",
    "2026-10-31"
  );
  expect(
    await days.getByRole("button", { pressed: true }).getAttribute("aria-label")
  ).not.toBe(todayLabel);
  await days.locator('button[aria-current="date"]').click();
  await expect(hero.locator("time")).toHaveAttribute("datetime", "2026-10-31");
  await expect(days.getByRole("button", { pressed: true })).toHaveAttribute(
    "aria-label",
    todayLabel!
  );
});

test("magazine fetches twelve then the remaining eight summaries, finishes without duplicates, and focuses new content", async ({
  page
}) => {
  await page.goto("/farnost/nase-spolocenstvo");
  const cards = page.locator("main article");
  await expect(cards).toHaveCount(12);
  const firstLinks = await cards
    .locator(":scope > a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const more = page.getByRole("button", {
    name: "Načítať ďalšie",
    exact: true
  });
  const responsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/articles"
  );
  await more.click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  expect(payload.items).toHaveLength(8);
  expect(
    payload.items.every(
      (entry: Record<string, unknown>) => !Object.hasOwn(entry, "blocks")
    )
  ).toBe(true);
  await expect(cards).toHaveCount(20);
  await expect(cards.nth(12).locator(":scope > a")).toBeFocused();
  await expect(more).toHaveCount(0);
  await expect(
    page.getByText("Ste na konci. Ďakujeme, že čítate s nami.")
  ).toBeVisible();
  const allLinks = await cards
    .locator(":scope > a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(allLinks).size).toBe(20);
  expect(allLinks.slice(0, 12)).toEqual(firstLinks);
  const invalid = await page.request.get("/api/articles?limit=1000000");
  expect(invalid.status()).toBe(400);
});

test("weekly bulletin shows Sunday to Sunday and expands days without losing today's context", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/farnost/farske-oznamy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Farské oznamy"
  );
  const days = page.locator('main button[aria-controls^="schedule-"]');
  await expect(days).toHaveCount(8);
  await expect(days.first()).toHaveAccessibleName(/nedeľa/i);
  await expect(days.last()).toHaveAccessibleName(/nedeľa/i);
  await expect(days.first().getByText("nedeľa", { exact: true })).toBeVisible();
  await expect(days.first()).not.toContainText("07:00");
  await expect(days.first()).toContainText("Nedeľa v cezročnom období");
  const saturday = days.filter({
    hasText: "Preblahoslavenej Panny Márie v sobotu"
  });
  await expect(saturday).toHaveCount(1);
  await expect(saturday).toHaveAccessibleName(/sobota/i);
  const firstDate = (await days.first().getAttribute("aria-controls"))!.replace(
    "schedule-",
    ""
  );
  const lastDate = (await days.last().getAttribute("aria-controls"))!.replace(
    "schedule-",
    ""
  );
  expect(new Date(lastDate).getTime() - new Date(firstDate).getTime()).toBe(
    7 * 86_400_000
  );
  const expandedDays = page.locator(
    'main button[aria-controls^="schedule-"][aria-expanded="true"]'
  );
  await expect(expandedDays).toHaveCount(1);
  await expect(expandedDays).toContainText("Dnes");
  const earlier = page
    .locator('main button[aria-controls^="schedule-"][aria-expanded="false"]')
    .first();
  const panel = page.locator(`#${await earlier.getAttribute("aria-controls")}`);
  await earlier.click();
  await expect(panel).toBeVisible();
  await expect(panel.getByText("07:00", { exact: true })).toBeVisible();
  await expect(expandedDays).toHaveCount(2);
  await page
    .getByRole("button", { name: "Rozbaliť celý týždeň", exact: true })
    .click();
  await expect(expandedDays).toHaveCount(8);
  const schedulePanels = page.locator('main div[id^="schedule-"]');
  await expect(schedulePanels.getByText("Detská", { exact: true })).toHaveCount(
    2
  );
  await expect(
    schedulePanels.getByText("Kostol sv. Alžbety", { exact: true })
  ).toHaveCount(0);
  await expect(
    schedulePanels.getByText("Lieskovec", { exact: true })
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Zbaliť týždeň", exact: true })
    .click();
  await expect(expandedDays).toHaveCount(1);
  await expect(expandedDays).toContainText("Dnes");
  await expect(
    page.getByRole("heading", { name: "Oznamy", exact: true })
  ).toBeVisible();
});

async function settleBulletinLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    });
  });
}

test("mobile bulletin opening and reload keep today's heading in view", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const today = page.locator('main section[id^="day-"]').filter({
    has: page.getByText("Dnes", { exact: true })
  });
  const top = async () => Math.round((await today.boundingBox())?.y ?? -1);

  await page.goto("/farnost/farske-oznamy");
  await settleBulletinLayout(page);
  await expect.poll(top).toBe(24);

  await page.evaluate(() => window.scrollBy({ top: 260, behavior: "instant" }));
  await expect.poll(top).toBeLessThan(0);
  await page.reload();
  await settleBulletinLayout(page);
  await expect.poll(top).toBe(24);

  const id = await today.getAttribute("id");
  await page.goto("/");
  await page.goto(`/farnost/farske-oznamy#${id}`);
  await settleBulletinLayout(page);
  await expect.poll(top).toBe(24);
  await page.evaluate(() => window.scrollBy({ top: 260, behavior: "instant" }));
  await page.reload();
  await settleBulletinLayout(page);
  await expect.poll(top).toBe(24);
});

test("bulletin preserves explicit anchors and desktop opening position", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/farnost/farske-oznamy#tyzdenne-oznamy");
  await settleBulletinLayout(page);
  await expect(page.locator("#tyzdenne-oznamy")).toBeInViewport();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/farnost/farske-oznamy");
  await settleBulletinLayout(page);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("bulletin does not override interaction while fonts are loading", async ({
  page
}) => {
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/fonts/source-serif-4-variable.woff2", async (route) => {
    await held;
    await route.continue();
  });

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/farnost/farske-oznamy", {
      waitUntil: "domcontentloaded"
    });
    const earlier = page
      .locator('main button[aria-controls^="schedule-"]')
      .first();
    await expect(earlier).toHaveAttribute("aria-expanded", "false");
    await earlier.click();
    await expect(earlier).toHaveAttribute("aria-expanded", "true");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    release();
    await page.waitForLoadState("load");
    await settleBulletinLayout(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    release();
  }
});

test("article pagination waits for client startup before accepting clicks", async ({
  page
}) => {
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto("/farnost/nase-spolocenstvo", { waitUntil: "commit" });
    const more = page.getByRole("button", {
      name: "Načítať ďalšie",
      exact: true
    });
    await expect(page.locator("main article")).toHaveCount(12);
    await expect(more).toBeDisabled();
    release();
    await expect(more).toBeEnabled();
    await more.click();
    await expect(page.locator("main article")).toHaveCount(20);
  } finally {
    release();
  }
});

test("failed article loading preserves the list and can be retried", async ({
  page
}) => {
  await page.goto("/farnost/nase-spolocenstvo");
  await page.route(
    "**/api/articles?*",
    (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporary test failure" })
      }),
    { times: 1 }
  );
  await page
    .getByRole("button", { name: "Načítať ďalšie", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "nepodarilo načítať"
  );
  await expect(page.locator("main article")).toHaveCount(12);
  await page.getByRole("button", { name: "Skúsiť znova", exact: true }).click();
  await expect(page.locator("main article")).toHaveCount(20);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("gallery supports keyboard navigation, Escape and focus return", async ({
  page
}) => {
  await page.goto("/farnost/galeria");
  const thumbnail = page
    .getByRole("button", { name: /^Zväčšiť fotografiu:/ })
    .first();
  await thumbnail.click();
  const dialog = page.getByRole("dialog", {
    name: "Prehliadač fotografií",
    exact: true
  });
  await expect(dialog).toBeVisible();
  const image = dialog.locator("figure img");
  const firstSource = await image.getAttribute("src");
  await page.keyboard.press("ArrowRight");
  await expect(image).not.toHaveAttribute("src", firstSource!);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(thumbnail).toBeFocused();
});

test("unknown URLs return real 404s and legacy CMS paths redirect", async ({
  page,
  request
}) => {
  const response = await page.goto("/tato-stranka-neexistuje");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const missingArticle = await request.get(
    "/farnost/nase-spolocenstvo/tento-clanok-neexistuje"
  );
  expect(missingArticle.status()).toBe(404);
  const redirect = await request.get("/cms/index.php/farnost/kontakt", {
    maxRedirects: 0
  });
  expect([301, 308]).toContain(redirect.status());
  expect(redirect.headers().location).toBe("/kontakt");
  const confirmation = await request.get("/birmovanci", { maxRedirects: 0 });
  expect([301, 308]).toContain(confirmation.status());
  expect(confirmation.headers().location).toBe(
    "/sviatosti/sviatost-birmovania"
  );
  await page.goto("/cms/index.php/farnost/kontakt");
  await expect(page).toHaveURL(/\/kontakt$/);
});

for (const width of [320, 390, 768, 1440]) {
  test(`public layouts fit ${width}px without horizontal overflow`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/farnost/farske-oznamy",
      "/farnost/nase-spolocenstvo",
      "/kontakt",
      "/sviatosti/sviatost-krstu"
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
      }));
      expect(
        dimensions.document,
        `${path}: document overflow at ${width}px`
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(
        dimensions.body,
        `${path}: body overflow at ${width}px`
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  });
}

test("public Cloudinary images load when the public media network is available", async ({
  page,
  request
}) => {
  const probe = await request
    .get(
      "https://res.cloudinary.com/dmx3wfvko/image/upload/f_auto,q_auto,w_320/v1636109913/hero_Image_6740ca56e4.png",
      { timeout: 15_000 }
    )
    .catch(() => null);
  test.skip(
    probe === null,
    "Public Cloudinary network is unavailable in this environment"
  );
  expect(probe?.ok(), "Existing public reference image is accessible").toBe(
    true
  );
  await page.goto("/");
  const broken: string[] = [];
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    const source = await image.evaluate(async (element) => {
      const current = element as HTMLImageElement;
      try {
        await current.decode();
      } catch {
        return current.currentSrc || current.src;
      }
      return current.naturalWidth > 0
        ? null
        : current.currentSrc || current.src;
    });
    if (source) broken.push(source);
  }
  expect(
    broken,
    "All images rendered on the homepage load successfully"
  ).toEqual([]);
});
