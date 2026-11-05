import path from "node:path";
import { loadLocalEnvironment, projectRoot } from "./environment";
import { runSchemaMigrations } from "./migration/schema-migrations";

loadLocalEnvironment();
try {
  const connection = process.env.DATABASE_URL?.trim();
  if (!connection) throw new Error("Database connection is not configured.");

  await runSchemaMigrations(connection, path.join(projectRoot, "drizzle"));
  console.log("Database schema migrations completed.");
} catch {
  console.error(
    "Database migration failed. Check connectivity and database permissions; no credentials were logged."
  );
  process.exitCode = 1;
}
