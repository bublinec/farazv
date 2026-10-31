import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../../../../remake/package.json", import.meta.url)
);
const { chromium } = require("@playwright/test");
const baseUrl = new URL(process.argv[2] || "http://invalid");
const selectedCapture = process.argv[3];
if (
  selectedCapture &&
  !/^(?:(?:history|baptism)-(?:desktop|mobile)|marriage-mobile)$/.test(
    selectedCapture
  )
)
  throw new Error("Unknown capture name.");
if (
  baseUrl.protocol !== "http:" ||
  !["127.0.0.1", "localhost"].includes(baseUrl.hostname) ||
  !baseUrl.port ||
  baseUrl.port === "3100"
)
  throw new Error(
    "Provide an explicitly owned local server outside port 3100."
  );

const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : { channel: "chromium" })
});
const output = fileURLToPath(new URL("./", import.meta.url));
const captures = selectedCapture
  ? JSON.parse(readFileSync(`${output}captures.json`, "utf8")).captures.filter(
      (capture) => capture.filename !== `${selectedCapture}.jpg`
    )
  : [];

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
    await page.goto(new URL("/design/v2", baseUrl).toString());

    for (const [name, route] of [
      ["history", "/farnost/kostol-sv-alzbety"],
      ["baptism", "/sviatosti/sviatost-krstu"],
      ...(device === "mobile"
        ? [["marriage", "/sviatosti/sviatost-manzelstva"]]
        : [])
    ]) {
      if (selectedCapture && selectedCapture !== `${name}-${device}`) continue;

      runtimeErrors.length = 0;
      const response = await page.goto(new URL(route, baseUrl).toString());
      if (response?.status() !== 200)
        throw new Error(`${route} returned ${response?.status()}`);
      await page.locator('[data-public-design="parish"]').waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (
          let position = 0;
          position < document.documentElement.scrollHeight;
          position += innerHeight
        ) {
          scrollTo(0, position);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        await Promise.race([
          Promise.all(
            Array.from(document.images).map((image) =>
              image.decode().catch(() => undefined)
            )
          ),
          new Promise((resolve) => setTimeout(resolve, 10_000))
        ]);
        scrollTo(0, 0);
      });

      const filename = `${name}-${device}.jpg`;
      await page.screenshot({
        path: `${output}${filename}`,
        fullPage: true,
        type: "jpeg",
        quality: 86,
        animations: "disabled"
      });
      await page.screenshot({
        path: fileURLToPath(
          new URL(
            `../../../../remake/.private/details-${name}-${device}-top.png`,
            import.meta.url
          )
        ),
        animations: "disabled"
      });

      const layout = await page.evaluate(() => {
        const nav = document.querySelector(
          'nav[aria-label="Na tejto stránke"]'
        );
        const paragraph = document.querySelector("main .prose p");
        const style = paragraph && getComputedStyle(paragraph);
        return {
          viewportWidth: innerWidth,
          pageWidth: document.documentElement.scrollWidth,
          paragraph: paragraph && {
            width: paragraph.getBoundingClientRect().width,
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            lineHeight: style.lineHeight
          },
          headingGaps: Array.from(
            document.querySelectorAll('main [id^="citanie-"]')
          )
            .filter((heading) => heading.previousElementSibling)
            .map((heading) => ({
              id: heading.id,
              gap:
                heading.getBoundingClientRect().top -
                heading.previousElementSibling.getBoundingClientRect().bottom
            })),
          readingHeadingSizes: Array.from(
            document.querySelectorAll(
              "main .prose h2, main .prose h3, main .prose h4"
            )
          ).map((heading) => ({
            level: heading.tagName,
            fontSize: getComputedStyle(heading).fontSize
          })),
          contents: nav
            ? Array.from(nav.querySelectorAll("a")).map((link) => ({
                label: link.textContent,
                href: link.getAttribute("href"),
                targetHeight: link.getBoundingClientRect().height,
                targetExists: Boolean(
                  document.getElementById(link.hash.slice(1))
                )
              }))
            : []
        };
      });
      const jump = page
        .getByRole("navigation", { name: "Na tejto stránke", exact: true })
        .getByRole("link", {
          name: {
            baptism: "Čo priniesť?",
            history: "Duchovný život v minulosti",
            marriage: "Príprava na sviatosť manželstva"
          }[name],
          exact: true
        });
      let jumpResult;
      if (await jump.count()) {
        await jump.click();
        jumpResult = await page.evaluate(() => ({
          hash: location.hash,
          focusId: document.activeElement?.id,
          targetTop: document
            .getElementById(location.hash.slice(1))
            ?.getBoundingClientRect().top
        }));
      }
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
        layout,
        jumpResult,
        unresolvedImages: await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .filter((image) => !image.complete || image.naturalWidth === 0)
              .map((image) => image.getAttribute("src"))
          )
      });
      if (
        runtimeErrors.length ||
        layout.contents.some(
          (link) => !link.targetExists || link.targetHeight < 44
        )
      )
        throw new Error(`Failed runtime or contents check on ${route}`);
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
