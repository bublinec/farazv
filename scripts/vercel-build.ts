import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Preview and local builds never run schema migrations through this entry point. */
export function shouldMigrateProduction(env: NodeJS.ProcessEnv): boolean {
  if (env.VERCEL !== "1" || env.VERCEL_ENV !== "production") return false;

  if (env.VERCEL_GIT_COMMIT_REF !== "main")
    throw new Error(
      "Production schema migration requires the main Git branch and exposed Vercel system variables."
    );
  if (env.CONTENT_SOURCE !== "database" || !env.DATABASE_URL?.trim())
    throw new Error(
      "Production requires CONTENT_SOURCE=database and a private DATABASE_URL."
    );

  return true;
}

type BuildStep = (args: string[], env: NodeJS.ProcessEnv) => Promise<void>;
const executeNode: BuildStep = (args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      env,
      stdio: "inherit",
      shell: false
    });
    child.once("error", () =>
      reject(new Error("Cannot start the deployment build step."))
    );
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              "Deployment step failed; the new deployment was not built."
            )
          )
    );
  });

export async function runVercelBuild(
  env: NodeJS.ProcessEnv = process.env,
  execute: BuildStep = executeNode
) {
  const migrate = shouldMigrateProduction(env);

  if (migrate)
    await execute(
      ["--conditions=react-server", "--import", "tsx", "scripts/migrate.ts"],
      env
    );
  await execute(["node_modules/next/dist/bin/next", "build"], env);
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  runVercelBuild().catch((error) => {
    // Messages contain only build policy/step names, never connection values.
    console.error(
      error instanceof Error ? error.message : "Deployment build failed."
    );
    process.exitCode = 1;
  });
}
