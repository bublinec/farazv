import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { sep } from "node:path";
import { runSchemaMigrations } from "../scripts/migration/schema-migrations";
import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb, getPool, closeDb } from "../src/server/db";
import {
  grantEditorAccess,
  changeEditorRole,
  revokeEditorAccess,
  getEditorRole
} from "../src/server/editor-access";
import { createEditorCookieHeader } from "./helpers/editor-session";
import { getNextLocalMidnight } from "../src/lib/calendar";
import { lectorMonths } from "../src/lib/lector-schedules";
import { GET as list } from "../src/app/api/admin/lectors/route";
import {
  GET as adminPdf,
  PUT as upload,
  DELETE as remove
} from "../src/app/api/admin/lectors/[month]/route";
import { POST as unlock } from "../src/app/api/lectors/unlock/route";
import { GET as publicList } from "../src/app/api/lectors/route";
import { GET as publicPdf } from "../src/app/api/lectors/[month]/route";
import { DELETE as lock } from "../src/app/api/lectors/session/route";

const origin = "http://127.0.0.1:3198";
const pdf = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
);
const admin = "admin@local-tests.example.test";
const lector = "lector@local-tests.example.test";
const editor = "writer@local-tests.example.test";
function req(
  path: string,
  method = "GET",
  headers: Record<string, string> = {},
  body?: BodyInit
) {
  return new Request(`${origin}${path}`, {
    method,
    headers: { origin, ...headers },
    ...(body === undefined ? {} : { body })
  });
}
const context = (month: string) => ({ params: Promise.resolve({ month }) });
function privateResponse(response: Response) {
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
}

