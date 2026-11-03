import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const localChrome =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync(localChrome) ? localChrome : undefined);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    locale: "sk-SK",
    timezoneId: "Europe/Bratislava",
    ...(executablePath
      ? { launchOptions: { executablePath } }
      : { channel: "chromium" }),
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer:
    process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1"
      ? undefined
      : {
          command: `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${
            new URL(baseURL).port || "3100"
          }`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            PREVIEW_DATE: process.env.PREVIEW_DATE || "2026-10-31",
            CONTENT_SOURCE:
              process.env.ADMIN_E2E === "1" ? "database" : "fixtures"
          }
        }
});
