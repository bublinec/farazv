import { expect, test, type Locator, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/design/v2");
  await expect(page.locator("[data-public-design=parish]")).toBeVisible();
});

async function expectReadingDestinations(page: Page) {
  const navigation = page.locator("main").getByRole("navigation", {
    name: "Na tejto stránke",
    exact: true
  });
  const links = navigation.getByRole("link");
  expect(await links.count()).toBeGreaterThanOrEqual(3);

  for (const link of await links.all()) {
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^#[\w-]+$/);
    const destination = page.locator(`[id="${href!.slice(1)}"]`);
    await expect(destination).toHaveCount(1);
    await expect(destination).toBeVisible();
    const label = (await link.innerText()).trim();
    if (label === "Fotografie")
      await expect(
        destination
          .getByRole("button", { name: /^Zväčšiť fotografiu:/ })
          .first()
      ).toBeVisible();
    else await expect(destination).toContainText(label);
  }

  return navigation;
}

async function expectAbove(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(secondBox!.y);
}

test("v2 puts current notices before the church welcome and gives each section shortcut a destination", async ({
  page
}) => {
  const main = page.locator("main");
  const noticeboard = main.locator("#vyveska");
  const welcome = main.getByRole("region", {
    name: "Naša farnosť. Náš kostol.",
    exact: true
  });
  await expect(noticeboard).toBeVisible();
  await expect(welcome).toBeVisible();
  await expectAbove(noticeboard, welcome);

  const shortcuts = main.getByRole("navigation", {
    name: "Na tejto stránke",
    exact: true
  });
  await expect(shortcuts.getByRole("link")).toHaveCount(4);
  for (const name of ["Výveska", "Novinky", "Sviatosti", "Časopis"])
    await expect(
      shortcuts.getByRole("link", { name, exact: true })
    ).toBeVisible();
  for (const link of await shortcuts.getByRole("link").all()) {
    const href = await link.getAttribute("href");
    await expect(main.locator(href!)).toHaveCount(1);
  }
});