test(
  "private lector files, live roles and password sessions",
  { skip: process.env.LECTOR_INTEGRATION !== "1", timeout: 120000 },
  async (t) => {
    const target = new URL(process.env.DATABASE_URL!);
    assert.ok(["localhost", "127.0.0.1"].includes(target.hostname));
    assert.match(target.pathname, /^\/farazv_remake_store_test_[a-z0-9_]+$/);
    try {
      await t.test(
        "deployment migrations serialize concurrent runs, are repeatable and retain existing data",
        async () => {
          await Promise.all(
            [1, 2, 3].map(() =>
              runSchemaMigrations(process.env.DATABASE_URL!, resolve("drizzle"))
            )
          );
          const before = (
            await getPool().query(
              "SELECT count(*)::int AS total, count(DISTINCT hash)::int AS unique FROM drizzle.__drizzle_migrations"
            )
          ).rows[0];
          assert.equal(before.total, 7);
          assert.equal(before.unique, 7);
          await getPool().query(
            "INSERT INTO editor_access(email,granted_by) VALUES ('migration-retained@local-tests.example.test','local-fixture')"
          );
          await runSchemaMigrations(
            process.env.DATABASE_URL!,
            resolve("drizzle")
          );
          assert.equal(
            (
              await getPool().query(
                "SELECT role FROM editor_access WHERE email='migration-retained@local-tests.example.test'"
              )
            ).rows[0].role,
            "editor"
          );
          assert.equal(
            (
              await getPool().query(
                "SELECT count(*)::int AS total FROM drizzle.__drizzle_migrations"
              )
            ).rows[0].total,
            7
          );
        }
      );
      await t.test(
        "a failed SQL migration rolls back and releases its deployment lock",
        async () => {
          const root = resolve(".private");
          await mkdir(root, { recursive: true });
          const folder = await mkdtemp(resolve(root, "failed-schema-"));
          if (!resolve(folder).startsWith(root + sep))
            throw new Error("Unexpected private fixture path");
          try {
            await mkdir(resolve(folder, "meta"));
            await writeFile(
              resolve(folder, "meta/_journal.json"),
              JSON.stringify({
                version: "7",
                dialect: "postgresql",
                entries: [
                  {
                    idx: 0,
                    version: "7",
                    when: 9000000000000,
                    tag: "0000_failure",
                    breakpoints: true
                  }
                ]
              })
            );
            await writeFile(
              resolve(folder, "0000_failure.sql"),
              "CREATE TABLE migration_rollback_probe(id integer);\n--> statement-breakpoint\nSELECT 1/0;\n"
            );
            await assert.rejects(
              runSchemaMigrations(process.env.DATABASE_URL!, folder)
            );
            assert.equal(
              (
                await getPool().query(
                  "SELECT to_regclass('public.migration_rollback_probe') AS probe"
                )
              ).rows[0].probe,
              null
            );
            await runSchemaMigrations(
              process.env.DATABASE_URL!,
              resolve("drizzle")
            );
            assert.equal(
              (
                await getPool().query(
                  "SELECT count(*)::int AS total FROM drizzle.__drizzle_migrations"
                )
              ).rows[0].total,
              7
            );
          } finally {
            await rm(folder, { recursive: true, force: true });
          }
        }
      );
      await migrate(getDb(), { migrationsFolder: resolve("drizzle") });
      await grantEditorAccess(lector, admin, "lektorka");
      await grantEditorAccess(editor, admin);
      const lectorCookie = await createEditorCookieHeader({ email: lector });
      const editorCookie = await createEditorCookieHeader({ email: editor });
      const adminCookie = await createEditorCookieHeader({ email: admin });
      const [month, next] = lectorMonths();

      await t.test(
        "CMS grants cannot create or promote an administrator",
        async () => {
          await assert.rejects(
            grantEditorAccess(
              "not-admin@local-tests.example.test",
              admin,
              "admin"
            )
          );
          await assert.rejects(
            changeEditorRole(editor, "admin", "editor", admin)
          );
          assert.equal(await getEditorRole(editor), "editor");
        }
      );
      await t.test(
        "existing grants default to editor and protected administrators cannot be changed",
        async () => {
          assert.equal(await getEditorRole(editor), "editor");
          await assert.rejects(
            changeEditorRole(admin, "lektorka", "admin", admin)
          );
          await assert.rejects(revokeEditorAccess(admin, admin));
          await assert.rejects(
            grantEditorAccess("bad@local.test", admin, "owner")
          );
          await changeEditorRole(editor, "lektorka", "editor", admin);
          assert.equal(await getEditorRole(editor), "lektorka");
          await assert.rejects(
            changeEditorRole(editor, "lektorka", "editor", admin)
          );
          await changeEditorRole(editor, "editor", "lektorka", admin);
        }
      );

      await t.test(
        "LEKTORKA is denied every existing admin API including media, uploads and previews",
        async () => {
          const modules: [string, string[]][] = [
            ["records/route", ["GET", "POST"]],
            ["records/[id]/route", ["GET", "PUT"]],
            ["records/[id]/publish/route", ["POST"]],
            ["records/[id]/unpublish/route", ["POST"]],
            ["bulletins/open/route", ["POST"]],
            ["bulletins/preview-context/route", ["GET"]],
            ["bulletins/import/route", ["POST"]],
            ["media/route", ["GET"]],
            ["uploads/sign/route", ["POST"]],
            ["uploads/complete/route", ["POST"]],
            ["revalidate/route", ["POST"]],
            ["editors/route", ["GET", "POST", "PATCH", "DELETE"]],
            ["feedback/route", ["GET"]],
            ["feedback/[id]/route", ["GET", "PATCH", "DELETE"]]
          ];
          for (const [file, methods] of modules) {
            const module = await import(`../src/app/api/admin/${file}.ts`);
            for (const method of methods) {
              if (!module[method]) continue;
              const response = await module[method](
                req("/api/admin/test", method, { cookie: lectorCookie }),
                { params: Promise.resolve({ id: "secret-record" }) }
              );
              assert.equal(response.status, 403, `${file} ${method}`);
              privateResponse(response);
            }
          }
          assert.equal(
            (
              await list(
                req("/api/admin/lectors", "GET", { cookie: lectorCookie })
              )
            ).status,
            200
          );
          assert.equal(
            (
              await list(
                req("/api/admin/lectors", "GET", { cookie: editorCookie })
              )
            ).status,
            403
          );
        }
      );

      await t.test(
        "PDFs stay private; current and next months support atomic upload, replacement and deletion",
        async () => {
          const response = await upload(
            req(
              `/api/admin/lectors/${month}`,
              "PUT",
              {
                cookie: lectorCookie,
                "content-type": "application/pdf",
                "if-match": '"0"'
              },
              pdf
            ),
            context(month)
          );
          assert.equal(response.status, 200, await response.text());
          const uploaded = await adminPdf(
            req(`/api/admin/lectors/${month}`, "GET", { cookie: lectorCookie }),
            context(month)
          );
          assert.equal(uploaded.status, 200);
          assert.deepEqual(Buffer.from(await uploaded.arrayBuffer()), pdf);
          privateResponse(uploaded);
          const conflict = await upload(
            req(
              `/api/admin/lectors/${month}`,
              "PUT",
              {
                cookie: lectorCookie,
                "content-type": "application/pdf",
                "if-match": '"0"'
              },
              pdf
            ),
            context(month)
          );
          assert.equal(conflict.status, 409);
          const results = await Promise.all(
            [1, 2].map(() =>
              upload(
                req(
                  `/api/admin/lectors/${month}`,
                  "PUT",
                  {
                    cookie: lectorCookie,
                    "content-type": "application/pdf",
                    "if-match": '"1"'
                  },
                  pdf
                ),
                context(month)
              )
            )
          );
          assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
          assert.equal(
            (
              await upload(
                req(
                  `/api/admin/lectors/${next}`,
                  "PUT",
                  {
                    cookie: lectorCookie,
                    "content-type": "application/pdf",
                    "if-match": '"0"'
                  },
                  pdf
                ),
                context(next)
              )
            ).status,
            200
          );
          assert.equal(
            (
              await remove(
                req(`/api/admin/lectors/${next}`, "DELETE", {
                  cookie: lectorCookie,
                  "if-match": '"1"'
                }),
                context(next)
              )
            ).status,
            200
          );
          assert.equal(
            (
              await upload(
                req(
                  `/api/admin/lectors/${next}`,
                  "PUT",
                  {
                    cookie: lectorCookie,
                    "content-type": "application/pdf",
                    "if-match": '"0"'
                  },
                  pdf
                ),
                context(next)
              )
            ).status,
            409
          );
          assert.equal(
            (
              await upload(
                req(
                  `/api/admin/lectors/${next}`,
                  "PUT",
                  {
                    cookie: lectorCookie,
                    "content-type": "application/pdf",
                    "if-match": '"2"'
                  },
                  pdf
                ),
                context(next)
              )
            ).status,
            200
          );
          const cross = await upload(
            req(`/api/admin/lectors/${month}`, "PUT", {
              cookie: lectorCookie,
              origin: "https://evil.test"
            }),
            context(month)
          );
          assert.equal(cross.status, 403);
          const direct = await publicPdf(
            req(`/api/lectors/${month}`),
            context(month)
          );
          assert.equal(direct.status, 401);
          privateResponse(direct);
          assert.equal((await publicList(req("/api/lectors"))).status, 401);
          assert.equal(
            (
              await unlock(
                req(
                  "/api/lectors/unlock",
                  "POST",
                  { "content-type": "application/json" },
                  JSON.stringify({ password: "abcdefgh" })
                )
              )
            ).status,
            503
          );
        }
      );

      await t.test(
        "simultaneous replacement and deletion cannot overwrite a newer PDF version",
        async () => {
          const results = await Promise.all([
            upload(
              req(
                `/api/admin/lectors/${next}`,
                "PUT",
                {
                  cookie: lectorCookie,
                  "content-type": "application/pdf",
                  "if-match": '"3"'
                },
                pdf
              ),
              context(next)
            ),
            remove(
              req(`/api/admin/lectors/${next}`, "DELETE", {
                cookie: lectorCookie,
                "if-match": '"3"'
              }),
              context(next)
            )
          ]);
          assert.deepEqual(
            results.map((response) => response.status).sort(),
            [200, 409]
          );
          const row = (
            await getPool().query(
              "SELECT version FROM lector_schedules WHERE month=$1",
              [next]
            )
          ).rows[0];
          assert.equal(row.version, 4);
          assert.equal(
            (
              await upload(
                req(
                  `/api/admin/lectors/${next}`,
                  "PUT",
                  {
                    cookie: lectorCookie,
                    "content-type": "application/pdf",
                    "if-match": '"4"'
                  },
                  pdf
                ),
                context(next)
              )
            ).status,
            200
          );
        }
      );
      await t.test(
        "server environment is the only passcode source; tokens protect every PDF and rotate immediately",
        async (passwordTest) => {
          await getPool().query(
            "INSERT INTO lector_security(id,password_hash,revision) VALUES ('lectors','unused-legacy-cms-hash',99) ON CONFLICT (id) DO UPDATE SET password_hash=excluded.password_hash, revision=99"
          );
          for (const invalid of [undefined, "", "short"]) {
            if (invalid === undefined) delete process.env.LECTOR_PASSCODE;
            else process.env.LECTOR_PASSCODE = invalid;
            const missing = await unlock(
              req(
                "/api/lectors/unlock",
                "POST",
                { "content-type": "application/json" },
                JSON.stringify({ password: "abcdefgh" })
              )
            );
            assert.equal(missing.status, 503);
            assert.equal((await missing.json()).code, "LECTOR_NOT_CONFIGURED");
          }
          process.env.LECTOR_PASSCODE = "abcdefgh";
          const bad = await unlock(
            req(
              "/api/lectors/unlock",
              "POST",
              { "content-type": "application/json" },
              JSON.stringify({ password: "wrongpwd" })
            )
          );
          assert.equal(bad.status, 401);
          const success = await unlock(
            req(
              "/api/lectors/unlock",
              "POST",
              { "content-type": "application/json" },
              JSON.stringify({ password: "abcdefgh" })
            )
          );
          assert.equal(success.status, 200);
          privateResponse(success);
          const { token } = await success.json();
          assert.match(token, /^[A-Za-z0-9_-]{43}$/);
          assert.equal(success.headers.get("set-cookie"), null);
          await passwordTest.test(
            "public PDF access switches at Bratislava month midnight",
            async (boundaryTest) => {
              const [year, monthNumber] = month.split("-").map(Number);
              const boundary = getNextLocalMidnight(
                new Date(Date.UTC(year, monthNumber, 0, 12))
              );
              const saved = await getPool().query(
                "SELECT pdf FROM lector_schedules WHERE month=$1",
                [next]
              );
              await getPool().query(
                "UPDATE lector_schedules SET pdf=$1 WHERE month=$2",
                [pdf, next]
              );
              const authorization = { authorization: `Bearer ${token}` };
              boundaryTest.mock.timers.enable({
                apis: ["Date"],
                now: boundary.getTime() - 1
              });
              try {
                assert.equal(
                  (
                    await publicPdf(
                      req(`/api/lectors/${month}`, "GET", authorization),
                      context(month)
                    )
                  ).status,
                  200
                );
                assert.equal(
                  (
                    await publicPdf(
                      req(`/api/lectors/${next}`, "GET", authorization),
                      context(next)
                    )
                  ).status,
                  404
                );
                boundaryTest.mock.timers.setTime(boundary.getTime());
                const switched = await publicList(
                  req("/api/lectors", "GET", authorization)
                );
                assert.deepEqual(
                  (await switched.json()).months.map(
                    (entry: { month: string }) => entry.month
                  ),
                  [next]
                );
                assert.equal(
                  (
                    await publicPdf(
                      req(`/api/lectors/${month}`, "GET", authorization),
                      context(month)
                    )
                  ).status,
                  404
                );
                assert.equal(
                  (
                    await publicPdf(
                      req(`/api/lectors/${next}`, "GET", authorization),
                      context(next)
                    )
                  ).status,
                  200
                );
              } finally {
                boundaryTest.mock.timers.reset();
                await getPool().query(
                  "UPDATE lector_schedules SET pdf=$1 WHERE month=$2",
                  [saved.rows[0].pdf, next]
                );
              }
            }
          );
          const headers = { authorization: `Bearer ${token}` };
          const visible = await publicList(req("/api/lectors", "GET", headers));
          assert.equal(visible.status, 200);
          const data = await visible.json();
          assert.equal(data.months.length, 1);
          assert.equal(data.months[0].month, month);
          assert.equal(
            (
              await publicPdf(
                req(`/api/lectors/${next}`, "GET", headers),
                context(next)
              )
            ).status,
            404
          );
          assert.ok(!JSON.stringify(data).includes("passwordHash"));
          assert.ok(!JSON.stringify(data).includes("updatedBy"));
          const file = await publicPdf(
            req(`/api/lectors/${month}`, "GET", headers),
            context(month)
          );
          assert.equal(file.status, 200);
          assert.deepEqual(Buffer.from(await file.arrayBuffer()), pdf);
          assert.equal(
            (
              await publicPdf(
                req(`/api/lectors/${month}?token=${token}`),
                context(month)
              )
            ).status,
            401
          );
          assert.equal(
            (
              await publicList(
                req("/api/lectors", "GET", {
                  ...headers,
                  origin: "https://evil.test"
                })
              )
            ).status,
            403
          );
          process.env.LECTOR_PASSCODE = "newpass8";
          assert.equal(
            (await publicList(req("/api/lectors", "GET", headers))).status,
            401
          );
          assert.equal(
            (
              await publicPdf(
                req(`/api/lectors/${month}`, "GET", headers),
                context(month)
              )
            ).status,
            401
          );

          const renewed = await unlock(
            req(
              "/api/lectors/unlock",
              "POST",
              { "content-type": "application/json" },
              JSON.stringify({ password: "newpass8" })
            )
          );
          const renewedHeaders = {
            authorization: `Bearer ${(await renewed.json()).token}`
          };
          assert.equal(
            (await lock(req("/api/lectors/session", "DELETE", renewedHeaders)))
              .status,
            200
          );
          assert.equal(
            (await publicList(req("/api/lectors", "GET", renewedHeaders)))
              .status,
            401
          );
        }
      );

      await t.test(
        "removing the environment secret denies existing sessions despite legacy CMS settings",
        async () => {
          const response = await unlock(
            req(
              "/api/lectors/unlock",
              "POST",
              { "content-type": "application/json" },
              JSON.stringify({ password: "newpass8" })
            )
          );
          assert.equal(response.status, 200);
          const headers = {
            authorization: `Bearer ${(await response.json()).token}`
          };
          delete process.env.LECTOR_PASSCODE;
          assert.equal(
            (await publicList(req("/api/lectors", "GET", headers))).status,
            503
          );
          assert.equal(
            (
              await publicPdf(
                req(`/api/lectors/${month}`, "GET", headers),
                context(month)
              )
            ).status,
            503
          );
          process.env.LECTOR_PASSCODE = "rotate88";
          assert.equal(
            (await publicList(req("/api/lectors", "GET", headers))).status,
            401
          );
        }
      );
      await t.test(
        "expired sessions and older-month files are denied while private history stays manageable",
        async () => {
          const response = await unlock(
            req(
              "/api/lectors/unlock",
              "POST",
              { "content-type": "application/json" },
              JSON.stringify({ password: "rotate88" })
            )
          );
          assert.equal(response.status, 200);
          const headers = {
            authorization: `Bearer ${(await response.json()).token}`
          };
          await getPool().query(
            "INSERT INTO lector_schedules(month,pdf,updated_by) VALUES ('2000-01',$1,$2)",
            [pdf, admin]
          );
          assert.equal(
            (
              await publicPdf(
                req("/api/lectors/2000-01", "GET", headers),
                context("2000-01")
              )
            ).status,
            404
          );
          const history = await list(
            req("/api/admin/lectors", "GET", { cookie: lectorCookie })
          );
          assert.equal((await history.json()).history[0].month, "2000-01");
          const archived = await adminPdf(
            req("/api/admin/lectors/2000-01", "GET", { cookie: lectorCookie }),
            context("2000-01")
          );
          assert.equal(archived.status, 200);
          assert.deepEqual(Buffer.from(await archived.arrayBuffer()), pdf);
          const deleted = await remove(
            req("/api/admin/lectors/2000-01", "DELETE", {
              cookie: lectorCookie,
              "if-match": '"1"'
            }),
            context("2000-01")
          );
          assert.equal(deleted.status, 200);
          const remaining = await list(
            req("/api/admin/lectors", "GET", { cookie: lectorCookie })
          );
          assert.equal((await remaining.json()).history.length, 0);
          assert.equal(
            (
              await adminPdf(
                req("/api/admin/lectors/2000-01", "GET", {
                  cookie: lectorCookie
                }),
                context("2000-01")
              )
            ).status,
            404
          );
          const retained = await getPool().query(
            "SELECT pdf,version FROM lector_schedules WHERE month='2000-01'"
          );
          assert.equal(retained.rows[0].pdf, null);
          assert.equal(retained.rows[0].version, 2);
          await getPool().query(
            "UPDATE lector_sessions SET expires_at=now()-interval '1 second'"
          );
          assert.equal(
            (await publicList(req("/api/lectors", "GET", headers))).status,
            401
          );
          assert.equal(
            (
              await publicPdf(
                req(`/api/lectors/${month}`, "GET", headers),
                context(month)
              )
            ).status,
            401
          );
        }
      );
      await t.test(
        "an already signed-in restricted user gains and loses capabilities from current database role",
        async () => {
          await changeEditorRole(lector, "editor", "lektorka", admin);
          assert.equal(
            (
              await list(
                req("/api/admin/lectors", "GET", { cookie: lectorCookie })
              )
            ).status,
            403
          );
          await changeEditorRole(lector, "lektorka", "editor", admin);
          assert.equal(
            (
              await list(
                req("/api/admin/lectors", "GET", { cookie: lectorCookie })
              )
            ).status,
            200
          );
          await revokeEditorAccess(lector, admin);
          assert.equal(
            (
              await list(
                req("/api/admin/lectors", "GET", { cookie: lectorCookie })
              )
            ).status,
            403
          );
        }
      );

      await t.test(
        "password attempts are bounded in the database even across parallel requests",
        async () => {
          await getPool().query("DELETE FROM lector_rate_limits");
          const responses = await Promise.all(
            Array.from({ length: 12 }, () =>
              unlock(
                req(
                  "/api/lectors/unlock",
                  "POST",
                  { "content-type": "application/json" },
                  JSON.stringify({ password: "wrongpwd" })
                )
              )
            )
          );
          assert.equal(responses.filter((r) => r.status === 401).length, 10);
          assert.equal(responses.filter((r) => r.status === 429).length, 2);
          assert.equal(
            (
              await getPool().query(
                "SELECT count(*)::int AS count FROM lector_sessions"
              )
            ).rows[0].count,
            0
          );
        }
      );
    } finally {
      await closeDb();
    }
  }
);
