import { expect, test } from "@playwright/test";
import {
  currentLayouts as layouts,
  expectedPublicReading,
  movedCommunityContacts
} from "../fixtures/current-content-contract";
const normalize = (value: string) =>
  value
    .normalize("NFC")
    .toLocaleLowerCase("sk")
    .replace(/\s+/g, "")
    .replace(/^—/, "");

function readingBlocks(layout: (typeof layouts)[number]) {
  // Only repeated titles/labels and the moved gallery credit were removed.
  // Keep the independent baseline unchanged, including every substantive passage.
  const omitted = new Set(
    [
      layout.title,
      layout.eyebrow,
      "O farnosti",
      "Spoločenstvo",
      "Farnosť",
      "Zolná"
    ].map(normalize)
  );
  if (layout.slug === "farnost/kostol-sv-jana-pavla-v-lieskovci")
    omitted.add(normalize("Kostol sv. Jána Pavla II. v Lieskovci"));
  if (layout.slug === "farnost/galeria") {
    omitted.add(normalize("Autor: Claudia Nemcová"));
    omitted.add(normalize("Claudia Nemcová"));
  }

  return expectedPublicReading(`/${layout.slug}`)
    .map(normalize)
    .filter((block) => !omitted.has(block));
}

test("all 22 static layouts retain the approved substantive reading and resource destinations", async ({
  page
}) => {
  test.setTimeout(120_000);
  expect(layouts).toHaveLength(22);

  for (const layout of layouts) {
    const route = `/${layout.slug}`;
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      layout.title
    );

    const main = page.locator("main");
    // Include the initially collapsed marriage guidance; details.spec checks opening it.
    const text = normalize((await main.textContent()) ?? "");
    const blocks = readingBlocks(layout);
    for (const block of blocks) {
      expect(text.includes(block), `${route}: approved reading block`).toBe(
        true
      );
    }

    // Repeated credit labels are deliberately deduplicated by the renderer.
    // Distinct reading blocks must still occur in their original sequence.
    let previous = 0;
    for (const block of new Set(
      blocks.filter((text) => !text.startsWith("autor:"))
    )) {
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
      if (
        layout.slug === "sviatosti/sviatost-birmovania" &&
        link.href === "/birmovanci"
      )
        continue;
      expect(hrefs, `${route}: approved resource destination`).toContain(
        link.href
      );
    }
    const contact = movedCommunityContacts.find(
      (entry) => entry.slug === layout.slug
    );
    if (contact) {
      expect(text).toContain(normalize(contact.name));
      for (const phone of contact.phones) {
        expect(text).toContain(normalize(phone));
        expect(hrefs).toContain(`tel:${phone.replace(/\s/g, "")}`);
      }
    }
    if (layout.slug === "farnost/kostol-sv-alzbety")
      await expect(
        main.getByRole("link", { name: "Claudia Nemcová", exact: true })
      ).toHaveCount(1);
  }
});

test("static collections retain paging focus, wrapping navigation, end state and missing-image accessibility", async ({
  page
}) => {
  await page.route("https://res.cloudinary.com/**", (route) =>
    route.fulfill({ status: 404, body: "Missing test image" })
  );
  await page.goto("/farnost/galeria");
  const collections = page
    .locator("#galeria section[aria-labelledby^='galeria-']")
    .filter({
      has: page.getByRole("button", { name: /^Zväčšiť fotografiu:/ })
    });
  await expect(collections).toHaveCount(3);

  const first = collections.first();
  const thumbnails = first.getByRole("button", {
    name: /^Zväčšiť fotografiu:/
  });
  await expect(thumbnails).toHaveCount(16);
  await first
    .getByRole("button", { name: "Zobraziť ďalšie fotografie" })
    .click();
  await expect(thumbnails).toHaveCount(32);
  await expect(thumbnails.nth(16)).toBeFocused();
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
