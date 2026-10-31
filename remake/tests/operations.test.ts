import assert from "node:assert/strict";
import { test } from "node:test";
import {
  databaseIdentity,
  parseDatabaseUrl,
  postgresEnvironment,
  privateFile
} from "../scripts/operations/lib";

test("maintenance connections keep passwords out of arguments and resolve pooled/direct database identity", () => {
  const url =
    "postgresql://editor:private%2Bpassword@ep-example-pooler.eu-central-1.aws.neon.tech/parish?sslmode=require&channel_binding=require";
  const environment = postgresEnvironment(url);
  assert.equal(environment.PGPASSWORD, "private+password");
  assert.equal(environment.PGUSER, "editor");
  assert.equal(environment.PGSSLMODE, "require");
  assert.equal(environment.PGCHANNELBINDING, "require");
  assert.equal(environment.DATABASE_URL, undefined);
  assert.equal(
    databaseIdentity(url),
    databaseIdentity(
      "postgresql://other:another@ep-example.eu-central-1.aws.neon.tech/parish?sslmode=verify-full"
    )
  );
  assert.notEqual(
    databaseIdentity(url),
    databaseIdentity(
      "postgresql://editor@ep-example.eu-central-1.aws.neon.tech/restore_check"
    )
  );
});

test("maintenance refuses malformed URLs, remote plaintext connections and public backup paths", async () => {
  assert.throws(() => parseDatabaseUrl(undefined));
  assert.throws(() => parseDatabaseUrl("https://example.test/database"));
  assert.throws(() =>
    postgresEnvironment(
      "postgresql://editor:secret@remote.example.test/parish?sslmode=disable"
    )
  );
  assert.equal(
    postgresEnvironment("postgresql://editor@localhost/parish?sslmode=disable")
      .PGSSLMODE,
    "disable"
  );
  await assert.rejects(privateFile("public/backup.dump", false), /private/);
  await assert.rejects(
    privateFile(".private/../../public/backup.dump", false),
    /private/
  );
  await assert.rejects(privateFile(undefined, false), /explicit/);
});
