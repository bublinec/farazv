import { loadLocalEnvironment, projectRoot } from "./environment";
import { open, unlink } from "node:fs/promises";
import path from "node:path";
import {
  argument,
  parseDatabaseUrl,
  postgresEnvironment,
  privateFile,
  runPostgresTool
} from "./operations/lib";

async function main() {
  loadLocalEnvironment();
  const source = process.env.BACKUP_DATABASE_URL || process.env.DATABASE_URL;
  parseDatabaseUrl(source);
  const destination = await privateFile(argument("--output"), true);
  const output = await open(destination, "wx", 0o600);
  try {
    await runPostgresTool(
      process.env.PG_DUMP_BIN || "pg_dump",
      ["--format=custom", "--no-owner", "--no-acl", "--no-password"],
      postgresEnvironment(source!),
      output.fd
    );
    await output.close();
    console.log(
      `Backup created: ${path.relative(
        projectRoot,
        destination
      )}. Copy it to the designated encrypted off-device location.`
    );
  } catch (error) {
    await output.close();
    await unlink(destination);
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error && !error.message.includes("://")
      ? error.message
      : "Backup failed. Check private configuration and the PostgreSQL client."
  );
  process.exitCode = 1;
});
