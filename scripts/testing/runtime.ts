import { loadLocalEnvironment, projectRoot } from "../environment";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { Client } from "pg";
import { parseDatabaseUrl } from "../operations/lib";

export interface OwnedDatabase {
  url: string;
  bootstrapUrl: string;
  cleanup(): Promise<void>;
}

/** Local PostgreSQL with CREATEDB permission; no remote endpoint is ever contacted. */
export async function localTestDatabase(
  prefix: "farazv_remake_admin_e2e_test" | "farazv_remake_store_test",
  create = true
): Promise<OwnedDatabase> {
  loadLocalEnvironment();
  const bootstrap = parseDatabaseUrl(
    process.env.TEST_POSTGRES_URL || process.env.DATABASE_URL
  );
  if (!["127.0.0.1", "localhost", "[::1]"].includes(bootstrap.hostname))
    throw new Error(
      "Tests require TEST_POSTGRES_URL pointing to loopback PostgreSQL with permission to create databases."
    );
  bootstrap.pathname = "/postgres";
  const administrator = new Client({
    connectionString: bootstrap.href,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000
  });
  const databaseName = `${prefix}_${Date.now()}_${randomBytes(5).toString(
    "hex"
  )}`;
  const target = new URL(bootstrap);
  target.pathname = `/${databaseName}`;
  let reserved = false;
  try {
    await administrator.connect();
    const exists = await administrator.query(
      "SELECT 1 FROM pg_database WHERE datname=$1",
      [databaseName]
    );
    if (exists.rowCount)
      throw new Error(
        "Generated test database already exists; refusing to modify it."
      );
    reserved = true;
    if (create) await administrator.query(`CREATE DATABASE "${databaseName}"`);
  } catch {
    await administrator.end();
    throw new Error(
      "Cannot create an isolated local test database. Check TEST_POSTGRES_URL and local CREATEDB permissions; no connection values were logged."
    );
  }
  return {
    url: target.href,
    bootstrapUrl: bootstrap.href,
    async cleanup() {
      try {
        if (reserved) {
          // Only the generated, previously absent target can be touched here.
          await administrator.query(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()",
            [databaseName]
          );
          await administrator.query(
            `DROP DATABASE IF EXISTS "${databaseName}"`
          );
        }
      } finally {
        await administrator.end();
      }
    }
  };
}

export async function availableLoopbackPort(
  preferred?: string
): Promise<number> {
  const port = preferred ? Number(preferred) : 0;
  if (
    !Number.isSafeInteger(port) ||
    port < 0 ||
    port > 65535 ||
    (preferred && port < 1024)
  )
    throw new Error(
      "ADMIN_E2E_PORT must be an unoccupied port between 1024 and 65535."
    );
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", () =>
      reject(
        new Error(
          "The requested local test port is occupied. Existing servers are never reused or stopped."
        )
      )
    );
    probe.listen(port, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        probe.close();
        reject(new Error("Unable to allocate a loopback test port."));
        return;
      }
      probe.close(() => resolve(address.port));
    });
  });
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export interface OwnedProcess {
  child: ChildProcess;
  finished: Promise<number>;
  stop(): Promise<void>;
}

export function startOwnedProcess(
  args: string[],
  environment: NodeJS.ProcessEnv,
  quiet = false
): OwnedProcess {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    env: environment,
    shell: false,
    detached: process.platform !== "win32",
    stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit"
  });
  const finished = new Promise<number>((resolve) => {
    child.once("error", () => resolve(1));
    child.once("exit", (code) => resolve(code ?? 1));
  });
  if (quiet) {
    child.stdout?.resume();
    child.stderr?.resume();
  }
  function signal(value: NodeJS.Signals) {
    if (!child.pid) return;
    try {
      if (process.platform === "win32") child.kill(value);
      else process.kill(-child.pid, value);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
  }
  return {
    child,
    finished,
    async stop() {
      signal("SIGTERM");
      const exited = await Promise.race([
        finished.then(() => true),
        delay(5000).then(() => false)
      ]);
      // The group may still contain descendants even when its original leader exited.
      if (!exited) signal("SIGKILL");
      else if (process.platform !== "win32" && child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        }
      }
      await finished;
    }
  };
}

export function interruptibleProcesses() {
  const children: OwnedProcess[] = [];
  let interrupted = false;
  const interrupt = () => {
    interrupted = true;
    process.exitCode = 130;
    void Promise.allSettled(children.map((child) => child.stop()));
  };
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);
  return {
    start(args: string[], environment: NodeJS.ProcessEnv, quiet = false) {
      if (interrupted) throw new Error("Test run interrupted.");
      const child = startOwnedProcess(args, environment, quiet);
      children.push(child);
      return child;
    },
    assertRunning() {
      if (interrupted) throw new Error("Test run interrupted.");
    },
    async cleanup() {
      await Promise.allSettled(children.map((child) => child.stop()));
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", interrupt);
    }
  };
}

export async function waitForOwnedServer(
  server: OwnedProcess,
  origin: string,
  assertRunning: () => void
) {
  let ready = false;
  let exited = false;
  server.child.stdout?.on("data", (chunk) => {
    if (String(chunk).includes("Ready in")) ready = true;
  });
  void server.finished.then(() => {
    exited = true;
  });
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    assertRunning();
    if (exited)
      throw new Error(
        "Owned test server exited before readiness. Stop an existing Next dev server if it owns .next/dev/lock; run typecheck/build to diagnose startup errors."
      );
    if (ready) {
      try {
        const response = await fetch(`${origin}/admin/login`, {
          signal: AbortSignal.timeout(3000),
          redirect: "manual"
        });
        if (response.status === 200 && !exited) return;
      } catch {
        /* Keep waiting for the owned process only. */
      }
    }
    await delay(250);
  }
  throw new Error("Owned test server did not become ready within two minutes.");
}
