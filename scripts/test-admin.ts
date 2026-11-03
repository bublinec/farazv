import { randomBytes } from "node:crypto";
import {
  availableLoopbackPort,
  interruptibleProcesses,
  localTestDatabase,
  waitForOwnedServer,
  type OwnedDatabase
} from "./testing/runtime";

/** Local-only fixture credentials. They never enter .env files or deployed configuration. */
async function main() {
  const processes = interruptibleProcesses();
  let database: OwnedDatabase | undefined;
  try {
    const port = await availableLoopbackPort(process.env.ADMIN_E2E_PORT);
    database = await localTestDatabase("farazv_remake_admin_e2e_test");
    processes.assertRunning();
    const origin = `http://127.0.0.1:${port}`;
    const production = process.env.ADMIN_E2E_SERVER === "production";
    const environment: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: production ? "production" : "development",
      DATABASE_URL: database.url,
      CONTENT_SOURCE: "database",
      SITE_URL: origin,
      SITE_INDEXING_ENABLED: "false",
      PREVIEW_DATE: "2026-10-31",
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
      GOOGLE_CLIENT_ID: "local-test-only-client.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET:
        "local-test-only-google-provider-no-real-credentials",
      ADMIN_EMAIL_ALLOWLIST: "editor@local-tests.example.test",
      ADMIN_TEST_EMAIL: "",
      CLOUDINARY_CLOUD_NAME: "test-only-local",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
      CLOUDINARY_URL: "",
      ADMIN_E2E: "1",
      PLAYWRIGHT_BASE_URL: origin,
      PLAYWRIGHT_EXTERNAL_SERVER: "1",
      NEXT_TELEMETRY_DISABLED: "1"
    };
    console.log(
      "Preparing an isolated local admin test database; no production provider credentials are used."
    );
    const migration = processes.start(
      ["--conditions=react-server", "--import", "tsx", "scripts/migrate.ts"],
      environment
    );
    if (await migration.finished)
      throw new Error("Isolated admin test schema migration failed.");
    processes.assertRunning();
    const server = processes.start(
      [
        "node_modules/next/dist/bin/next",
        production ? "start" : "dev",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port)
      ],
      environment,
      true
    );
    await waitForOwnedServer(server, origin, processes.assertRunning);
    const browser = processes.start(
      [
        "node_modules/@playwright/test/cli.js",
        "test",
        "tests/browser/admin.spec.ts",
        ...process.argv.slice(2)
      ],
      environment
    );
    if (await browser.finished) throw new Error("Admin browser tests failed.");
    console.log(
      "Admin browser tests passed. Cleaning up the owned server and isolated database."
    );
  } finally {
    await processes.cleanup();
    if (database) await database.cleanup();
  }
}

main().catch((error: unknown) => {
  // PostgreSQL/provider diagnostics can contain configuration; report only our own messages.
  const message = error instanceof Error ? error.message : "";
  console.error(
    /^(Tests require|Cannot create an isolated|The requested local|ADMIN_E2E_PORT|Unable to allocate|Test run interrupted|Owned test server|Isolated admin|Admin browser)/.test(
      message
    )
      ? message
      : "Local admin test setup or cleanup failed. Check local PostgreSQL and stop any existing Next dev server; no connection values were logged."
  );
  process.exitCode ||= 1;
});
