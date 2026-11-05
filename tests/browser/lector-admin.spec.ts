import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lectorMonths, lectorMonthLabel } from "../../src/lib/lector-schedules";

const origin = new URL(
  process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100"
).origin;
function cookies(email?: string) {
  const helper = pathToFileURL(
    path.resolve("tests/helpers/editor-session.ts")
  ).href;
  const source = `import {createEditorCookies} from ${JSON.stringify(
    helper
  )};process.stdout.write(JSON.stringify(await createEditorCookies({email:process.env.ADMIN_TEST_EMAIL||process.env.ADMIN_EMAIL_ALLOWLIST.split(/[,\\s]+/)[0]})));`;
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        "--input-type=module",
        "-e",
        source
      ],
      {
        encoding: "utf8",
        env: { ...process.env, ADMIN_TEST_EMAIL: email ?? "" }
      }
    )
  );
}
const pdf = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
);

test.describe("Lector administration on an isolated local database", () => {
  test.skip(
    process.env.ADMIN_E2E !== "1",
    "Requires the owned local admin runner."
  );
  test.beforeAll(() => {
    const database = new URL(process.env.DATABASE_URL!);
    if (
      !["127.0.0.1", "localhost"].includes(database.hostname) ||
      !database.pathname.startsWith("/farazv_remake_admin_e2e_test_")
    )
      throw new Error("Disposable local database required");
  });
  test("Google account roles isolate LEKTORKA; monthly PDFs and one-field password work end to end", async ({
    page,
    context,
    browser
  }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await context.addCookies(cookies());
    const lector = "lector-browser@local-tests.example.test";
    await page.goto("/admin/pristupy");
    await page.getByLabel("Google e-mail", { exact: true }).fill(lector);
    await page.getByLabel("Rola nového používateľa").selectOption("lektorka");
    await page
      .getByRole("button", { name: "Pridať prístup", exact: true })
      .click();
    const row = page
      .getByRole("listitem")
      .filter({ has: page.getByText(lector, { exact: true }) });
    await expect(row.getByLabel(`Rola účtu ${lector}`)).toHaveValue("lektorka");
    expect(
      (
        await page.request.patch("/api/admin/editors", {
          headers: { Origin: origin },
          data: {
            email: process.env.ADMIN_EMAIL_ALLOWLIST!.split(/[,\s]+/)[0],
            role: "lektorka",
            previousRole: "admin"
          }
        })
      ).status()
    ).toBe(409);
    await page.goto("/admin/nastavenia");
    const security = page.getByRole("region", {
      name: "Heslo k rozpisom lektorov"
    });
    await expect(
      security.getByLabel("Nové heslo k rozpisom", { exact: true })
    ).toHaveCount(1);
    await expect(
      security.getByLabel("Nové heslo k rozpisom", { exact: true })
    ).toHaveAttribute("type", "password");
    await security
      .getByLabel("Nové heslo k rozpisom", { exact: true })
      .fill("abcdefgh");
    expect(await security.locator('input[type="password"]').count()).toBe(1);
    await security
      .getByRole("button", { name: "Uložiť heslo k rozpisom" })
      .click();
    await expect(security.getByRole("status")).toContainText(
      "Heslo bolo uložené"
    );
    await expect(
      security.getByLabel("Nové heslo k rozpisom", { exact: true })
    ).toHaveValue("");

    const restricted = await browser.newContext({
      baseURL: origin,
      viewport: { width: 1280, height: 900 }
    });
    await restricted.addCookies(cookies(lector));
    const member = await restricted.newPage();
    await member.goto("/admin");
    await expect(member).toHaveURL(/\/admin\/lektori$/);
    const nav = member.getByRole("navigation", { name: "Správa farnosti" });
    await expect(nav.getByRole("link")).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "Rozpisy lektorov" })
    ).toBeVisible();
    for (const route of [
      "/admin/pristupy",
      "/admin/nastavenia",
      "/admin/records/private-id",
      "/admin/preview/private-id",
      "/admin/podnety"
    ]) {
      await member.goto(route);
      await expect(member).toHaveURL(/\/admin\/lektori$/);
    }
    expect((await member.request.get("/api/admin/records")).status()).toBe(403);
    expect(
      (await member.request.get("/api/admin/lectors/password")).status()
    ).toBe(403);
    const [month, next] = lectorMonths();
    for (const value of [month, next]) {
      const panel = member.getByRole("region", {
        name: lectorMonthLabel(value),
        exact: true
      });
      await panel
        .getByLabel(`PDF pre ${lectorMonthLabel(value)}`, { exact: true })
        .setInputFiles({
          name: "rozpis.pdf",
          mimeType: "application/pdf",
          buffer: pdf
        });
      await panel
        .getByRole("button", { name: "Nahrať PDF", exact: true })
        .click();
      await expect(panel.getByText(/PDF je nahrané/)).toBeVisible();
    }
    expect(
      (await new AxeBuilder({ page: member }).include("main").analyze())
        .violations
    ).toEqual([]);
    await member.screenshot({
      path: "test-results/lector-admin-desktop.png",
      fullPage: true
    });
    await member.setViewportSize({ width: 390, height: 844 });
    const brand = await member
      .locator("header")
      .getByRole("link")
      .first()
      .locator("strong")
      .boundingBox();
    const web = await member
      .getByRole("link", { name: "Web ↗", exact: true })
      .boundingBox();
    expect(
      brand &&
        web &&
        (web.x >= brand.x + brand.width ||
          web.y >= brand.y + brand.height ||
          brand.y >= web.y + web.height)
    ).toBeTruthy();
    expect(
      await member.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBeTruthy();
    await member.screenshot({
      path: "test-results/lector-admin-mobile.png",
      fullPage: true
    });

    await member.setViewportSize({ width: 320, height: 844 });
    const narrowBrand = await member
      .locator("header")
      .getByRole("link")
      .first()
      .locator("strong")
      .boundingBox();
    const narrowWeb = await member
      .getByRole("link", { name: "Web ↗", exact: true })
      .boundingBox();
    expect(
      narrowBrand &&
        narrowWeb &&
        (narrowWeb.x >= narrowBrand.x + narrowBrand.width ||
          narrowWeb.y >= narrowBrand.y + narrowBrand.height ||
          narrowBrand.y >= narrowWeb.y + narrowWeb.height)
    ).toBeTruthy();
    expect(
      await member.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBeTruthy();
    const visitor = await browser.newContext({ baseURL: origin });
    const publicPage = await visitor.newPage();
    await publicPage.goto("/spolocenstva/lektori");
    expect(
      (await publicPage.request.get(`/api/lectors/${month}`)).status()
    ).toBe(401);
    await publicPage
      .getByRole("button", { name: "Rozpis lektorov", exact: true })
      .click();
    const dialog = publicPage.getByRole("dialog");
    await dialog.getByLabel("Heslo", { exact: true }).fill("abcdefgh");
    await dialog
      .getByRole("button", { name: "Otvoriť rozpis", exact: true })
      .click();
    await expect(
      dialog.getByRole("button", { name: "Otvoriť PDF", exact: true })
    ).toHaveCount(2);
    const download = publicPage.waitForEvent("download");
    await dialog
      .getByRole("button", { name: "Stiahnuť PDF", exact: true })
      .first()
      .click();
    expect((await download).suggestedFilename()).toBe(
      `rozpis-lektorov-${month}.pdf`
    );
    await dialog.getByRole("button", { name: "Zamknúť rozpisy" }).click();
    await expect(dialog.getByLabel("Heslo", { exact: true })).toBeVisible();
    await visitor.close();

    const future = member.getByRole("region", {
      name: lectorMonthLabel(next),
      exact: true
    });
    member.once("dialog", (popup) => popup.accept());
    await future
      .getByRole("button", { name: "Odstrániť PDF", exact: true })
      .click();
    await expect(
      future.getByText("Rozpis zatiaľ nie je nahraný.", { exact: true })
    ).toBeVisible();
    await page.goto("/admin/pristupy");
    await page.getByLabel(`Rola účtu ${lector}`).selectOption("editor");
    await expect(page.getByRole("status")).toContainText("Rola účtu");
    expect((await member.request.get("/api/admin/lectors")).status()).toBe(403);
    await restricted.close();
    expect(errors).toEqual([]);
  });
});
