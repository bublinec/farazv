import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { Client } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { buildMigration } from "../scripts/migration/build-migration";
import { databaseIdentity } from "../scripts/operations/lib";
import { closeDb, getDb } from "../src/server/db";
import {
  createRecord,
  getRecord,
  updateRecord
} from "../src/server/content-store";
import {
  getPublishedEntry,
  getPublishedPages,
  getPublishedSettings
} from "../src/server/published-store";
import {
  createPage,
  listPageRevisions,
  listPages,
  openBuiltInPage,
  restorePageRevision
} from "../src/server/page-store";
import { seedPageDocument } from "../src/server/page-seed";
import type { PageDocument } from "../src/content/page-documents";
import { importMigration } from "../scripts/migration/apply-import";
import { ContentError } from "../src/server/errors";
import { siteSettings } from "../src/content/fixtures";
import type {
  BulletinDocument,
  ContentRecord,
  EditorialDocument,
  SettingsDocument
} from "../src/content/documents";

const testUrl = process.env.TEST_DATABASE_URL;
const body = (text: string) => ({
  type: "doc" as const,
  content: [{ type: "paragraph", content: [{ type: "text", text }] }]
});
function entry(
  record: ContentRecord,
  slug: string,
  title = "Integration article"
): EditorialDocument {
  return {
    ...(record.draft as EditorialDocument),
    title,
    slug,
    body: body("Public integration text.")
  };
}
const status = (expected: number) => (error: unknown) =>
  error instanceof ContentError && error.status === expected;

function sourceMigration(
  id: string,
  content = "Source initial text",
  slug = `source-${id}`
) {
  return buildMigration({
    skippedTables: [],
    tables: {
      articles: [
        {
          id,
          title: "Source article",
          slug,
          content,
          published_at: "2025-01-01 12:00:00+00",
          created_at: "2025-01-01 12:00:00+00",
          updated_at: "2025-01-01 12:00:00+00"
        }
      ]
    }
  });
}

/** Observe the database lock itself; no timing assumption schedules the race. */
async function waitForBlockedWriter(observer: Client, blockerPid: number) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const { rows } = await observer.query<{ blocked: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))) AS blocked",
      [blockerPid]
    );
    if (rows[0].blocked) return;
  }
  assert.fail("The importer did not reach its coordinated write lock.");
}

