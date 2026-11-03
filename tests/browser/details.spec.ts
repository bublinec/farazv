import { expect, test, type Locator, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function expectReadingHeadings(page: Page) {
  const headings = page.locator('main div[id^="citanie-"]');
  expect(await headings.count()).toBeGreaterThanOrEqual(3);
  const ids = await headings.evaluateAll((elements) =>
    elements.map((element) => element.id)
  );
  expect(new Set(ids).size).toBe(ids.length);

  for (const heading of await headings.all()) {
    await expect(heading).toHaveAttribute("tabindex", "-1");
    await expect(heading.getByRole("heading")).toBeVisible();
  }

  await expect(
    page.getByRole("navigation", { name: "Na tejto stránke", exact: true })
  ).toHaveCount(0);
}

async function expectAbove(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(firstBox!.y + firstBox!.height).toBeLessThanOrEqual(secondBox!.y);
}

test("homepage retains current notices and sacrament pages link all six sacraments", async ({
  page
}) => {
  const main = page.locator("main");
  await expect(main.locator("#vyveska")).toBeVisible();
  await expect(
    main.getByRole("navigation", { name: "Na tejto stránke", exact: true })
  ).toHaveCount(0);
  await page.goto("/sviatosti/sviatost-krstu");

  const sacraments = main.getByRole("region", {
    name: "Sviatosti",
    exact: true
  });
  await expect(sacraments.locator("article")).toHaveCount(6);
  await expect(sacraments.locator("img")).toHaveAttribute(
    "src",
    /window_edb30a4d4a/
  );
  for (const slug of [
    "krstu",
    "eucharistie",
    "birmovania",
    "manzelstva",
    "zmierenia",
    "pomazania-chorych"
  ])
    await expect(
      sacraments.locator(`a[href="/sviatosti/sviatost-${slug}"]`)
    ).toHaveCount(1);
});

for (const width of [320, 390, 501]) {
  test(`homepage keeps eight ordered, touch-sized day buttons and today's marker at ${width}px`, async ({
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

test("baptism retains its quotation, practical PDF and stable reading anchors without a duplicate menu", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sviatosti/sviatost-krstu");
  const main = page.locator("main");
  await expect(main.locator(".pageHero img")).toHaveAttribute(
    "src",
    /IMG_3270_af6574d3ca/
  );
  const quotation = main.locator("figure#informacie-1");
  await expect(quotation.locator("blockquote")).toHaveCount(1);
  await expect(quotation.locator("figcaption")).toContainText(
    "Katechizmus Katolíckej cirkvi 1213"
  );
  await expect(
    main.locator("blockquote").filter({ hasText: "Svätý krst je základom" })
  ).toHaveCount(1);
  const contact = main.getByRole("link", {
    name: "Kontakt na farskú kanceláriu",
    exact: true
  });
  await expect(contact).toHaveCount(0);
  const form = main.getByRole("link", {
    name: "Žiadosť o krst dieťaťa · PDF",
    exact: true
  });
  await expect(form).toHaveAttribute(
    "href",
    /^https:\/\/drive\.google\.com\/file\/d\//
  );
  await expectReadingHeadings(page);
  await expectAbove(
    quotation,
    main.locator('section[id^="informacie-"]').first()
  );
  await expect(form).toBeVisible();

  const destination = main.locator('div[id^="citanie-"]').filter({
    has: page.getByRole("heading", {
      name: "Ako je to s krstom dospelých?",
      exact: true
    })
  });
  await destination.focus();
  await expect(destination).toBeFocused();
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
  await page.goto("/farnost/o-farnosti");
  await expectReadingHeadings(page);
  await expect(
    page.getByRole("heading", { name: "História farnosti", exact: true })
  ).toHaveCount(1);
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
  const impediments = main.locator("details").filter({
    has: page.getByRole("heading", {
      name: "Aké sú manželské prekážky?",
      exact: true
    })
  });
  await expect(impediments).not.toHaveAttribute("open");
  await impediments.locator("summary").click();
  await expect(impediments).toHaveAttribute("open", "");
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
