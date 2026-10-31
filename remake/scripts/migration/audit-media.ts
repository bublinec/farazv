import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildMigration } from "./build-migration";
import { parseDump } from "./parse-dump";
import type { MigratedMedia } from "./types";

export interface MediaAuditItem {
  sourceId: string;
  status: number | null;
  available: boolean;
  contentType: string | null;
  error?: "timeout-or-network" | "untrusted-url";
}
export interface MediaAudit {
  checkedAt: string;
  method: "HEAD" | "GET";
  inventoryHash: string;
  total: number;
  available: number;
  unavailable: number;
  failures: MediaAuditItem[];
  statusCounts: Record<string, number>;
}

export function mediaInventoryHash(media: MigratedMedia[]): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        media
          .map((entry) => [entry.sourceId, entry.sourceHash])
          .sort((a, b) => a[0].localeCompare(b[0]))
      )
    )
    .digest("hex");
}

/** Ignore availability from an audit of a different source snapshot. */
export function attachMediaAudit(
  media: MigratedMedia[],
  report: MediaAudit
): boolean {
  if (
    report.method !== "HEAD" ||
    report.total !== media.length ||
    report.inventoryHash !== mediaInventoryHash(media)
  )
    return false;
  const failures = new Map(
    report.failures.map((failure) => [failure.sourceId, failure])
  );
  for (const entry of media) {
    const failure = failures.get(entry.sourceId);
    entry.metadata.availability = {
      checkedAt: report.checkedAt,
      status: failure?.status ?? (failure ? null : 200),
      available: !failure
    };
  }
  return true;
}

/** HEAD-only audit against legacy Cloudinary originals, with bounded work. */
export async function auditMedia(
  media: MigratedMedia[],
  concurrency = 8,
  method: "HEAD" | "GET" = "HEAD"
): Promise<MediaAudit> {
  let cursor = 0;
  const items: MediaAuditItem[] = [];
  const request = async (entry: MigratedMedia): Promise<MediaAuditItem> => {
    let url: URL;
    try {
      url = new URL(entry.url);
    } catch {
      return {
        sourceId: entry.sourceId,
        status: null,
        available: false,
        contentType: null,
        error: "untrusted-url"
      };
    }
    // Prevent accidental SSRF if someone supplies a different SQL export.
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      url.username ||
      url.password
    )
      return {
        sourceId: entry.sourceId,
        status: null,
        available: false,
        contentType: null,
        error: "untrusted-url"
      };
    try {
      const response = await fetch(url, {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(15_000)
      });
      const item = {
        sourceId: entry.sourceId,
        status: response.status,
        available: response.ok,
        contentType: response.headers.get("content-type")
      };
      await response.body?.cancel();
      return item;
    } catch {
      return {
        sourceId: entry.sourceId,
        status: null,
        available: false,
        contentType: null,
        error: "timeout-or-network"
      };
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(Math.max(1, concurrency), 12, media.length) },
      async () => {
        while (cursor < media.length) {
          const entry = media[cursor++];
          let item = await request(entry);
          // Retry transient failures once, never turn a denied/missing asset public.
          if (item.status === null || item.status >= 500 || item.status === 429)
            item = await request(entry);
          items.push(item);
        }
      }
    )
  );
  const statusCounts: Record<string, number> = {};
  for (const item of items)
    statusCounts[String(item.status ?? item.error)] =
      (statusCounts[String(item.status ?? item.error)] ?? 0) + 1;
  const failures = items
    .filter((item) => !item.available)
    .sort((a, b) => Number(a.sourceId) - Number(b.sourceId));
  return {
    checkedAt: new Date().toISOString(),
    method,
    inventoryHash: mediaInventoryHash(media),
    total: items.length,
    available: items.length - failures.length,
    unavailable: failures.length,
    failures,
    statusCounts
  };
}

async function main() {
  const pathIndex = process.argv.indexOf("--dump");
  const path = process.argv[pathIndex + 1];
  if (pathIndex < 0 || !path)
    throw new Error(
      "Usage: node --import tsx scripts/migration/audit-media.ts --dump /private/path/dump.sql"
    );
  const migration = buildMigration(await parseDump(resolve(path)));
  const failedOnly = process.argv.includes("--verify-failures");
  const previous: MediaAudit | null = failedOnly
    ? JSON.parse(await readFile(".private/media-audit.json", "utf8"))
    : null;
  const failedIds = new Set(
    previous?.failures.map((failure) => failure.sourceId)
  );
  const report = await auditMedia(
    failedOnly
      ? migration.media.filter((entry) => failedIds.has(entry.sourceId))
      : migration.media,
    8,
    failedOnly ? "GET" : "HEAD"
  );
  await mkdir(".private", { recursive: true, mode: 0o700 });
  await writeFile(
    failedOnly
      ? ".private/media-verification.json"
      : ".private/media-audit.json",
    `${JSON.stringify(report, null, 2)}\n`,
    { mode: 0o600 }
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.unavailable) process.exitCode = 2;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch(() => {
    console.error(
      "Media audit failed; no source URLs or credentials were logged."
    );
    process.exitCode = 1;
  });