test(
  "Postgres publication, concurrency, route identity and import contracts",
  { skip: !testUrl, timeout: 60000 },
  async (t) => {
    const target = new URL(testUrl!);
    const databaseName = decodeURIComponent(target.pathname.slice(1));
    if (
      !["localhost", "127.0.0.1"].includes(target.hostname) ||
      !/^farazv_remake_store_test_[a-z0-9_]+$/.test(databaseName)
    )
      throw new Error(
        "TEST_DATABASE_URL must name a new isolated local farazv_remake_store_test_* database."
      );
    if (
      process.env.DATABASE_URL &&
      databaseIdentity(process.env.DATABASE_URL) === databaseIdentity(testUrl!)
    )
      throw new Error(
        "Integration target must differ from the application database."
      );
    const adminUrl = new URL(target);
    adminUrl.pathname = "/postgres";
    const administrator = new Client({ connectionString: adminUrl.href });
    let created = false;
    const original = process.env.DATABASE_URL;
    try {
      await administrator.connect();
      const exists = await administrator.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [databaseName]
      );
      if (exists.rowCount)
        throw new Error(
          "Integration target already exists; refusing to modify it."
        );
      await administrator.query(`CREATE DATABASE "${databaseName}"`);
      created = true;
      process.env.DATABASE_URL = testUrl;
      await migrate(getDb(), { migrationsFolder: resolve("drizzle") });

      await t.test(
        "private saves stay private, published saves update the public snapshot and concurrent writes have one winner",
        async () => {
          let record: ContentRecord = await createRecord("article");
          record = await updateRecord(
            record.id,
            record.version,
            entry(record, "snapshot-contract"),
            "save"
          );
          assert.equal(
            await getPublishedEntry("article", "snapshot-contract"),
            null
          );
          record = await updateRecord(
            record.id,
            record.version,
            record.draft,
            "publish"
          );
          const publicBefore = await getPublishedEntry(
            "article",
            "snapshot-contract"
          );
          record = await updateRecord(
            record.id,
            record.version,
            {
              ...record.draft,
              title: "Published revision",
              body: body("PUBLIC_REVISION_SENTINEL")
            },
            "save"
          );
          const publicAfter = await getPublishedEntry(
            "article",
            "snapshot-contract"
          );
          assert.equal(publicAfter?.title, "Published revision");
          assert.notDeepEqual(publicAfter, publicBefore);
          const writes = await Promise.allSettled([
            updateRecord(
              record.id,
              record.version,
              { ...record.draft, title: "Concurrent editor A" },
              "save"
            ),
            updateRecord(
              record.id,
              record.version,
              { ...record.draft, title: "Concurrent editor B" },
              "save"
            )
          ]);
          assert.equal(
            writes.filter((result) => result.status === "fulfilled").length,
            1
          );
          const rejection = writes.find(
            (result) => result.status === "rejected"
          ) as PromiseRejectedResult;
          assert.equal(status(409)(rejection.reason), true);
          const winner = writes.find(
            (result) => result.status === "fulfilled"
          ) as PromiseFulfilledResult<ContentRecord>;
          assert.equal(
            (await getPublishedEntry("article", "snapshot-contract"))?.title,
            winner.value.title
          );
          record = await updateRecord(
            record.id,
            winner.value.version,
            undefined,
            "unpublish"
          );
          await updateRecord(
            record.id,
            record.version,
            { ...record.draft, title: "Private revision after unpublishing" },
            "save"
          );
          assert.equal(
            await getPublishedEntry("article", "snapshot-contract"),
            null
          );
        }
      );

      await t.test(
        "unpublishing retains reserved URLs and uniqueness follows the actual route family",
        async () => {
          let article: ContentRecord = await createRecord("article");
          article = await updateRecord(
            article.id,
            article.version,
            entry(article, "reserved-route"),
            "publish"
          );
          article = await updateRecord(
            article.id,
            article.version,
            undefined,
            "unpublish"
          );
          assert.equal(
            await getPublishedEntry("article", "reserved-route"),
            null
          );
          const replacement = await createRecord("article");
          await assert.rejects(
            updateRecord(
              replacement.id,
              replacement.version,
              entry(replacement, "reserved-route"),
              "publish"
            ),
            status(409)
          );
          await assert.rejects(
            updateRecord(
              article.id,
              article.version,
              entry(article, "changed-route"),
              "save"
            ),
            status(422)
          );
          article = await updateRecord(
            article.id,
            article.version,
            article.draft,
            "publish"
          );
          assert.ok(await getPublishedEntry("article", "reserved-route"));
          let news: ContentRecord = await createRecord("news");
          news = await updateRecord(
            news.id,
            news.version,
            entry(news, "reserved-route"),
            "publish"
          );
          assert.ok(await getPublishedEntry("news", "reserved-route"));
          const event = await createRecord("event");
          await assert.rejects(
            updateRecord(
              event.id,
              event.version,
              entry(event, "reserved-route"),
              "publish"
            ),
            status(409)
          );
        }
      );

      await t.test(
        "settings cannot be unpublished and new bulletins copy only the published recurring template",
        async () => {
          let settings: ContentRecord = await createRecord("settings");
          assert.deepEqual(settings.draft, {
            name: "Farnosť sv. Alžbety",
            shortName: "Farnosť sv. Alžbety",
            location: "Zvolen – mesto",
            address: "",
            phone: "",
            email: "",
            iban: "",
            officeHours: [],
            preparationMeetings: [],
            regularSchedule: {},
            priests: []
          });
          await assert.rejects(
            updateRecord(
              settings.id,
              settings.version,
              settings.draft,
              "publish"
            ),
            status(422)
          );
          assert.equal(await getPublishedSettings(), null);

          const template: SettingsDocument = {
            ...siteSettings,
            regularSchedule: {
              1: [{ time: "06:30", location: "Kostol", label: "Ranná" }]
            },
            priests: []
          };
          settings = await updateRecord(
            settings.id,
            settings.version,
            template,
            "publish"
          );
          await assert.rejects(
            updateRecord(settings.id, settings.version, undefined, "unpublish"),
            status(422)
          );
          let bulletin: ContentRecord = await createRecord(
            "bulletin",
            "2030-01-07"
          );
          const document = bulletin.draft as BulletinDocument;
          assert.deepEqual(document.days[0].masses, [
            { time: "06:30", location: "Kostol", label: "Ranná" }
          ]);
          assert.equal(document.days[0].liturgy ?? "", "");
          assert.equal(document.days[0].liturgyType ?? "", "");
          assert.deepEqual(document.donations, []);
          assert.equal(
            document.days.some((day) =>
              day.masses.some((mass) => mass.intention || mass.celebrant)
            ),
            false
          );
          const donations = [
            { label: "", amount: "25 €", category: "Na kostol" }
          ];
          bulletin = await updateRecord(
            bulletin.id,
            bulletin.version,
            { ...bulletin.draft, donations },
            "publish"
          );
          assert.deepEqual(
            (bulletin.published as BulletinDocument).donations,
            donations
          );
          const sameWeek = await createRecord("bulletin", "2030-01-07");
          assert.equal(sameWeek.id, bulletin.id);
          assert.equal(sameWeek.version, bulletin.version);
          settings = await updateRecord(
            settings.id,
            settings.version,
            {
              ...template,
              regularSchedule: { 1: [{ time: "08:00", location: "Kostol" }] }
            },
            "save"
          );
          assert.equal(
            (await getPublishedSettings())?.regularSchedule[1][0].time,
            "08:00"
          );
          const nextWeek = await createRecord("bulletin", "2030-01-14");
          assert.equal(
            (nextWeek.draft as BulletinDocument).days[0].masses[0].time,
            "08:00"
          );
          assert.equal(
            (bulletin.published as BulletinDocument).days[0].masses[0].time,
            "06:30"
          );
        }
      );

      await t.test(
        "imports are idempotent and report editor/source URL conflicts without overwriting them",
        async () => {
          function migration(
            slug = "source-fixed-url",
            content = "Source initial text",
            title = "Source article"
          ) {
            return buildMigration({
              skippedTables: [],
              tables: {
                articles: [
                  {
                    id: "90001",
                    title,
                    slug,
                    content,
                    published_at: "2025-01-01 12:00:00+00",
                    created_at: "2025-01-01 12:00:00+00",
                    updated_at: "2025-01-01 12:00:00+00"
                  }
                ]
              }
            });
          }
          const dry = await importMigration(migration(), { dryRun: true });
          assert.equal(dry.inserted, 1);
          assert.equal(dry.applied, false);
          assert.equal(await getRecord("legacy-article-90001"), null);
          const initial = await importMigration(migration());
          assert.equal(initial.inserted, 1);
          const imported = await getRecord("legacy-article-90001");
          assert.ok(imported);
          const repeated = await importMigration(migration());
          assert.equal(repeated.unchanged, 1);
          assert.equal(
            (await getRecord(imported.id))!.version,
            imported.version
          );
          const moved = await importMigration(migration("source-moved-url"));
          assert.deepEqual(moved.conflicts, [imported.id]);
          assert.equal(
            (await getRecord(imported.id))!.slug,
            "source-fixed-url"
          );
          const edited = await updateRecord(
            imported.id,
            imported.version,
            { ...imported.draft, title: "Editor revision" },
            "save"
          );
          const changedSource = await importMigration(
            migration("source-fixed-url", "Source changed text")
          );
          assert.deepEqual(changedSource.conflicts, [edited.id]);
          assert.equal((await getRecord(edited.id))!.title, "Editor revision");
          assert.equal((await getRecord(edited.id))!.version, edited.version);
        }
      );

      await t.test(
        "an editor commit after the import snapshot survives atomic version comparison",
        async () => {
          for (const [sourceId, action] of [
            ["90002", "save"],
            ["90005", "publish"]
          ] as const) {
            const id = `legacy-article-${sourceId}`;
            await importMigration(sourceMigration(sourceId));
            const before = (await getRecord(id))!;
            const editorDraft = {
              ...before.draft,
              title: `Concurrent editor ${action}`
            };
            const editorTimestamp = "2030-01-01T12:00:00.000Z";
            const editor = new Client({ connectionString: testUrl });
            let importing: ReturnType<typeof importMigration> | undefined;

            try {
              await editor.connect();
              await editor.query("BEGIN");
              const {
                rows: [{ pid }]
              } = await editor.query<{ pid: number }>(
                "SELECT pg_backend_pid() AS pid"
              );
              await editor.query(
                "SELECT id FROM content_records WHERE id = $1 FOR UPDATE",
                [id]
              );

              // SELECT sees the old committed version; the UPDATE waits behind our lock.
              importing = importMigration(
                sourceMigration(sourceId, "Changed source text")
              );
              await waitForBlockedWriter(administrator, pid);
              await editor.query(
                `UPDATE content_records SET draft = $2, title = $3, version = version + 1,
                   published = CASE WHEN $4 THEN $2::jsonb ELSE published END,
                   published_at = CASE WHEN $4 THEN $5::timestamptz ELSE published_at END,
                   updated_at = $5::timestamptz WHERE id = $1`,
                [
                  id,
                  JSON.stringify(editorDraft),
                  editorDraft.title,
                  action === "publish",
                  editorTimestamp
                ]
              );
              await editor.query("COMMIT");

              const outcome = await importing;
              assert.equal(outcome.updated, 0);
              assert.equal(outcome.inserted, 0);
              assert.deepEqual(outcome.conflicts, [id]);
              const after = (await getRecord(id))!;
              assert.deepEqual(after.draft, editorDraft);
              assert.deepEqual(
                after.published,
                action === "publish" ? editorDraft : before.published
              );
              assert.equal(after.version, before.version + 1);
              assert.equal(
                Date.parse(after.updatedAt),
                Date.parse(editorTimestamp)
              );
              assert.equal(
                Date.parse(after.publishedAt!),
                Date.parse(
                  action === "publish" ? editorTimestamp : before.publishedAt!
                )
              );
              assert.deepEqual(after.source, before.source);
            } finally {
              await editor.query("ROLLBACK").catch(() => {});
              if (importing) await importing.catch(() => {});
              await editor.end();
            }
          }
        }
      );

      await t.test(
        "a concurrent same-ID insert becomes a record conflict and unrelated imports continue",
        async () => {
          const id = "legacy-article-90003";
          const concurrent = new Client({ connectionString: testUrl });
          let importing: ReturnType<typeof importMigration> | undefined;
          const source = sourceMigration("90003");
          const unrelated = sourceMigration("90004").records[0];
          source.records.push(unrelated);
          const ownedDraft = {
            ...source.records[0].draft,
            title: "Concurrent inserted record"
          };

          try {
            await concurrent.connect();
            await concurrent.query("BEGIN");
            const {
              rows: [{ pid }]
            } = await concurrent.query<{ pid: number }>(
              "SELECT pg_backend_pid() AS pid"
            );
            await concurrent.query(
              "INSERT INTO content_records (id, kind, title, draft) VALUES ($1, 'article', $2, $3)",
              [id, ownedDraft.title, JSON.stringify(ownedDraft)]
            );

            importing = importMigration(source);
            await waitForBlockedWriter(administrator, pid);
            await concurrent.query("COMMIT");

            const outcome = await importing;
            assert.equal(outcome.inserted, 1);
            assert.equal(outcome.updated, 0);
            assert.deepEqual(outcome.conflicts, [id]);
            const preserved = (await getRecord(id))!;
            assert.deepEqual(preserved.draft, ownedDraft);
            assert.equal(preserved.published, null);
            assert.equal(preserved.version, 1);
            assert.equal(preserved.source, null);
            assert.ok(await getRecord(unrelated.id));
          } finally {
            await concurrent.query("ROLLBACK").catch(() => {});
            if (importing) await importing.catch(() => {});
            await concurrent.end();
          }
        }
      );
      await t.test(
        "editable pages keep the code version public until publication and keep a restorable history",
        async () => {
          const editor = "editor@example.test";
          const route = "sviatosti/sviatost-krstu";
          const before = await listPages();
          assert.equal(before.length, 11);
          assert.ok(before.every((page) => page.recordId === null));

          const opened = await openBuiltInPage(route, editor);
          assert.equal(opened.kind, "page");
          assert.deepEqual(opened.draft, seedPageDocument(route));
          assert.equal(opened.published, null);
          // Opening again never duplicates or reseeds the page.
          assert.equal((await openBuiltInPage(route, editor)).id, opened.id);
          assert.deepEqual(await getPublishedPages(), []);

          const edited: PageDocument = {
            ...(opened.draft as PageDocument),
            title: "Sviatosť krstu – upravené"
          };
          const saved = await updateRecord(
            opened.id,
            opened.version,
            edited,
            "save",
            { actor: editor }
          );
          assert.equal(saved.published, null);
          assert.deepEqual(
            await getPublishedPages(),
            [],
            "a private save keeps the code version on the web"
          );

          const published = await updateRecord(
            opened.id,
            saved.version,
            undefined,
            "publish",
            { actor: editor }
          );
          assert.equal(
            (await getPublishedPages())[0].title,
            "Sviatosť krstu – upravené"
          );

          await assert.rejects(
            updateRecord(
              opened.id,
              published.version,
              { ...edited, route: "sviatosti/ina-adresa" },
              "save",
              { actor: editor }
            ),
            status(422)
          );

          const history = await listPageRevisions(opened.id);
          assert.deepEqual(
            history.map((revision) => revision.action),
            ["publish", "save", "save"]
          );
          assert.ok(history.every((revision) => revision.actor === editor));

          const original = history.at(-1)!;
          await assert.rejects(
            restorePageRevision(opened.id, original.id, 1, editor),
            status(409)
          );
          const restored = await restorePageRevision(
            opened.id,
            original.id,
            published.version,
            editor
          );
          assert.equal(
            (restored.draft as PageDocument).title,
            "Sviatosť krstu"
          );
          // The page was public, so the restored version is public at once.
          assert.equal((await getPublishedPages())[0].title, "Sviatosť krstu");
          assert.equal(
            (await listPageRevisions(opened.id))[0].action,
            "restore"
          );

          const hidden = await updateRecord(
            opened.id,
            restored.version,
            undefined,
            "unpublish",
            { actor: editor }
          );
          assert.equal(hidden.published, null);
          assert.deepEqual(
            await getPublishedPages(),
            [],
            "turning visibility off returns the web to the code version"
          );

          const added = await createPage(
            "service",
            "Kostolníci",
            undefined,
            editor
          );
          assert.equal(added.id, "page-spolocenstva-kostolnici");
          assert.equal(
            (added.draft as PageDocument).route,
            "spolocenstva/kostolnici"
          );
          await assert.rejects(
            createPage("service", "Kostolníci", undefined, editor),
            status(409)
          );
          await assert.rejects(
            createPage("service", "Rehoľné sestry", undefined, editor),
            status(409)
          );
          await assert.rejects(
            createPage("service", "Zlá adresa", "../admin", editor),
            status(422)
          );
          await assert.rejects(
            updateRecord(added.id, added.version, undefined, "publish", {
              actor: editor
            }),
            status(422)
          );

          const pages = await listPages();
          assert.equal(pages.length, 12);
          assert.equal(pages.at(-1)?.builtIn, false);
          assert.equal(
            pages.find((page) => page.route === route)?.recordId,
            opened.id
          );
        }
      );
    } finally {
      await closeDb();
      process.env.DATABASE_URL = original;
      if (created) await administrator.query(`DROP DATABASE "${databaseName}"`);
      await administrator.end();
    }
  }
);
