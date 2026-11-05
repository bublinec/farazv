import assert from "node:assert/strict";
import { test } from "node:test";
import {
  runVercelBuild,
  shouldMigrateProduction
} from "../scripts/vercel-build";
import { migrationConnectionUrl } from "../scripts/migration/schema-migrations";
const production = {
  NODE_ENV: "production" as const,
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_GIT_COMMIT_REF: "main",
  CONTENT_SOURCE: "database",
  DATABASE_URL: "postgresql://test@localhost/test"
};
test("only main production deployment migrates; local and preview builds never do", async () => {
  for (const env of [
    { NODE_ENV: "test" as const },
    { ...production, VERCEL: "0" },
    {
      ...production,
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "filip/upravy"
    }
  ]) {
    assert.equal(shouldMigrateProduction(env), false);
    const steps: string[][] = [];
    await runVercelBuild(env, async (args) => {
      steps.push(args);
    });
    assert.equal(steps.length, 1);
    assert.equal(steps[0].at(-1), "build");
  }
  for (const env of [
    { ...production, VERCEL_GIT_COMMIT_REF: "" },
    { ...production, VERCEL_GIT_COMMIT_REF: "filip/upravy" },
    { ...production, DATABASE_URL: "" },
    { ...production, CONTENT_SOURCE: "fixtures" }
  ])
    assert.throws(() => shouldMigrateProduction(env));
});
test("production awaits migrations before building and never builds after a migration failure", async () => {
  const steps: string[][] = [];
  await runVercelBuild(production, async (args) => {
    steps.push(args);
  });
  assert.equal(steps.length, 2);
  assert.equal(steps[0].at(-1), "scripts/migrate.ts");
  assert.equal(steps[1].at(-1), "build");
  let calls = 0;
  await assert.rejects(
    runVercelBuild(production, async () => {
      calls++;
      throw new Error("failed migration");
    })
  );
  assert.equal(calls, 1);
});
test("schema migration uses the same Neon endpoint directly so session locks work", () => {
  const original =
    "postgresql://user:fake@ep-example-pooler.eu-central-1.aws.neon.tech/parish?sslmode=require";
  const direct = new URL(migrationConnectionUrl(original));
  assert.equal(direct.hostname, "ep-example.eu-central-1.aws.neon.tech");
  assert.equal(direct.pathname, "/parish");
  assert.equal(direct.searchParams.get("sslmode"), "require");
  assert.equal(
    migrationConnectionUrl(production.DATABASE_URL),
    new URL(production.DATABASE_URL).href
  );
  assert.throws(() => migrationConnectionUrl("https://example.test"));
});
