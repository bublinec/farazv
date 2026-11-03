/** Repeatable local lab measurements, not field Core Web Vitals or a Lighthouse score. */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Browser, type Page } from "@playwright/test";
const { values } = parseArgs({
  options: {
    "base-url": { type: "string", default: "http://127.0.0.1:3101" },
    output: { type: "string" },
    route: { type: "string" }
  }
});
const base = new URL(values["base-url"]!);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) ||
  base.username ||
  base.password
)
  throw new Error(
    "Use a local production preview origin without URL credentials."
  );
const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync(localChrome) ? localChrome : undefined);
const browser = await chromium.launch(
  executablePath ? { executablePath } : { headless: true }
);
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);
const editorFingerprints = [
  "ProseMirror-trailingBreak",
  "ProseMirror-separator",
  "ProseMirror-widget",
  "tiptap-extension"
];
async function measure(browser: Browser, route: string, width: number) {
  const context = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 1000 },
    deviceScaleFactor: 1,
    locale: "sk-SK",
    timezoneId: "Europe/Bratislava",
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  const scriptReads: Promise<{
    path: string;
    bytes: number;
    editorFingerprint: string[];
  }>[] = [];
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message.slice(0, 300)));
  page.on("response", (response) => {
    if (!new URL(response.url()).pathname.endsWith(".js")) return;
    scriptReads.push(
      response
        .body()
        .then((body) => ({
          path: new URL(response.url()).pathname,
          bytes: body.byteLength,
          editorFingerprint: editorFingerprints.filter((marker) =>
            body.includes(marker)
          )
        }))
        .catch(() => ({
          path: new URL(response.url()).pathname,
          bytes: 0,
          editorFingerprint: []
        }))
    );
  });
  await page.addInitScript(() => {
    const metrics = { lcpMs: 0, cls: 0, longTaskCount: 0, longTaskMs: 0 };
    (window as Window & { __parishMetrics?: typeof metrics }).__parishMetrics =
      metrics;
    for (const type of [
      "largest-contentful-paint",
      "layout-shift",
      "longtask"
    ]) {
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "largest-contentful-paint")
              metrics.lcpMs = entry.startTime;
            else if (entry.entryType === "layout-shift") {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) metrics.cls += shift.value;
            } else {
              metrics.longTaskCount++;
              metrics.longTaskMs += entry.duration;
            }
          }
        }).observe({ type, buffered: true });
      } catch {
        /* An unsupported browser metric stays explicitly zero. */
      }
    }
  });
  const response = await page.goto(new URL(route, base).href, {
    waitUntil: "load",
    timeout: 30000
  });
  await page.evaluate(() => document.fonts.ready);
  await page
    .waitForLoadState("networkidle", { timeout: 15000 })
    .catch(() => {});
  // Two frames let observer callbacks and image fallback state commit before collection.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  const initial = await collect(page);
  // User-like scrolling samples layout movement and lazy image delivery without opening galleries.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += Math.max(500, window.innerHeight * 0.8)
    ) {
      window.scrollTo(0, y);
      await new Promise<void>((resolve) => setTimeout(resolve, 120));
    }
  });
  await page
    .waitForLoadState("networkidle", { timeout: 15000 })
    .catch(() => {});
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  const afterScroll = await collect(page);
  const scripts = await Promise.all(scriptReads);
  const uniqueScripts = [
    ...new Map(scripts.map((script) => [script.path, script])).values()
  ];
  const editorRuntimeScripts = uniqueScripts.filter(
    (script) => script.editorFingerprint.length
  );
  const result = {
    route,
    width,
    status: response?.status() ?? null,
    initial,
    afterScroll,
    scriptRequests: scripts.length,
    scriptFiles: uniqueScripts.length,
    scriptDecodedBytes: uniqueScripts.reduce(
      (total, script) => total + script.bytes,
      0
    ),
    editorRuntimeScripts,
    pageErrors
  };
  await context.close();
  return result;
}
async function collect(page: Page) {
  return page.evaluate(() => {
    const metrics = (
      window as Window & {
        __parishMetrics?: {
          lcpMs: number;
          cls: number;
          longTaskCount: number;
          longTaskMs: number;
        };
      }
    ).__parishMetrics;
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];
    const images = Array.from(document.images);
    const currentImageUrls = new Set(
      images.map((image) => image.currentSrc).filter(Boolean)
    );
    return {
      observedEntryTypes: PerformanceObserver.supportedEntryTypes.filter(
        (type) =>
          ["largest-contentful-paint", "layout-shift", "longtask"].includes(
            type
          )
      ),
      lcpMs: Math.round(metrics?.lcpMs ?? 0),
      cls: Number((metrics?.cls ?? 0).toFixed(4)),
      longTaskCount: metrics?.longTaskCount ?? 0,
      longTaskMs: Math.round(metrics?.longTaskMs ?? 0),
      ttfbMs: Math.round(navigation.responseStart),
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      loadMs: Math.round(navigation.loadEventEnd),
      htmlDecodedBytes: navigation.decodedBodySize,
      domElements: document.querySelectorAll("*").length,
      domImages: images.length,
      lazyImages: images.filter((image) => image.loading === "lazy").length,
      decodedImages: images.filter(
        (image) => image.complete && image.naturalWidth > 0
      ).length,
      brokenImages: images.filter(
        (image) =>
          image.complete && image.naturalWidth === 0 && image.currentSrc
      ).length,
      imageFallbacks: document.querySelectorAll(".mediaMissing").length,
      imageRequests: resources.filter(
        (resource) =>
          resource.initiatorType === "img" ||
          currentImageUrls.has(resource.name)
      ).length,
      resourceTransferBytes: resources.reduce(
        (total, resource) => total + resource.transferSize,
        0
      ),
      editorDomElements: document.querySelectorAll(".tiptap,.ProseMirror")
        .length,
      horizontalOverflow:
        document.documentElement.scrollWidth > window.innerWidth
    };
  });
}
try {
  const api = await browser.newContext();
  const response = await api.request.get(new URL("/api/articles", base).href);
  if (!response.ok())
    throw new Error("Public article summaries are unavailable.");
  const { items } = await response.json();
  await api.close();
  if (!items?.length)
    throw new Error("An article is required for the lab sample.");
  const article =
    items[0].href || `/farnost/nase-spolocenstvo/${items[0].slug}`;
  if (values.route && !/^\/(?!\/)/.test(values.route))
    throw new Error("Use a local absolute page path for --route.");
  const cases: [string, number][] = values.route
    ? [[values.route, 390]]
    : [
        ["/", 1440],
        ["/", 390],
        ["/farnost/farske-oznamy", 390],
        [article, 390],
        ["/farnost/galeria", 390]
      ];
  const measurements = [];
  for (const [route, width] of cases) {
    console.error(`Measuring public ${route} at ${width}px…`);
    measurements.push(await measure(browser, route, width));
  }
  const report = {
    capturedAt: new Date().toISOString(),
    origin: base.origin,
    browser: browser.version(),
    node: process.version,
    next: packageJson.dependencies.next,
    method:
      "One cold browser context per route at deviceScaleFactor 1, production localhost server, no CPU/network throttle, real Cloudinary delivery, initial view then scroll; server/CDN cache state uncontrolled.",
    limitations: [
      "Single local lab samples are not field Core Web Vitals or production SLOs.",
      "Cross-origin transfer sizes can be hidden by Timing-Allow-Origin; script bytes are decoded response bodies.",
      "CLS after scroll includes layout shifts during this automated traversal; no interaction latency/INP is measured."
    ],
    measurements
  };
  const json = JSON.stringify(report, null, 2);
  if (values.output) {
    const destination = path.resolve(values.output);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, `${json}\n`);
    console.log(
      `Performance report written: ${path.relative(process.cwd(), destination)}`
    );
  } else console.log(json);
  if (
    measurements.some(
      (item) =>
        item.status !== 200 ||
        item.editorRuntimeScripts.length ||
        item.pageErrors.length ||
        item.initial.horizontalOverflow ||
        item.afterScroll.horizontalOverflow ||
        item.afterScroll.brokenImages ||
        item.afterScroll.editorDomElements
    )
  ) {
    console.error(
      "A public runtime, image-fallback, overflow or editor-bundle invariant failed; inspect the report."
    );
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
