import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

/** Neon pooled/direct hosts name the same endpoint; migrations need session locks. */
export function migrationConnectionUrl(value: string): string {
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("PostgreSQL connection required.");

  if (url.hostname.endsWith(".neon.tech")) {
    const labels = url.hostname.split(".");
    labels[0] = labels[0].replace(/-pooler$/, "");
    url.hostname = labels.join(".");
  }

  return url.href;
}

/** One dedicated direct session serializes journal reads and all pending migrations. */
export async function runSchemaMigrations(
  connection: string,
  folder: string
): Promise<void> {
  const client = new Client({
    connectionString: migrationConnectionUrl(connection),
    connectionTimeoutMillis: 10000,
    statement_timeout: 120000,
    lock_timeout: 60000,
    application_name: "farazv-schema-migration"
  });

  try {
    await client.connect();
    await client.query("SELECT pg_advisory_lock($1, $2)", [1943781, 1]);
    await migrate(drizzle(client), { migrationsFolder: folder });
  } finally {
    // Ending the session releases the lock after both success and failure.
    await client.end();
  }
}
