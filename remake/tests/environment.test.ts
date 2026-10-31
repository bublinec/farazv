import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { loadLocalEnvironment } from "../scripts/environment";

test("CLI environment precedence is process, .env.local, then .env", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "farazv-env-test-"));
  const keys = [
    "FARAZV_TEST_PROCESS",
    "FARAZV_TEST_LOCAL",
    "FARAZV_TEST_DEFAULT"
  ];
  const previous = keys.map((key) => process.env[key]);
  try {
    await writeFile(
      path.join(directory, ".env.local"),
      "FARAZV_TEST_PROCESS=local\nFARAZV_TEST_LOCAL=local\n"
    );
    await writeFile(
      path.join(directory, ".env"),
      "FARAZV_TEST_PROCESS=default\nFARAZV_TEST_LOCAL=default\nFARAZV_TEST_DEFAULT=default\n"
    );
    process.env.FARAZV_TEST_PROCESS = "process";
    delete process.env.FARAZV_TEST_LOCAL;
    delete process.env.FARAZV_TEST_DEFAULT;

    loadLocalEnvironment(directory);
    assert.equal(process.env.FARAZV_TEST_PROCESS, "process");
    assert.equal(process.env.FARAZV_TEST_LOCAL, "local");
    assert.equal(process.env.FARAZV_TEST_DEFAULT, "default");
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
    await rm(directory, { recursive: true, force: true });
  }
});
