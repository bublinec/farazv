import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadLocalEnvironment } from "../../scripts/environment";
import { Client } from "pg";
import { heroImage, aerialImage } from "../../src/content/assets";
import { siteSettings } from "../../src/content/fixtures";
import { addDays } from "../../src/lib/calendar";
import {
  test,
  expect,
  type Page,
  type APIRequestContext
} from "@playwright/test";
import type {
  ContentRecord,
  ContentRecordFor,
  RecordKind,
  EditorialDocument,
  SettingsDocument
} from "../../src/content/documents";

loadLocalEnvironment();

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";
const enabled = process.env.ADMIN_E2E === "1";
const origin = new URL(baseURL).origin;
const browserErrors = new WeakMap<Page, string[]>();

function editorCookies(testEmail?: string) {
  const helper = pathToFileURL(
    path.resolve("tests/helpers/editor-session.ts")
  ).href;
  const source = `import {createEditorCookies} from ${JSON.stringify(
    helper
  )};const email=process.env.ADMIN_TEST_EMAIL||process.env.ADMIN_EMAIL_ALLOWLIST.split(/[,\\s]+/).filter(Boolean)[0];process.stdout.write(JSON.stringify(await createEditorCookies({email})));`;
  const output = execFileSync(
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
      env: { ...process.env, ADMIN_TEST_EMAIL: testEmail ?? "" }
    }
  );
  return JSON.parse(output.trim().split("\n").at(-1)!);
}

async function create<K extends RecordKind>(
  request: APIRequestContext,
  kind: K,
  weekStart?: string
): Promise<ContentRecordFor<K>> {
  const response = await request.post("/api/admin/records", {
    headers: { Origin: origin },
    data: { kind, weekStart }
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function write<K extends RecordKind>(
  request: APIRequestContext,
  record: ContentRecordFor<K>,
  document: unknown,
  action = "save"
): Promise<ContentRecordFor<K>> {
  const response =
    action === "save"
      ? await request.put(`/api/admin/records/${record.id}`, {
          headers: { Origin: origin },
          data: { version: record.version, document }
        })
      : await request.post(`/api/admin/records/${record.id}/${action}`, {
          headers: { Origin: origin },
          data: { version: record.version, document }
        });
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}

async function article(page: Page): Promise<ContentRecordFor<"article">> {
  const record = await create(page.request, "article");
  const stamp = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const document = {
    ...record.draft,
    title: `E2E článok ${stamp}`,
    slug: stamp,
    excerpt: "Úvod testovacieho článku",
    body: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Pôvodný text testovacieho článku." }]
        }
      ]
    }
  };
  return write(page.request, record, document);
}