for (const width of [320, 390, 501]) {
  test(`v2 keeps eight ordered, touch-sized day buttons and today's marker at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const days = page.getByRole("group", {
      name: "Vybrať deň",
      exact: true
    });
    const buttons = days.getByRole("button");
    await expect(buttons).toHaveCount(8);
    const weekdays = await buttons.evaluateAll((elements) =>
      elements.map(
        (element) =>
          element.getAttribute("aria-label")!.split(" · ")[1].split(" ")[0]
      )
    );
    expect(weekdays).toEqual([
      "nedeľa",
      "pondelok",
      "utorok",
      "streda",
      "štvrtok",
      "piatok",
      "sobota",
      "nedeľa"
    ]);

    const boxes = await buttons.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      })
    );
    for (const [index, box] of boxes.entries()) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      if (index) {
        const previous = boxes[index - 1];
        expect(box.y).toBeGreaterThanOrEqual(previous.y);
        if (box.y === previous.y)
          expect(box.x).toBeGreaterThanOrEqual(previous.x + previous.width);
      }
    }

    const today = days.locator('[aria-current="date"]');
    await expect(today).toHaveCount(1);
    await expect(today).toHaveAttribute("aria-pressed", "true");
    await expect(today).toContainText("Dnes");
    const todayLabel = await today.getAttribute("aria-label");
    await buttons.first().click();
    await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
    await expect(today).toHaveAttribute("aria-label", todayLabel!);
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(days.getByRole("button", { pressed: true })).toHaveCount(1);
    await today.click();
    await expect(today).toHaveAttribute("aria-pressed", "true");
  });
}

test("baptism puts practical links and a working, focusable reading menu before the full copy", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sviatosti/sviatost-krstu");
  const main = page.locator("main");
  const contact = main.getByRole("link", {
    name: "Kontakt na farskú kanceláriu",
    exact: true
  });
  await expect(contact).toHaveAttribute("href", "/kontakt");
  const form = main.getByRole("link", {
    name: "Žiadosť o krst dieťaťa · PDF",
    exact: true
  });
  await expect(form).toHaveAttribute(
    "href",
    /^https:\/\/drive\.google\.com\/file\/d\//
  );
  const navigation = await expectReadingDestinations(page);
  await expectAbove(contact, navigation);
  await expectAbove(form, navigation);
  await expectAbove(
    navigation,
    main.locator('section[id^="informacie-"]').first()
  );

  const adultPreparation = navigation.getByRole("link", {
    name: "Ako je to s krstom dospelých?",
    exact: true
  });
  const href = (await adultPreparation.getAttribute("href"))!;
  await adultPreparation.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  const destination = page.locator(href);
  await expect
    .poll(() =>
      destination.evaluate(
        (element) =>
          element === document.activeElement ||
          element.contains(document.activeElement)
      )
    )
    .toBe(true);
  const chapterGaps = await main
    .locator('div[id^="citanie-"]')
    .evaluateAll((headings) =>
      headings
        .filter((heading) =>
          heading.previousElementSibling?.classList.contains("prose")
        )
        .map(
          (heading) =>
            heading.getBoundingClientRect().top -
            heading.previousElementSibling!.getBoundingClientRect().bottom
        )
    );
  expect(chapterGaps.length).toBeGreaterThan(0);
  expect(Math.min(...chapterGaps)).toBeGreaterThanOrEqual(24);
  await expect(main).toContainText("Katechizmus Katolíckej cirkvi 1213");
});

test("church history reading topics resolve and retain the parish history and its author", async ({
  page
}) => {
  await page.goto("/farnost/kostol-sv-alzbety");
  const navigation = await expectReadingDestinations(page);
  await expect(
    navigation.getByRole("link", { name: "Kostol sv. Alžbety", exact: true })
  ).toBeVisible();
  const main = page.locator("main");
  await expect(main).toContainText("iroškótski mnísi");
  await expect(main).toContainText("Jozef Kaniansky");
  await expect(main).toContainText("1673");
});

test("expired confirmation and marriage timetables give current contact guidance while retaining teaching", async ({
  page
}) => {
  const main = page.locator("main");
  await page.goto("/sviatosti/sviatost-birmovania");
  await expect(main).not.toContainText(/16\.\s*10\.\s*2022/);
  await expect(main).not.toContainText(
    /októbri 2021|október 2022|protipandem/i
  );
  await expect(main).toContainText("Informácie o aktuálnej príprave");
  await expect(main).toContainText("Katechizmus Katolíckej cirkvi 1316");
  await expect(main).toContainText("Kto môže byť birmovným rodičom?");

  await page.goto("/sviatosti/sviatost-manzelstva");
  await expect(main).not.toContainText(/[123]\.\s*Turnus:/i);
  await expect(main).not.toContainText(/13\.\s*03\.|08\.\s*05\.|28\.\s*08\./);
  await expect(main).not.toContainText("v našej farnosti v roku 2026");
  await expect(main).toContainText("Aktuálne termíny predmanželských kurzov");
  await expect(main).toContainText("Katechizmus Katolíckej cirkvi 1661");
  await expect(main).toContainText("Potrebné listiny:");
});

test("expired parish-family registration and school welcome are removed without losing useful destinations or history", async ({
  page
}) => {
  const main = page.locator("main");
  await page.goto("/den-farskej-rodiny");
  await expect(main.locator('img[src*="plagat_2026_57e80c0f61"]')).toHaveCount(
    0
  );
  await expect(
    main.locator('a[href*="1FAIpQLSepC7a9dcWiBJcRnI6V57_-WygAbw5"]')
  ).toHaveCount(0);
  await expect(main).toContainText("O najbližšom Dni farskej rodiny");
  await expect(
    main.getByRole("link", { name: "Aktuálne farské oznamy", exact: true })
  ).toHaveAttribute("href", "/farnost/farske-oznamy");

  await page.goto("/farnost/cirkevna-skola");
  await expect(main).not.toContainText(/2022\/2023|aktuálne máme 234/);
  await expect(main).toContainText(/1\.\s*7\.\s*1992/);
  await expect(
    main.getByRole("link", { name: "Navštíviť stránku školy", exact: true })
  ).toHaveAttribute("href", "https://zsdomzv.edupage.org/");
});
