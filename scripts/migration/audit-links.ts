import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { informationPages } from "../../src/content/information";
import { buildMigration } from "./build-migration";
import { parseDump } from "./parse-dump";

const allowedHosts = new Set([
  "docs.google.com",
  "drive.google.com",
  "www.google.com",
  "google.com",
  "maps.google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "forms.gle",
  "sketchfab.com",
  "www.sketchfab.com",
  "wonderful360world.eu",
  "www.wonderful360world.eu"
]);
const redirectHosts = new Set([
  ...allowedHosts,
  "accounts.google.com",
  "consent.google.com",
  "drive.usercontent.google.com"
]);
const pathIndex = process.argv.indexOf("--dump");
if (pathIndex < 0 || !process.argv[pathIndex + 1])
  throw new Error(
    "Usage: node --conditions=react-server --import tsx scripts/migration/audit-links.ts --dump /private/path/dump.sql"
  );
const migration = buildMigration(
  await parseDump(resolve(process.argv[pathIndex + 1]))
);
const urls = new Set<string>();
const add = (value: unknown) => {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (/^https?:$/.test(url.protocol) && allowedHosts.has(url.hostname))
      urls.add(url.href);
  } catch {
    /* Non-URL text is not requested. */
  }
};
const collect = (value: unknown) => {
  if (!value || typeof value !== "object") return;
  const object = value as Record<string, unknown>;
  if (
    object.type === "link" &&
    object.attrs &&
    typeof object.attrs === "object"
  )
    add((object.attrs as Record<string, unknown>).href);
  for (const nested of Object.values(object))
    if (nested && typeof nested === "object") collect(nested);
};
for (const page of migration.staticPages.filter((page) => page.publishedAt))
  collect(page.body);
for (const page of informationPages)
  for (const link of page.links ?? []) add(link.href);
const settings = migration.records.find(
  (record) => record.kind === "settings"
)?.published;
if (settings && "mapLink" in settings) add(settings.mapLink);

interface Result {
  original: string;
  final: string;
  status: number | null;
  title?: string;
  redirects: { status: number; destination: string }[];
  expectedTourMarkers?: boolean;
  registrationClosed?: boolean;
  outcome:
    | "reachable"
    | "http-error"
    | "network-error"
    | "redirect-host-change"
    | "redirect-limit";
}
async function check(original: string): Promise<Result> {
  const result: Result = {
    original,
    final: original,
    status: null,
    redirects: [],
    outcome: "network-error"
  };
  try {
    for (let step = 0; step < 6; step += 1) {
      const response = await fetch(result.final, {
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "Farazv migration link review (read-only)" }
      });
      result.status = response.status;
      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        const destination = new URL(location, result.final);
        await response.body?.cancel();
        result.redirects.push({
          status: response.status,
          destination: destination.href
        });
        result.final = destination.href;
        if (
          !/^https?:$/.test(destination.protocol) ||
          !redirectHosts.has(destination.hostname) ||
          destination.username ||
          destination.password
        ) {
          result.outcome = "redirect-host-change";
          return result;
        }
        continue;
      }
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) {
        while (size < 65_536) {
          const chunk = await reader.read();
          if (chunk.done) break;
          chunks.push(chunk.value);
          size += chunk.value.length;
        }
        await reader.cancel();
      }
      const body = Buffer.concat(chunks).subarray(0, 65_536).toString("utf8");
      result.title = body
        .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        ?.replace(/\s+/g, " ")
        .trim()
        .slice(0, 200);
      if (/wonderful360world\.eu/.test(new URL(original).hostname))
        result.expectedTourMarkers =
          /krpano|pannellum|marzipano|tour\.xml|pano360|virtualtour/i.test(
            body
          );
      if (/docs\.google\.com/.test(new URL(original).hostname))
        result.registrationClosed =
          /no longer accepting responses|not accepting responses|form has been closed|formulár už neprijíma|už neprijíma odpovede/i.test(
            body
          );
      result.outcome = response.ok ? "reachable" : "http-error";
      return result;
    }
    result.outcome = "redirect-limit";
  } catch {
    result.outcome = "network-error";
  }
  return result;
}
const entries = [...urls].sort();
const results: Result[] = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (cursor < entries.length)
      results.push(await check(entries[cursor++]));
  })
);
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Read-only GET; maximum five redirects restricted to known provider hosts; first 64 KiB only; HTML never executed",
  total: entries.length,
  results
};
await mkdir(".private", { recursive: true, mode: 0o700 });
await writeFile(
  ".private/link-audit.json",
  `${JSON.stringify(report, null, 2)}\n`,
  { mode: 0o600 }
);
console.log(
  JSON.stringify(
    {
      checkedAt: report.checkedAt,
      total: report.total,
      results: results.map((result) => ({
        host: new URL(result.original).hostname,
        finalHost: new URL(result.final).hostname,
        status: result.status,
        outcome: result.outcome,
        tourMarkers: result.expectedTourMarkers,
        registrationClosed: result.registrationClosed
      }))
    },
    null,
    2
  )
);
