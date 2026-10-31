import path from "node:path";
import { loadLocalEnvironment, projectRoot } from "./environment";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb, closeDb } from "../src/server/db";
loadLocalEnvironment();
try {
  await migrate(getDb(), {
    migrationsFolder: path.join(projectRoot, "drizzle")
  });
  console.log("Database schema migrations completed.");
} catch {
  console.error(
    "Database migration failed. Check connectivity and database permissions; no credentials were logged."
  );
  process.exitCode = 1;
} finally {
  await closeDb();
}
