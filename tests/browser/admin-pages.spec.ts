import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, type Page } from "@playwright/test";
import type { ContentRecordFor } from "../../src/content/documents";

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

const builtInRoutes = [
  "sviatosti/sviatost-krstu",
  "sviatosti/sviatost-eucharistie",
  "sviatosti/sviatost-birmovania",
  "sviatosti/sviatost-manzelstva",
  "sviatosti/sviatost-zmierenia",
  "sviatosti/sviatost-pomazania-chorych",
  "spolocenstva/detsky-spevokol",
  "spolocenstva/mladeznicky-zbor",
  "spolocenstva/ministranti",
  "spolocenstva/lektori",
  "spolocenstva/akolyti"
];

async function visibleMain(page: Page, route: string) {
  const response = await page.goto(`/${route}`);
  expect(response?.status(), route).toBe(200);
  return page.locator("main").innerText();
}

async function mutate(
  page: Page,
  record: ContentRecordFor<"page">,
  action: "publish" | "unpublish"
): Promise<ContentRecordFor<"page">> {
  const response = await page.request.post(
    `/api/admin/records/${record.id}/${action}`,
    { headers: { Origin: origin }, data: { version: record.version } }
  );
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}

test.describe("Editable sacrament and service pages", () => {
  test.skip(
    process.env.ADMIN_E2E !== "1",
    "Requires the owned local admin runner."
  );
  // Remote photographs may be unreachable in test environments; a stand-in keeps
  // both page versions rendering the same image markup.
  test.beforeEach(async ({ page }) => {
    await page.route("https://res.cloudinary.com/**", (route) =>
      route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          "base64"
        )
      })
    );
  });
  test.beforeAll(() => {
    const database = new URL(process.env.DATABASE_URL!);
    if (
      !["127.0.0.1", "localhost"].includes(database.hostname) ||
      !database.pathname.startsWith("/farazv_remake_admin_e2e_test_")
    )
      throw new Error("Disposable local database required");
  });

  test("anonymous and unlisted accounts cannot open or change pages", async ({
    page,
    context
  }) => {
    expect((await page.request.get("/api/admin/pages")).status()).toBe(401);
    expect(
      (
        await page.request.post("/api/admin/pages", {
          headers: { Origin: origin },
          data: { route: builtInRoutes[0] }
        })
      ).status()
    ).toBe(401);

    await context.addCookies(cookies("unlisted-editor@example.test"));
    expect((await page.request.get("/api/admin/pages")).status()).toBe(403);

    await context.clearCookies();
    await context.addCookies(cookies());
    expect(
      (
        await page.request.post("/api/admin/pages", {
          data: { route: builtInRoutes[0] }
        })
      ).status(),
      "writes require the same-origin header"
    ).toBe(403);
  });

  test("publishing an unchanged copy shows exactly the code version", async ({
    page,
    context
  }) => {
    test.setTimeout(240000);
    await context.addCookies(cookies());

    // Akolyti is left untouched for the editing workflow below.
    for (const route of builtInRoutes.filter(
      (route) => route !== "spolocenstva/akolyti"
    )) {
      const code = await visibleMain(page, route);
      const response = await page.request.post("/api/admin/pages", {
        headers: { Origin: origin },
        data: { route }
      });
      expect(response.ok(), await response.text()).toBeTruthy();
      const record = (await response.json()) as ContentRecordFor<"page">;

      const published = await mutate(page, record, "publish");
      expect(await visibleMain(page, route), route).toBe(code);

      await mutate(page, published, "unpublish");
      expect(await visibleMain(page, route), route).toBe(code);
    }
  });

  test("edit, publish, restore history and return to the code version", async ({
    page,
    context
  }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => void dialog.accept());
    await context.addCookies(cookies());
    const route = "spolocenstva/akolyti";
    const code = await visibleMain(page, route);

    await page.goto("/admin/stranky");
    await page
      .getByRole("button", { name: /Akolyti/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/admin\/records\/page-spolocenstva-akolyti/);
    const editorUrl = page.url();
    await expect(
      page.getByText("Na webe sa teraz zobrazuje pôvodná verzia z kódu.")
    ).toBeVisible();

    const introduction = page.getByRole("textbox", {
      name: "Úvod pod nadpisom",
      exact: true
    });
    await introduction.fill("Upravený úvod z administrácie.");
    await page.getByRole("button", { name: "Uložiť", exact: true }).click();
    await expect(
      page.getByText("Uložené. Obsah zostáva súkromný.")
    ).toBeVisible();
    expect(await visibleMain(page, route)).toBe(code);

    await page.goto(editorUrl);
    await page.getByRole("switch", { name: "Zverejnenie na webe" }).click();
    await expect(
      page.getByRole("switch", { name: "Zverejnenie na webe" })
    ).toHaveAttribute("aria-checked", "true");
    expect(await visibleMain(page, route)).toContain(
      "Upravený úvod z administrácie."
    );

    await page.goto(editorUrl);
    const history = page.getByRole("region", { name: "História a návrat" });
    await expect(history.getByRole("listitem")).toHaveCount(3);
    await history.getByRole("button", { name: "Obnoviť" }).last().click();
    await expect(history.getByRole("listitem")).toHaveCount(4);
    expect(await visibleMain(page, route)).toBe(code);

    await page.goto(editorUrl);
    await page
      .getByRole("button", { name: "Vrátiť web na pôvodnú verziu z kódu" })
      .click();
    await expect(
      page.getByText("Na webe sa teraz zobrazuje pôvodná verzia z kódu.")
    ).toBeVisible();
    expect(await visibleMain(page, route)).toBe(code);
    expect(errors).toEqual([]);
  });

  test("a new service page appears on the web, in the menu and on the homepage", async ({
    page,
    context
  }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => void dialog.accept());
    await context.addCookies(cookies());

    await page.goto("/admin/stranky");
    await page.getByRole("button", { name: "+ Pridať službu" }).click();
    await page.getByLabel("Názov", { exact: true }).fill("Kostolníci E2E");
    await page.getByRole("button", { name: "Vytvoriť koncept" }).click();
    await expect(page).toHaveURL(
      /\/admin\/records\/page-spolocenstva-kostolnici-e2e/
    );
    expect(
      (await page.request.get("/spolocenstva/kostolnici-e2e")).status()
    ).toBe(404);

    await page
      .getByRole("textbox", { name: "Úvod pod nadpisom", exact: true })
      .fill("Starajú sa o kostol a jeho výzdobu.");
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("Pridajte sa k službe pri kostole.");
    await page.getByRole("button", { name: "+ Blok kariet" }).click();
    await page
      .getByLabel("Nadpis karty", { exact: true })
      .fill("Upratovanie kostola");
    await page
      .getByLabel("Text karty", { exact: true })
      .fill("Každú sobotu ráno.");
    await page.getByRole("button", { name: "Uložiť", exact: true }).click();
    await expect(
      page.getByText("Uložené. Obsah zostáva súkromný.")
    ).toBeVisible();
    await page.getByRole("switch", { name: "Zverejnenie na webe" }).click();
    await expect(
      page.getByRole("switch", { name: "Zverejnenie na webe" })
    ).toHaveAttribute("aria-checked", "true");

    const text = await visibleMain(page, "spolocenstva/kostolnici-e2e");
    expect(text).toContain("Kostolníci E2E");
    expect(text).toContain("Pridajte sa k službe pri kostole.");
    expect(text).toContain("Upratovanie kostola");

    await page.goto("/");
    await expect(
      page.locator('main a[href="/spolocenstva/kostolnici-e2e"]').first()
    ).toBeVisible();
    await expect(
      page.locator('header a[href="/spolocenstva/kostolnici-e2e"]').first()
    ).toBeAttached();
    expect(errors).toEqual([]);
  });
});
