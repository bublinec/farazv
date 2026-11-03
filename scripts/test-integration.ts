import {
  interruptibleProcesses,
  localTestDatabase,
  type OwnedDatabase
} from "./testing/runtime";

async function main() {
  const processes = interruptibleProcesses();
  let database: OwnedDatabase | undefined;
  try {
    // The test itself creates this verified-absent target and removes it normally.
    // The wrapper also owns its unique name so interruption cleanup can remove it.
    database = await localTestDatabase("farazv_remake_store_test", false);
    processes.assertRunning();
    const child = processes.start(
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        "--test",
        "tests/content-store.integration.test.ts"
      ],
      {
        ...process.env,
        DATABASE_URL: database.bootstrapUrl,
        TEST_DATABASE_URL: database.url
      }
    );
    if (await child.finished)
      throw new Error("Isolated PostgreSQL integration tests failed.");
  } finally {
    await processes.cleanup();
    if (database) await database.cleanup();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  console.error(
    /^(Tests require|Cannot create an isolated|Test run interrupted|Isolated PostgreSQL)/.test(
      message
    )
      ? message
      : "Local integration test setup or cleanup failed. Check TEST_POSTGRES_URL and local database permissions; no connection values were logged."
  );
  process.exitCode ||= 1;
});
