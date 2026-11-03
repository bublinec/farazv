import { mkdir, writeFile } from "node:fs/promises";
import { loadLocalEnvironment } from "./environment";
import { Pool } from "pg";
import { informationPages } from "../src/content/information";

loadLocalEnvironment();
const baseIndex = process.argv.indexOf("--base-url");
const base = new URL(
  baseIndex < 0 ? "http://127.0.0.1:3101" : process.argv[baseIndex + 1]
);
const connectionString = process.env.DATABASE_URL;
if (
  !connectionString ||
  !["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(connectionString).hostname
  ) ||
  !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
)
  throw new Error(
    "Verification requires the configured local replacement database and a local preview."
  );
const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 8000,
  statement_timeout: 15000
});
type Row = {
  id: string;
  kind: string;
  public_slug: string | null;
  draft_slug: string | null;
  published: boolean;
};
let rows: Row[];
try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    rows = (
      await client.query<Row>(
        "SELECT id, kind, public_slug, draft->>'slug' AS draft_slug, published IS NOT NULL AS published FROM content_records WHERE kind IN ('article','news','notice','event')"
      )
    ).rows;
    await client.query("COMMIT");
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}

const failures: { group: string; reason: string; sourceId?: string }[] = [];
let authConfigurationRequired = false;
const counts: Record<string, number> = {};
const increment = (key: string) => {
  counts[key] = (counts[key] ?? 0) + 1;
};
const routeFor = (kind: string, slug: string) =>
  `${
    kind === "article"
      ? "/farnost/nase-spolocenstvo/"
      : kind === "notice"
      ? "/vyveska/"
      : "/prispevky/"
  }${encodeURIComponent(slug)}`;
const tasks: (() => Promise<void>)[] = [];
for (const row of rows!) {
  const slug = row.published ? row.public_slug : row.draft_slug;
  if (!slug) {
    tasks.push(async () => {
      const response = await fetch(
        new URL(`/api/admin/records/${encodeURIComponent(row.id)}`, base)
      );
      const error = await response.json();
      const configurationClosed =
        response.status === 503 &&
        error.code === "AUTH_NOT_CONFIGURED" &&
        Object.keys(error).every((key) => ["error", "code"].includes(key));
      if (configurationClosed) authConfigurationRequired = true;
      if (![401, 403].includes(response.status) && !configurationClosed)
        failures.push({
          group: `slugless-private-${row.kind}`,
          reason: `Expected denied admin detail; received ${response.status}`,
          sourceId: row.id
        });
      increment(
        `slugless-private-${row.kind}-${
          configurationClosed ? "fail-closed-unconfigured" : "denied"
        }`
      );
    });
    continue;
  }
  tasks.push(async () => {
    const response = await fetch(new URL(routeFor(row.kind, slug), base));
    const expected = row.published ? 200 : 404;
    if (response.status !== expected)
      failures.push({
        group: `${row.published ? "published" : "private"}-${row.kind}`,
        reason: `Expected ${expected}; received ${response.status}`,
        sourceId: row.id
      });
    const html = await response.text();
    if (row.published && (html.match(/<h1(?:\s|>)/g) ?? []).length !== 1)
      failures.push({
        group: `published-${row.kind}`,
        reason: "Expected one page H1",
        sourceId: row.id
      });
    increment(
      `${row.published ? "published" : "private"}-${row.kind}-${
        response.status
      }`
    );
  });
}
for (const path of [
  "/",
  "/farnost/farske-oznamy",
  "/farnost/nase-spolocenstvo",
  "/prispevky",
  ...informationPages.map((page) => `/${page.slug}`)
])
  tasks.push(async () => {
    const response = await fetch(new URL(path, base));
    const html = await response.text();
    if (
      response.status !== 200 ||
      (html.match(/<h1(?:\s|>)/g) ?? []).length !== 1
    )
      failures.push({
        group: "fixed-route",
        reason: "Expected HTTP 200 and one H1"
      });
    increment(`fixed-${response.status}`);
  });
for (const path of [
  "/404",
  "/not-a-parish-page",
  "/farnost/farske-oznamy/archiv",
  "/farnost/archiv-farskych-oznamov",
  "/api/bulletins",
  "/api/bulletins/history"
])
  tasks.push(async () => {
    const response = await fetch(new URL(path, base));
    if (response.status !== 404)
      failures.push({
        group: "not-found-or-private-history",
        reason: `Expected 404; received ${response.status}`
      });
    increment(`not-found-${response.status}`);
    await response.body?.cancel();
  });
for (const [path, expected] of [
  ["/cms/index.php/farnost/farske-oznamy/", "/farnost/farske-oznamy"],
  ["/cms/index.php/", "/"],
  ["/cms/", "/"],
  ["/cms/index.php/farnost/kontakt", "/kontakt"]
])
  tasks.push(async () => {
    const first = await fetch(new URL(path, base), { redirect: "manual" });
    const validRedirect = [301, 308].includes(first.status);
    await first.body?.cancel();
    const last = await fetch(new URL(path, base));
    if (
      !validRedirect ||
      last.status !== 200 ||
      new URL(last.url).pathname !== expected
    )
      failures.push({
        group: "legacy-redirect",
        reason: "Unexpected permanent redirect destination/status"
      });
    increment("legacy-redirect");
    await last.body?.cancel();
  });
let cursor = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        await task();
      } catch {
        failures.push({ group: "request", reason: "Network/request failure" });
      }
    }
  })
);
let next: string | null = null;
const listed = new Set<string>();
let pages = 0;
do {
  const endpoint: URL = new URL(
    `/api/articles${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
    base
  );
  const response = await fetch(endpoint);
  const result = await response.json();
  pages += 1;
  if (
    response.status !== 200 ||
    !Array.isArray(result.items) ||
    result.items.length > (pages === 1 ? 10 : 6)
  ) {
    failures.push({
      group: "article-pagination",
      reason: "Invalid summary response/page size"
    });
    break;
  }
  for (const item of result.items) {
    if (
      listed.has(item.id) ||
      "body" in item ||
      "blocks" in item ||
      "draft" in item ||
      "source" in item
    )
      failures.push({
        group: "article-pagination",
        reason: "Duplicate or non-summary payload"
      });
    listed.add(item.id);
  }
  next = result.nextCursor ?? null;
  if (pages > 100) {
    failures.push({
      group: "article-pagination",
      reason: "Cursor did not terminate"
    });
    break;
  }
} while (next);
const expectedArticles = rows!.filter(
  (row) => row.kind === "article" && row.published
).length;
if (listed.size !== expectedArticles)
  failures.push({
    group: "article-pagination",
    reason: "Public pagination count differs from published database records"
  });
const report = {
  checkedAt: new Date().toISOString(),
  databaseReadOnly: true,
  authConfigurationRequired,
  counts,
  articlePagination: { items: listed.size, pages, expected: expectedArticles },
  failures
};
await mkdir(".private", { recursive: true, mode: 0o700 });
await writeFile(
  ".private/public-route-verification.json",
  `${JSON.stringify(report, null, 2)}\n`,
  { mode: 0o600 }
);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
