import { spawn } from "node:child_process";
import { lstat, mkdir, realpath } from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "../environment";

export function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function parseDatabaseUrl(value: string | undefined) {
  if (!value)
    throw new Error("A required database environment variable is missing.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("A database URL has an invalid format.");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.pathname.slice(1) ||
    url.hash
  )
    throw new Error("A database URL has an invalid format.");
  return url;
}

export function databaseIdentity(value: string) {
  const url = parseDatabaseUrl(value);
  // Neon pooled/direct endpoints name the same database.
  return `${url.hostname.toLowerCase().replace(/-pooler\./, ".")}:${
    url.port || "5432"
  }/${decodeURIComponent(url.pathname.slice(1))}`;
}

export function postgresEnvironment(value: string): NodeJS.ProcessEnv {
  const url = parseDatabaseUrl(value);
  const environment = { ...process.env };
  for (const key of Object.keys(environment))
    if (
      key.startsWith("PG") ||
      ["DATABASE_URL", "RESTORE_DATABASE_URL", "BACKUP_DATABASE_URL"].includes(
        key
      )
    )
      delete environment[key];
  const local = ["localhost", "127.0.0.1", "[::1]", ""].includes(url.hostname);
  const sslMode =
    url.searchParams.get("sslmode") ?? (local ? "prefer" : "require");
  if (
    ![
      "disable",
      "allow",
      "prefer",
      "require",
      "verify-ca",
      "verify-full"
    ].includes(sslMode) ||
    (!local && ["disable", "allow", "prefer"].includes(sslMode))
  )
    throw new Error("Remote database connections require TLS.");
  Object.assign(environment, {
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE: sslMode,
    PGCONNECT_TIMEOUT: "15",
    PGAPPNAME: "farazv-maintenance"
  });
  for (const [parameter, variable] of [
    ["options", "PGOPTIONS"],
    ["sslrootcert", "PGSSLROOTCERT"],
    ["sslcert", "PGSSLCERT"],
    ["sslkey", "PGSSLKEY"],
    ["channel_binding", "PGCHANNELBINDING"]
  ]) {
    if (url.searchParams.has(parameter))
      environment[variable] = url.searchParams.get(parameter)!;
  }
  return environment;
}

export async function privateFile(
  value: string | undefined,
  createDirectories: boolean
) {
  if (!value) throw new Error("Specify an explicit file under .private/.");
  const destination = path.resolve(projectRoot, value);
  const privateRoot = path.join(projectRoot, ".private");
  if (!destination.startsWith(`${privateRoot}${path.sep}`))
    throw new Error(
      "Files must remain inside the ignored .private/ directory."
    );
  if (createDirectories)
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  const privateStat = await lstat(privateRoot);
  if (privateStat.isSymbolicLink())
    throw new Error("The private directory must not be a symbolic link.");
  const actualParent = await realpath(path.dirname(destination));
  const actualPrivate = await realpath(privateRoot);
  if (
    actualParent !== actualPrivate &&
    !actualParent.startsWith(`${actualPrivate}${path.sep}`)
  )
    throw new Error("The destination resolves outside the private directory.");
  try {
    if ((await lstat(destination)).isSymbolicLink())
      throw new Error("A backup file must not be a symbolic link.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return destination;
}

export async function runPostgresTool(
  binary: string,
  args: string[],
  environment: NodeJS.ProcessEnv,
  stdout: number | "ignore" = "ignore"
) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(binary, args, {
      env: environment,
      shell: false,
      stdio: ["ignore", stdout, "pipe"]
    });
    // Do not forward provider errors: they can contain connection credentials or data.
    child.stderr?.resume();
    child.on("error", () =>
      reject(
        new Error(
          "The PostgreSQL client could not start. Check the installed binary and its version."
        )
      )
    );
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `The PostgreSQL operation failed (exit ${
                code ?? "unknown"
              }). No credentials or database output were logged.`
            )
          )
    );
  });
}
