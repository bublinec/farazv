import {
  interruptibleProcesses,
  localTestDatabase,
  type OwnedDatabase
} from "./testing/runtime";

const processes = interruptibleProcesses();
let database: OwnedDatabase | undefined;
try {
  database = await localTestDatabase("farazv_remake_store_test");
  processes.assertRunning();
  const child = processes.start(
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "--test",
      "tests/lectors.integration.test.ts"
    ],
    {
      ...process.env,
      DATABASE_URL: database.url,
      LECTOR_INTEGRATION: "1",
      LECTOR_PASSCODE: "",
      BETTER_AUTH_URL: "http://127.0.0.1:3198",
      SITE_URL: "http://127.0.0.1:3198",
      BETTER_AUTH_SECRET:
        "local-only-lector-tests-not-used-for-any-deployment-12345",
      GOOGLE_CLIENT_ID: "local-lector-test",
      GOOGLE_CLIENT_SECRET: "local-lector-test",
      ADMIN_EMAIL_ALLOWLIST: "admin@local-tests.example.test"
    }
  );
  if (await child.finished) throw new Error("Lector integration tests failed.");
} catch {
  console.error(
    "Lector integration setup or tests failed; only a disposable loopback database is allowed."
  );
  process.exitCode = 1;
} finally {
  await processes.cleanup();
  if (database) await database.cleanup();
}
