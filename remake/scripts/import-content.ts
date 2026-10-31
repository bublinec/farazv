import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadLocalEnvironment, projectRoot } from "./environment";
import { buildMigration } from "./migration/build-migration";
import { parseDump } from "./migration/parse-dump";
import { attachMediaAudit, type MediaAudit } from "./migration/audit-media";

/** Nothing is written to the database without the explicit --apply flag. */
export async function main(args = process.argv.slice(2)): Promise<void> {
  loadLocalEnvironment();
  const pathIndex = args.indexOf("--dump");
  if (
    pathIndex < 0 ||
    !args[pathIndex + 1] ||
    args[pathIndex + 1].startsWith("--")
  )
    throw new Error(
      "Usage: npm run content:import -- --dump /private/path/dump.sql [--apply] [--export-private]"
    );
  const known = new Set(["--dump", "--apply", "--export-private", "--dry-run"]);
  for (const [index, argument] of args.entries())
    if (index !== pathIndex + 1 && !known.has(argument))
      throw new Error("Unknown migration argument");
  if (args.includes("--apply") && args.includes("--dry-run"))
    throw new Error("Choose --apply or --dry-run");
  const result = buildMigration(await parseDump(resolve(args[pathIndex + 1])));
  try {
    attachMediaAudit(
      result.media,
      JSON.parse(
        await readFile(join(projectRoot, ".private/media-audit.json"), "utf8")
      ) as MediaAudit
    );
  } catch {
    /* Availability is optional; source content and URLs remain intact. */
  }
  if (result.report.unresolvedComponents.length)
    throw new Error(
      "Unresolved source components; inspect the aggregate report before importing"
    );
  await mkdir(join(projectRoot, ".private"), { recursive: true, mode: 0o700 });
  await writeFile(
    join(projectRoot, ".private/migration-report.json"),
    `${JSON.stringify(result.report, null, 2)}\n`,
    { mode: 0o600 }
  );
  if (args.includes("--export-private"))
    await writeFile(
      join(projectRoot, ".private/migration-content.json"),
      `${JSON.stringify(result)}\n`,
      { mode: 0o600 }
    );
  // This is the sole standard output: counts, source IDs and anomaly codes.
  console.log(JSON.stringify(result.report, null, 2));
  if (args.includes("--apply")) {
    const { importMigration } = await import("./migration/apply-import");
    const outcome = await importMigration(result, { dryRun: false });
    console.log(JSON.stringify({ databaseImport: outcome }, null, 2));
  } else console.log("Dry run complete. No database content was changed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error: unknown) => {
    // SQL/client errors may contain parameters. Avoid echoing their contents.
    const safeMessage =
      error instanceof Error &&
      /^(Usage:|Unknown migration argument|Choose --apply|Unresolved source components|Malformed COPY row|Unsupported COPY declaration|Invalid COPY columns|Duplicate COPY table|Truncated COPY data|Cyclic legacy component|Duplicate slug within)/.test(
        error.message
      );
    console.error(
      safeMessage
        ? error.message
        : "Migration failed; inspect the private server log without publishing source content."
    );
    process.exitCode = 1;
  });
}
