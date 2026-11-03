import { loadLocalEnvironment } from "./environment";
import { stat } from "node:fs/promises";
import { Client } from "pg";
import {
  argument,
  databaseIdentity,
  parseDatabaseUrl,
  postgresEnvironment,
  privateFile,
  runPostgresTool
} from "./operations/lib";

async function main() {
  loadLocalEnvironment();
  const source = process.env.BACKUP_DATABASE_URL || process.env.DATABASE_URL;
  const target = process.env.RESTORE_DATABASE_URL;
  parseDatabaseUrl(source);
  const targetUrl = parseDatabaseUrl(target);
  if (databaseIdentity(source!) === databaseIdentity(target!))
    throw new Error(
      "Restore refused: source and target identify the same database."
    );
  if (
    argument("--target-name") !==
    decodeURIComponent(targetUrl.pathname.slice(1))
  )
    throw new Error(
      "Restore refused: --target-name must exactly match the separate target database name."
    );
  const archive = await privateFile(argument("--input"), false);
  const info = await stat(archive);
  if (!info.isFile() || !info.size || info.mode & 0o077)
    throw new Error(
      "The archive must be a nonempty private file with permissions 0600."
    );
  // A separate, existing, empty database must be provisioned before this command.
  const client = new Client({
    connectionString: target,
    connectionTimeoutMillis: 15000
  });
  try {
    await client.connect();
    const objects = await client.query(`
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
      UNION ALL SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
      UNION ALL SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
      UNION ALL SELECT 1 FROM pg_namespace WHERE nspname !~ '^pg_' AND nspname NOT IN ('public', 'information_schema')
      UNION ALL SELECT 1 FROM pg_extension WHERE extname <> 'plpgsql'
      LIMIT 1
    `);
    if (objects.rows.length)
      throw new Error(
        "Restore refused: the target database contains user objects. Create a fresh empty target instead."
      );
  } finally {
    await client.end();
  }
  await runPostgresTool(
    process.env.PG_RESTORE_BIN || "pg_restore",
    [
      "--dbname",
      decodeURIComponent(targetUrl.pathname.slice(1)),
      "--single-transaction",
      "--exit-on-error",
      "--no-owner",
      "--no-acl",
      "--no-password",
      archive
    ],
    postgresEnvironment(target!)
  );
  console.log(
    "Restore completed into the separate target. Run schema, count, publication and media checks before changing the application connection."
  );
}

main().catch((error: unknown) => {
  // Driver errors can contain provider diagnostics. Only expose our own safe errors.
  const message = error instanceof Error ? error.message : "";
  console.error(
    /^(Restore refused:|The archive must|The PostgreSQL|A required database|A database URL|Files must|Specify an explicit|Remote database)/.test(
      message
    )
      ? message
      : "Restore failed. Check the private target configuration, archive and PostgreSQL client. No database content or credentials were logged."
  );
  process.exitCode = 1;
});
