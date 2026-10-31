import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../../../../remake/package.json", import.meta.url)
);
const { chromium } = require("@playwright/test");
const baseUrl = new URL(process.argv[2] || "http://invalid");

if (
  baseUrl.protocol !== "http:" ||
  !["127.0.0.1", "localhost"].includes(baseUrl.hostname) ||
  !baseUrl.port ||
  baseUrl.port === "3100"
) {
  throw new Error(
    "Provide an explicitly owned local server, outside port 3100."
  );
}

const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : { channel: "chromium" })
});
const output = fileURLToPath(new URL("./", import.meta.url));
const captures = [];

try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }]
  ]) {
    const context = await browser.newContext({
      viewport,
      locale: "sk-SK",
      timezoneId: "Europe/Bratislava",
      reducedMotion: "reduce",
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydration|hydrating|Minified React error/i.test(message.text())
      )
        runtimeErrors.push(message.text());
    });
    await page.goto(new URL("/design/v2", baseUrl).toString());
    if (new URL(page.url()).origin !== baseUrl.origin)
      throw new Error(`The design selector changed origin to ${page.url()}`);
    await page.locator('[data-public-design="parish"]').waitFor();

    for (const [name, route] of [
      ["home", "/"],
      ["history", "/farnost/kostol-sv-alzbety"],
      ["baptism", "/sviatosti/sviatost-krstu"]
    ]) {
      runtimeErrors.length = 0;
      const response = await page.goto(new URL(route, baseUrl).toString());
      if (response?.status() !== 200) {
        throw new Error(`${route} returned ${response?.status()}`);
      }

      await page.locator('[data-public-design="parish"]').waitFor();
      const headings = await page.locator("h1").allTextContents();
      const expectedHeading = {
        history: "Kostol sv. Alžbety",
        baptism: "Sviatosť krstu"
      }[name];
      if (
        headings.length !== 1 ||
        (expectedHeading && headings[0] !== expectedHeading)
      ) {
        throw new Error(
          `Unexpected heading on ${route}: ${headings.join(", ")}`
        );
      }

      await page.evaluate(async () => {
        await document.fonts.ready;
        for (
          let position = 0;
          position < document.documentElement.scrollHeight;
          position += window.innerHeight
        ) {
          window.scrollTo(0, position);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await Promise.race([
          Promise.all(
            Array.from(document.images).map((image) =>
              image.decode().catch(() => undefined)
            )
          ),
          new Promise((resolve) => setTimeout(resolve, 10_000))
        ]);
        window.scrollTo(0, 0);
      });

      if (name === "home") {
        await page.screenshot({
          path: fileURLToPath(
            new URL(
              `../../../../remake/.private/design-v2-top-${device}.png`,
              import.meta.url
            )
          ),
          fullPage: false,
          type: "png",
          animations: "disabled"
        });
      }

      const filename = `${name}-${device}.jpg`;
      await page.screenshot({
        path: `${output}${filename}`,
        fullPage: true,
        type: "jpeg",
        quality: 86,
        animations: "disabled"
      });
      captures.push({
        filename,
        sha256: createHash("sha256")
          .update(readFileSync(`${output}${filename}`))
          .digest("hex"),
        route,
        status: response.status(),
        viewport,
        runtimeErrors: [...runtimeErrors],
        heading: await page.locator("h1").allTextContents(),
        layout: await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          pageWidth: document.documentElement.scrollWidth,
          displayFont: getComputedStyle(document.querySelector("h1"))
            .fontFamily,
          parishVariant: Boolean(
            document.querySelector('[data-public-design="parish"]')
          )
        })),
        unresolvedImages: await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .filter((image) => !image.complete || image.naturalWidth === 0)
              .map((image) => image.getAttribute("src"))
          )
      });
      if (runtimeErrors.length)
        throw new Error(
          `Runtime errors on ${route}: ${runtimeErrors.join("; ")}`
        );
      console.log(`Captured ${filename}`);
    }

    await context.close();
  }

  writeFileSync(
    `${output}captures.json`,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        design: "parish",
        selector: "/design/v2",
        fixtureDate: "2026-10-31",
        locale: "sk-SK",
        timezone: "Europe/Bratislava",
        captures
      },
      null,
      2
    )}\n`
  );
} finally {
  await browser.close();
}
