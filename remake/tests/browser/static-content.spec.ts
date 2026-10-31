import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

interface ApprovedLayout {
  slug: string;
  title: string;
  links?: { href: string }[];
  sections?: { title: string; paragraphs?: string[]; items?: string[] }[];
}
interface ApprovedContent {
  layouts: ApprovedLayout[];
  reading: { route: string; blocks: string[] }[];
}

const approved: ApprovedContent = JSON.parse(
  readFileSync(
    new URL("../fixtures/approved-static-content.json", import.meta.url),
    "utf8"
  )
);
const normalize = (value: string) =>
  value
    .normalize("NFC")
    .toLocaleLowerCase("sk")
    .replace(/\s+/g, "")
    .replace(/^—/, "");

test("all 24 static layouts retain the approved current reading blocks and resource destinations", async ({
  page
}) => {
  test.setTimeout(120_000);
  let checkedBlocks = 0;

  for (const layout of approved.layouts) {
    const route = `/${layout.slug}`;
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      layout.title
    );

    const main = page.locator("main");
    const text = normalize(await main.innerText());
    const reading = approved.reading.find((entry) => entry.route === route)!;
    const blocks = reading.blocks.map(normalize);
    for (const block of blocks) {
      expect(text.includes(block), `${route}: approved reading block`).toBe(
        true
      );
      checkedBlocks += 1;
    }

    // Repeated credit labels are deliberately deduplicated by the renderer.
    // Distinct reading blocks must still occur in their original sequence.
    let previous = 0;
    for (const block of new Set(blocks)) {
      const position = text.indexOf(block, previous);
      expect(
        position,
        `${route}: approved reading order`
      ).toBeGreaterThanOrEqual(previous);
      previous = position + block.length;
    }

    for (const section of layout.sections ?? []) {
      for (const value of [
        section.title,
        ...(section.paragraphs ?? []),
        ...(section.items ?? [])
      ]) {
        expect(
          text.includes(normalize(value)),
          `${route}: curated reading copy`
        ).toBe(true);
      }
    }
    const hrefs = await main
      .locator("a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    for (const link of layout.links ?? []) {
      expect(hrefs, `${route}: approved resource destination`).toContain(
        link.href
      );
    }
  }

  expect(checkedBlocks).toBe(224);
});

test("static collections retain paging focus, wrapping navigation, end state and missing-image accessibility", async ({
  page
}) => {
  await page.route("https://res.cloudinary.com/**", (route) =>
    route.fulfill({ status: 404, body: "Missing test image" })
  );
  await page.goto("/farnost/galeria");
  const collections = page.locator("main section[id^='informacie-']").filter({
    has: page.getByRole("button", { name: /^Zväčšiť fotografiu:/ })
  });
  await expect(collections).toHaveCount(3);

  const first = collections.first();
  const thumbnails = first.getByRole("button", {
    name: /^Zväčšiť fotografiu:/
  });
  await expect(thumbnails).toHaveCount(12);
  await first
    .getByRole("button", { name: "Zobraziť ďalšie fotografie" })
    .click();
  await expect(thumbnails).toHaveCount(24);
  await expect(thumbnails.nth(12)).toBeFocused();
  await first
    .getByRole("button", { name: "Zobraziť ďalšie fotografie" })
    .click();
  await first
    .getByRole("button", { name: "Zobraziť ďalšie fotografie" })
    .click();
  await expect(thumbnails).toHaveCount(44);
  await expect(
    first.getByText("Zobrazené všetky fotografie.", { exact: true })
  ).toBeVisible();
  await expect(
    first.getByRole("button", { name: "Zobraziť ďalšie fotografie" })
  ).toHaveCount(0);

  const opener = thumbnails.first();
  await opener.click();
  const dialog = page.getByRole("dialog", {
    name: "Prehliadač fotografií",
    exact: true
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: /^Obrázok momentálne nie je dostupný\./ })
  ).toBeVisible();
  const close = dialog.getByRole("button", {
    name: "Zavrieť galériu",
    exact: true
  });
  await expect(close).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByText("44 / 44", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText("1 / 44", { exact: true })).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Nasledujúca fotografia", exact: true })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});
