import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lectorMonths } from "../../src/lib/lector-schedules";

const token = "x".repeat(43);
test("lector modal is keyboard accessible and authorization is lost on refresh and new tabs", async ({
  page,
  context
}) => {
  const months = lectorMonths().map((month, i) => ({
    month,
    version: 1,
    available: i === 0,
    bytes: 100,
    updatedAt: null
  }));
  let unlocks = 0;
  await context.route("**/api/lectors/unlock", async (route) => {
    unlocks++;
    const password = route.request().postDataJSON().password;
    await route.fulfill({
      status: password === "abcdefgh" ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(
        password === "abcdefgh"
          ? { token, expiresIn: 43200 }
          : {
              error: "Heslo nie je správne. Skúste ho zadať znova.",
              code: "INVALID_LECTOR_PASSWORD"
            }
      )
    });
  });
  await context.route(/\/api\/lectors$/, async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${token}`);
    await route.fulfill({ json: { months } });
  });
  await page.goto("/spolocenstva/lektori");
  const trigger = page.locator("aside").getByRole("button", {
    name: "Rozpis lektorov",
    exact: true
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Rozpis lektorov" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Heslo", { exact: true })).toBeFocused();
  await dialog.getByLabel("Heslo", { exact: true }).fill("wrongpwd");
  await dialog
    .getByRole("button", { name: "Otvoriť rozpis", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("Heslo nie je správne");
  await dialog.getByLabel("Heslo", { exact: true }).fill("abcdefgh");
  await dialog
    .getByRole("button", { name: "Otvoriť rozpis", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Otvoriť PDF", exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Otvoriť PDF", exact: true })
  ).toBeFocused();
  await expect(dialog.getByRole("status")).toContainText(
    "Rozpisy sú odomknuté"
  );
  await page.screenshot({ path: "test-results/lectors-dialog-desktop.png" });
  await expect(
    dialog.getByText("Rozpis zatiaľ nie je nahraný.", { exact: true })
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Rozpis lektorov", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Rozpis lektorov" })
      .getByRole("button", { name: "Otvoriť PDF", exact: true })
  ).toBeVisible();
  expect(unlocks).toBe(2);
  await page.keyboard.press("Escape");
  await trigger.click();
  await expect(
    dialog.getByRole("button", { name: "Otvoriť PDF", exact: true })
  ).toBeVisible();
  expect(unlocks).toBe(2);
  expect(
    await page.evaluate(() => ({
      session: Object.keys(sessionStorage),
      local: Object.keys(localStorage)
    }))
  ).toEqual({ session: [], local: [] });
  await page.reload();
  await trigger.click();
  await expect(dialog.getByLabel("Heslo", { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto("/spolocenstva/lektori");
  await other
    .locator("aside")
    .getByRole("button", { name: "Rozpis lektorov", exact: true })
    .click();
  await expect(
    other.getByRole("dialog").getByLabel("Heslo", { exact: true })
  ).toBeVisible();
  await other.close();
});

test("lector button is limited to its page and the mobile password controls fit", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/spolocenstva/lektori");
  const trigger = page.locator("aside").getByRole("button", {
    name: "Rozpis lektorov",
    exact: true
  });
  const target = await trigger.boundingBox();
  expect(target!.height).toBeGreaterThanOrEqual(44);
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Heslo", { exact: true }).fill("abcdefgh");
  await dialog.getByLabel("Zobraziť heslo").check();
  await expect(dialog.getByLabel("Heslo", { exact: true })).toHaveAttribute(
    "type",
    "text"
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/lectors-mobile.png",
    fullPage: true
  });
  expect(
    (await new AxeBuilder({ page }).include("dialog").analyze()).violations
  ).toEqual([]);
  await dialog.getByRole("button", { name: "Zatvoriť", exact: true }).click();
  await page.goto("/spolocenstva/ministranti");
  await expect(
    page
      .locator("aside")
      .getByRole("button", { name: "Rozpis lektorov", exact: true })
  ).toHaveCount(0);
});

test("footer opens the password dialog directly on another page", async ({
  page
}) => {
  await page.goto("/kontakt");
  const footer = page.getByRole("contentinfo");
  const trigger = footer.getByRole("button", {
    name: "Rozpis lektorov",
    exact: true
  });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Rozpis lektorov" })
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByLabel("Heslo", { exact: true })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/kontakt$/);
});