test.describe("Local authenticated editorial administration", () => {
  test.skip(
    !enabled,
    "Set ADMIN_E2E=1 only for an isolated local test database and matching auth origin."
  );
  test.beforeAll(() => {
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL).hostname)
    )
      throw new Error(
        "Admin end-to-end tests require a local loopback server."
      );
    const database = new URL(process.env.DATABASE_URL || "http://invalid/");
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(database.hostname) ||
      !/(?:e2e|test)/i.test(database.pathname)
    )
      throw new Error(
        "Admin tests require an explicitly named isolated loopback test database."
      );
    if (process.env.BETTER_AUTH_URL !== origin)
      throw new Error("BETTER_AUTH_URL must match the isolated test server.");
  });
  test.beforeEach(async ({ context, page }) => {
    const errors: string[] = [];
    browserErrors.set(page, errors);
    page.on("pageerror", (error) => errors.push(error.message));
    await context.addCookies(editorCookies());
  });
  test.afterEach(async ({ page }) => {
    expect(browserErrors.get(page) ?? []).toEqual([]);
  });
  test("anonymous and unlisted identities cannot read drafts, write or sign uploads", async ({
    page,
    context
  }) => {
    const record = await article(page);
    await context.clearCookies();
    expect(
      (await page.request.get(`/api/admin/records/${record.id}`)).status()
    ).toBe(401);
    expect(
      (
        await page.request.post("/api/admin/records", {
          headers: { Origin: origin },
          data: { kind: "article" }
        })
      ).status()
    ).toBe(401);
    expect(
      (
        await page.request.post("/api/admin/uploads/sign", {
          headers: { Origin: origin },
          data: { filename: "a.png", mimeType: "image/png", size: 100 }
        })
      ).status()
    ).toBe(401);
    await page.goto(`/admin/preview/${record.id}`);
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText(record.title, { exact: true })).toHaveCount(0);
    await context.addCookies(editorCookies("unlisted-editor@example.test"));
    expect(
      (await page.request.get(`/api/admin/records/${record.id}`)).status()
    ).toBe(403);
    expect(
      (
        await page.request.post("/api/admin/uploads/sign", {
          headers: { Origin: origin },
          data: { filename: "a.png", mimeType: "image/png", size: 100 }
        })
      ).status()
    ).toBe(403);
  });
  test("create, visually edit, privately preview, publish and unpublish an article", async ({
    page
  }) => {
    const record = await article(page);
    const publicUrl = `/farnost/nase-spolocenstvo/${
      (record.draft as EditorialDocument).slug
    }`;
    expect((await page.request.get(publicUrl)).status()).toBe(404);
    await page.goto(`/admin/records/${record.id}`);
    await expect(
      page.getByRole("heading", { name: record.title, exact: true })
    ).toBeVisible();
    await page
      .getByLabel("Názov", { exact: true })
      .fill(`${record.title} upravený`);
    const body = page.getByRole("textbox", { name: "Obsah článku" });
    await expect(body).toBeVisible();
    await body.click();
    await page.keyboard.press("ControlOrMeta+End");
    await page.keyboard.type(" Doplnený text.");
    await page
      .getByRole("button", { name: "Uložiť koncept", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Koncept je uložený");
    await page
      .getByRole("button", { name: "Súkromný náhľad", exact: true })
      .click();
    await expect(page).toHaveURL(`/admin/preview/${record.id}`);
    await expect(
      page.getByText("Doplnený text.", { exact: false })
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
    await page
      .getByRole("link", { name: "Späť na úpravu", exact: false })
      .click();
    await page.getByRole("button", { name: /^Zverejniť(?: zmeny)?$/ }).click();
    await expect(page.getByRole("status")).toContainText("Zverejnené");
    const latest: ContentRecord = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect((latest.published as EditorialDocument).title).toBe(
      `${record.title} upravený`
    );
    const publicPage = await page.request.get(publicUrl);
    expect(publicPage.status()).toBe(200);
    expect(await publicPage.text()).toContain("Doplnený text.");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Stiahnuť z webu", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Stiahnuté z webu");
    const after: ContentRecord = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect(after.published).toBeNull();
    expect((await page.request.get(publicUrl)).status()).toBe(404);
    expect((after.draft as EditorialDocument).title).toBe(
      `${record.title} upravený`
    );
  });
  test("dirty preview saves first and a dirty unpublish preserves the local draft", async ({
    page
  }) => {
    let record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    await page
      .getByLabel("Názov", { exact: true })
      .fill("E2E uložiť pred náhľadom");
    await page
      .getByRole("button", { name: "Uložiť a otvoriť náhľad", exact: true })
      .click();
    await expect(page).toHaveURL(`/admin/preview/${record.id}`);
    await expect(
      page.getByRole("heading", {
        name: "E2E uložiť pred náhľadom",
        exact: true
      })
    ).toBeVisible();
    record = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect((record.draft as EditorialDocument).title).toBe(
      "E2E uložiť pred náhľadom"
    );

    record = await write(page.request, record, record.draft, "publish");
    await page.goto(`/admin/records/${record.id}`);
    await page
      .getByLabel("Názov", { exact: true })
      .fill("E2E neuložený koncept po stiahnutí");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Stiahnuť z webu", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Máte neuložené zmeny"
    );
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E neuložený koncept po stiahnutí"
    );
    const unpublished = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect(unpublished.published).toBeNull();
    expect(unpublished.draft.title).toBe("E2E uložiť pred náhľadom");

    await page
      .getByRole("button", { name: "Uložiť koncept", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Koncept je uložený");
    const saved = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect(saved.draft.title).toBe("E2E neuložený koncept po stiahnutí");
    expect(saved.version).toBe(unpublished.version + 1);
    expect(saved.published).toBeNull();
  });
  test("conflicting editor saves preserve local text and permit an explicit reload", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    await page
      .getByLabel("Názov", { exact: true })
      .fill("E2E moja neuložená verzia");
    await write(page.request, record, {
      ...record.draft,
      title: "E2E iný editor"
    });
    await page
      .getByRole("button", { name: "Uložiť koncept", exact: true })
      .click();
    await expect(page.locator("main").getByRole("alert")).toContainText(
      "medzitým"
    );
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E moja neuložená verzia"
    );
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Načítať aktuálnu verziu" }).click();
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E iný editor"
    );
  });
  test("dirty internal navigation warns and cancellation preserves the form", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    await page.getByLabel("Názov", { exact: true }).fill("E2E neodchádzať");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("link", { name: "Späť na prehľad" }).click();
    await expect(page).toHaveURL(`/admin/records/${record.id}`);
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E neodchádzať"
    );
  });
  test("dirty sign-out cancellation keeps the editor and session", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    await page
      .getByLabel("Názov", { exact: true })
      .fill("E2E zostať prihlásený");
    let signOutRequests = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/api/auth/sign-out")) signOutRequests++;
    });

    page.once("dialog", (dialog) => dialog.dismiss());
    await page
      .getByRole("button", { name: "Odhlásiť sa", exact: true })
      .click();
    await expect(page).toHaveURL(`/admin/records/${record.id}`);
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E zostať prihlásený"
    );
    expect(signOutRequests).toBe(0);
    expect(
      (await page.request.get(`/api/admin/records/${record.id}`)).status()
    ).toBe(200);
  });
  test("seven-day bulletin supports intentions, deliberate no-Mass days and announcements", async ({
    page
  }) => {
    const previous = await (
      await page.request.get(
        "/api/admin/records?kind=bulletin&query=2034-01-02"
      )
    ).json();
    for (const item of previous.items) {
      if (item.isPublished && item.weekStart === "2034-01-02") {
        const oldRecord = await (
          await page.request.get(`/api/admin/records/${item.id}`)
        ).json();
        await write(page.request, oldRecord, undefined, "unpublish");
      }
    }
    const record = await create(page.request, "bulletin", "2034-01-02");
    await page.goto(`/admin/records/${record.id}`);
    const monday = page
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "pondelok" }) })
      .first();
    await expect(monday).toBeVisible();
    await monday.getByLabel("Stav rozpisu").selectOption("scheduled");
    if (!(await monday.getByLabel("Čas", { exact: true }).count()))
      await monday.getByRole("button", { name: "Pridať svätú omšu" }).click();
    await monday.getByLabel("Čas", { exact: true }).first().fill("18:00");
    await monday
      .getByLabel("Úmysel", { exact: true })
      .first()
      .fill("Za farnosť – test");
    await monday
      .getByLabel("Celebrant", { exact: true })
      .first()
      .fill("Testovací celebrant");
    const tuesday = page
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "utorok" }) })
      .first();
    await tuesday.locator("summary").click();
    await tuesday.getByLabel("Stav rozpisu").selectOption("no-masses");
    await page
      .getByRole("button", { name: "Pridať oznam", exact: false })
      .click();
    await page.getByLabel("Oznam 1", { exact: true }).fill("E2E farský oznam");
    await page
      .getByRole("button", { name: "Pridať dar alebo zbierku", exact: false })
      .click();
    await page.getByLabel("Suma / poznámka", { exact: true }).fill("25 €");
    await page.getByLabel(/^Kategória daru/).fill("Na charitu");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await page.getByRole("button", { name: /^Zverejniť(?: zmeny)?$/ }).click();
    await expect(page.getByRole("status")).toContainText("Zverejnené");
    const latest: ContentRecord = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    const published = latest.published as {
      days: { date: string; status: string; masses: { intention: string }[] }[];
      announcements: string[];
      donations: { label: string; amount: string; category: string }[];
    };
    expect(published.days).toHaveLength(7);
    expect(published.days[0].date).toBe("2034-01-02");
    expect(published.days[0].masses[0].intention).toContain("Za farnosť");
    expect(published.days[1].status).toBe("no-masses");
    expect(published.announcements).toContain("E2E farský oznam");
    expect(published.donations).toContainEqual({
      label: "",
      amount: "25 €",
      category: "Na charitu"
    });
    await page
      .getByRole("button", { name: "Súkromný náhľad", exact: true })
      .click();
    await expect(page.getByText("Na charitu:", { exact: true })).toBeVisible();
  });
  test("settings expose contacts, Náuky, donations and a recurring template without a JSON editor", async ({
    page
  }) => {
    let record = await create(page.request, "settings");
    const previousSettings: SettingsDocument = {
      ...record.draft,
      ...(!record.published ? siteSettings : {})
    };
    record = await write(page.request, record, {
      ...previousSettings,
      regularSchedule: { ...previousSettings.regularSchedule, 1: [] }
    });
    await page.goto(`/admin/records/${record.id}`);
    await expect(
      page.getByRole("heading", { name: "Náuky a prípravné stretnutia" })
    ).toBeVisible();
    await page
      .getByLabel("Telefón farského úradu", { exact: true })
      .fill("+421 900 123 456");
    const monday = page
      .locator("details")
      .filter({ has: page.locator("summary", { hasText: "Pondelok" }) })
      .first();
    await monday.locator("summary").click();
    await monday.getByRole("button", { name: "Pridať svätú omšu" }).click();
    await monday.getByLabel("Čas", { exact: true }).last().fill("06:30");
    await page.getByRole("button", { name: /^Zverejniť(?: zmeny)?$/ }).click();
    await expect(page.getByRole("status")).toContainText("Zverejnené");
    await expect(
      page.getByRole("button", { name: "Stiahnuť z webu" })
    ).toHaveCount(0);
    const latest: ContentRecord = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect(
      (latest.published as SettingsDocument).regularSchedule[1].at(-1)?.time
    ).toBe("06:30");
  });
  test("failed media lookup is recoverable and keeps entered editorial values", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    await page
      .getByLabel("Názov", { exact: true })
      .fill("E2E text ostáva po chybe obrázkov");
    await page.route("**/api/admin/media?**", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Dočasná chyba knižnice" })
      })
    );
    await page
      .getByRole("button", { name: "Vybrať obrázok", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Knižnica obrázkov" });
    await expect(dialog.getByRole("alert")).toContainText("Dočasná chyba");
    await page.unroute("**/api/admin/media?**");
    await dialog.getByRole("button", { name: "Hľadať", exact: true }).click();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await dialog
      .getByRole("button", { name: "Zavrieť knižnicu obrázkov" })
      .click();
    await expect(page.getByLabel("Názov", { exact: true })).toHaveValue(
      "E2E text ostáva po chybe obrázkov"
    );
  });
  test("upload completion retries preserve the uploaded file and alt text", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    let signCalls = 0,
      providerCalls = 0,
      completeCalls = 0;
    let editorSaves = 0;
    page.on("request", (request) => {
      if (
        request.method() === "PUT" &&
        request.url().endsWith(`/api/admin/records/${record.id}`)
      )
        editorSaves++;
    });
    await page.route("**/api/admin/uploads/sign", (route) => {
      signCalls++;
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          uploadUrl: "https://api.cloudinary.com/v1_1/e2e/image/upload",
          fields: { timestamp: "1", signature: "test-only" },
          ticket: "test-only-ticket",
          maxBytes: 10_000_000,
          expiresAt: new Date(Date.now() + 300000).toISOString()
        })
      });
    });
    await page.route(
      "https://api.cloudinary.com/v1_1/e2e/image/upload",
      (route) => {
        providerCalls++;
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            public_id: "e2e/test",
            secure_url:
              "https://res.cloudinary.com/dmx3wfvko/image/upload/e2e/test.png",
            width: 1,
            height: 1,
            format: "png"
          })
        });
      }
    );
    await page.route("**/api/admin/uploads/complete", (route) => {
      completeCalls++;
      if (completeCalls === 1)
        return route.fulfill({
          status: 502,
          contentType: "application/json",
          body: JSON.stringify({ error: "Dočasná chyba potvrdenia" })
        });
      const data = route.request().postDataJSON();
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          asset: {
            src: "https://res.cloudinary.com/dmx3wfvko/image/upload/e2e/test.png",
            width: 1,
            height: 1,
            alt: data.alt
          }
        })
      });
    });
    await page
      .getByRole("button", { name: "Vybrať obrázok", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Knižnica obrázkov" });
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8S0AAAAASUVORK5CYII=",
        "base64"
      )
    });
    await expect(dialog.getByRole("alert")).toContainText(
      "Dočasná chyba potvrdenia"
    );
    await dialog.getByLabel("Opis nového obrázka").fill("Pohľad na kostol");
    await dialog
      .getByRole("button", { name: "Zavrieť knižnicu obrázkov" })
      .click();
    await page
      .getByRole("button", { name: "Vybrať obrázok", exact: true })
      .click();
    await expect(dialog.getByLabel("Opis nového obrázka")).toHaveValue(
      "Pohľad na kostol"
    );
    await dialog.getByLabel("Opis nového obrázka").press("Enter");
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    expect(editorSaves).toBe(0);
    await dialog
      .getByRole("button", { name: "Zopakovať potvrdenie obrázka" })
      .click();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Použiť obrázok" }).click();
    expect(signCalls).toBe(1);
    expect(providerCalls).toBe(1);
    expect(completeCalls).toBe(2);
    await expect(page.getByLabel("Opis obrázka", { exact: true })).toHaveValue(
      "Pohľad na kostol"
    );
  });
  test("news, event and notice publication preserve route families and poster expiry", async ({
    page
  }) => {
    const entries: ContentRecord[] = [];
    for (const kind of ["news", "event", "notice"] as const) {
      let record = await create(page.request, kind);
      const slug = `e2e-${kind}-${Date.now()}`;
      const document = {
        ...record.draft,
        title: `E2E ${kind} ${slug}`,
        slug,
        showInNews: true,
        isPoster: kind === "news",
        ...(kind === "news"
          ? {
              cover: { ...heroImage, alt: "E2E testovací plagát" },
              posterExpiresOn: "2099-12-31"
            }
          : {}),
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: `E2E verejný text ${kind}` }]
            }
          ]
        }
      };
      record = await write(page.request, record, document, "publish");
      entries.push(record);
      const href =
        kind === "notice" ? `/vyveska/${slug}` : `/prispevky/${slug}`;
      const detail = await page.request.get(href);
      expect(detail.status()).toBe(200);
      expect(await detail.text()).toContain(`E2E verejný text ${kind}`);
    }
    const feed = await (await page.request.get("/api/news")).json();
    for (const record of entries) {
      const item = feed.items.find(
        (item: { id: string }) => item.id === record.id
      );
      expect(item).toBeTruthy();
      expect(item).not.toHaveProperty("body");
      expect(item).not.toHaveProperty("source");
      expect(item.href).toBe(
        record.kind === "notice"
          ? `/vyveska/${record.slug}`
          : `/prispevky/${record.slug}`
      );
    }
    await page.goto("/");
    const poster = entries[0];
    await expect(
      page
        .locator("#vyveska")
        .getByRole("heading", { name: poster.title, exact: true })
    ).toBeVisible();
    entries[0] = await write(
      page.request,
      poster,
      { ...poster.draft, posterExpiresOn: "2000-01-01" },
      "publish"
    );
    await page.reload();
    await expect(
      page
        .locator("#vyveska")
        .getByRole("heading", { name: poster.title, exact: true })
    ).toHaveCount(0);
    expect((await page.request.get(`/prispevky/${poster.slug}`)).status()).toBe(
      200
    );
    for (const record of entries)
      await write(page.request, record, undefined, "unpublish");
  });
  test("anomalous historical dates and unnamed donations remain privately readable", async ({
    page
  }) => {
    const id = `e2e-history-${Date.now()}`;
    const draft = {
      id,
      weekStart: "2034-01-02",
      days: Array.from({ length: 7 }, (_, index) => ({
        date: index === 0 ? "2034-02-31" : addDays("2034-01-02", index),
        status: "unpublished",
        masses: []
      })),
      announcements: ["E2E zachovaný historický oznam"],
      donations: [{ label: "", amount: "25 €" }]
    };
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      await client.query(
        "insert into content_records (id,kind,title,draft,read_only,source) values ($1,'bulletin',$2,$3::jsonb,true,$4::jsonb)",
        [
          id,
          "E2E história s pôvodným dátumom",
          JSON.stringify(draft),
          JSON.stringify({
            kind: "e2e",
            id,
            hash: "synthetic-test",
            importedVersion: 1,
            publishedAt: null,
            createdAt: null,
            updatedAt: null,
            anomalies: ["E2E neplatný pôvodný dátum – zachovaný"]
          })
        ]
      );
    } finally {
      await client.end();
    }
    await page.goto(`/admin/records/${id}`);
    await expect(
      page.getByText("E2E neplatný pôvodný dátum – zachovaný", { exact: true })
    ).toBeVisible();
    await expect(
      page.locator("summary").filter({ hasText: "2034-02-31" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Uložiť koncept", exact: true })
    ).toHaveCount(0);
    expect(
      (
        await page.request.put(`/api/admin/records/${id}`, {
          headers: { Origin: origin },
          data: { version: 1, document: draft }
        })
      ).status()
    ).toBe(403);
    await page.getByRole("link", { name: "Súkromný náhľad histórie" }).click();
    await expect(
      page.getByRole("heading", { name: "2034-02-31", exact: true })
    ).toBeVisible();
    await expect(page.getByText("25 €", { exact: true })).toBeVisible();
  });
  test("cache-refresh warning retries do not publish the document twice", async ({
    page
  }) => {
    const record = await article(page);
    await page.goto(`/admin/records/${record.id}`);
    let publishes = 0,
      refreshes = 0;
    await page.route(
      `**/api/admin/records/${record.id}/publish`,
      async (route) => {
        publishes++;
        const response = await route.fetch();
        const data = await response.json();
        return route.fulfill({
          response,
          json: { ...data, cacheWarning: "E2E dočasná chyba obnovenia webu" }
        });
      }
    );
    await page.route("**/api/admin/revalidate", (route) => {
      refreshes++;
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ ok: true })
      });
    });
    await page.getByRole("button", { name: "Zverejniť", exact: true }).click();
    const warning = page.locator("main").getByRole("alert");
    await expect(warning).toContainText("Obsah je uložený");
    await page
      .getByRole("button", { name: "Zopakovať obnovenie webu" })
      .click();
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText(
      "Verejný web je obnovený"
    );
    expect(publishes).toBe(1);
    expect(refreshes).toBe(1);
    const latest = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    expect(latest.version).toBe(record.version + 1);
    await write(page.request, latest, undefined, "unpublish");
  });
  test("editing imported rich text preserves gallery order, dimensions and captions", async ({
    page
  }) => {
    let record = await article(page);
    const images = [
      { ...heroImage, caption: "Prvý zachovaný titulok" },
      { ...aerialImage, caption: "Druhý zachovaný titulok" }
    ];
    record = await write(page.request, record, {
      ...record.draft,
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Úvod pred galériou" }]
          },
          { type: "imageGallery", attrs: { images } },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Záver za galériou" }]
          }
        ]
      }
    });
    await page.goto(`/admin/records/${record.id}`);
    const editor = page.getByRole("textbox", { name: "Obsah článku" });
    await expect(editor.locator("[data-parish-gallery] img")).toHaveCount(2);
    await editor.locator("p").last().click();
    await page.keyboard.press("End");
    await page.keyboard.type(" doplnený");
    await page
      .getByRole("button", { name: "Uložiť koncept", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Koncept je uložený");
    const latest = await (
      await page.request.get(`/api/admin/records/${record.id}`)
    ).json();
    const gallery = latest.draft.body.content.find(
      (node: { type: string }) => node.type === "imageGallery"
    );
    expect(gallery.attrs.images).toEqual(images);
  });
  test("switching content kinds ignores an older in-flight pagination response", async ({
    page
  }) => {
    const summary = (id: string, kind: string, title: string) => ({
      id,
      kind,
      title,
      slug: null,
      version: 1,
      publishedAt: null,
      updatedAt: "2026-10-31T12:00:00Z",
      source: null,
      readOnly: false,
      isPublished: false
    });
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/admin/records?**", async (route) => {
      const url = new URL(route.request().url());
      const kind = url.searchParams.get("kind");
      if (kind === "bulletin" && url.searchParams.has("cursor")) {
        await held;
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            items: [
              summary("late-bulletin", "bulletin", "E2E oneskorený týždeň")
            ],
            nextCursor: null
          })
        });
      }
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(
          kind === "news"
            ? {
                items: [
                  summary("current-news", "news", "E2E aktuálna novinka")
                ],
                nextCursor: null
              }
            : {
                items: [
                  summary("first-bulletin", "bulletin", "E2E prvý týždeň")
                ],
                nextCursor: "slow-page"
              }
        )
      });
    });
    try {
      await page.goto("/admin");
      await expect(
        page.getByRole("link", { name: "E2E prvý týždeň", exact: false })
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Načítať ďalšie", exact: true })
        .click();
      await page.getByRole("button", { name: "Novinky", exact: true }).click();
      await expect(
        page.getByRole("link", { name: "E2E aktuálna novinka", exact: false })
      ).toBeVisible();
      const response = page.waitForResponse(
        (result) =>
          new URL(result.url()).searchParams.get("cursor") === "slow-page"
      );
      release();
      await (await response).finished();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      );
      await expect(
        page.getByRole("link", { name: "E2E oneskorený týždeň", exact: false })
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "E2E aktuálna novinka", exact: false })
      ).toBeVisible();
    } finally {
      release();
    }
  });
  test("media search ignores an older response and keeps the newest selection", async ({
    page
  }) => {
    const record = await article(page);
    const slowAsset = { ...heroImage, alt: "E2E starý obrázok" };
    const currentAsset = { ...aerialImage, alt: "E2E aktuálny obrázok" };
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/admin/media?**", async (route) => {
      const query = new URL(route.request().url()).searchParams.get("query");
      if (query === "slow") await held;
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          items:
            query === "slow"
              ? [slowAsset]
              : query === "current"
              ? [currentAsset]
              : [],
          nextCursor: null
        })
      });
    });

    try {
      await page.goto(`/admin/records/${record.id}`);
      await page
        .getByRole("button", { name: "Vybrať obrázok", exact: true })
        .click();
      const dialog = page.getByRole("dialog", { name: "Knižnica obrázkov" });
      await expect(
        dialog.getByText("Žiadne obrázky nezodpovedajú hľadaniu.")
      ).toBeVisible();
      const search = dialog.getByRole("textbox", { name: "Hľadať obrázky" });
      await search.fill("slow");
      await search.press("Enter");
      await search.fill("current");
      await search.press("Enter");
      await expect(
        dialog.getByRole("button", {
          name: "E2E aktuálny obrázok",
          exact: false
        })
      ).toBeVisible();
      await dialog
        .getByRole("button", { name: "E2E aktuálny obrázok", exact: false })
        .click();

      const response = page.waitForResponse((result) => {
        const url = new URL(result.url());
        return (
          url.pathname === "/api/admin/media" &&
          url.searchParams.get("query") === "slow"
        );
      });
      release();
      await (await response).finished();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      );
      await expect(
        dialog.getByRole("button", { name: "E2E starý obrázok", exact: false })
      ).toHaveCount(0);
      await expect(
        dialog.getByLabel("Opis obrázka (alternatívny text)")
      ).toHaveValue("E2E aktuálny obrázok");
      await dialog
        .getByRole("button", { name: "Použiť obrázok", exact: true })
        .click();
      await expect(
        page.getByLabel("Opis obrázka", { exact: true })
      ).toHaveValue("E2E aktuálny obrázok");
    } finally {
      release();
    }
  });
  test("admin editorial form has no horizontal overflow at narrow widths", async ({
    page
  }) => {
    const record = await article(page);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/admin/records/${record.id}`);
      await expect(
        page.getByRole("textbox", { name: "Obsah článku" })
      ).toBeVisible();
      const sizes = await page.evaluate(() => ({
        viewport: window.innerWidth,
        content: document.documentElement.scrollWidth
      }));
      expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    }
  });
});
