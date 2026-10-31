import { readFile } from "node:fs/promises";
import type { DumpSource, SourceRow } from "./types";

// Explicit content allowlist. Auth, submissions, tokens, config and permissions
// are never materialized, restored or executed by this importer.
const CONTENT_TABLES = new Set([
  "admin_pages",
  "admin_pages_components",
  "pages",
  "pages_components",
  "articles",
  "articles_components",
  "posts",
  "announcements",
  "events",
  "weekly_announcements",
  "weekly_announcements_components",
  "writers",
  "priests",
  "upload_file",
  "upload_file_morph",
  "contacts",
  "contacts_components",
  "globals",
  "globals_components",
  "home_pages",
  "home_pages_components",
  "groups",
  "groups_components",
  "group_pages",
  "group_pages_components",
  "sacraments",
  "sacraments_components",
  "slideshows",
  "slideshows_components"
]);

export function decodeCopyValue(value: string): string | null {
  if (value === "\\N") return null;
  const chunks: Buffer[] = [];
  const escapedValue = /\\(?:([0-7]{1,3})|x([0-9a-fA-F]{1,2})|([\s\S]))/g;
  let offset = 0;
  for (const match of value.matchAll(escapedValue)) {
    chunks.push(Buffer.from(value.slice(offset, match.index), "utf8"));
    if (match[1] || match[2])
      chunks.push(
        Buffer.from([Number.parseInt(match[1] ?? match[2], match[1] ? 8 : 16)])
      );
    else
      chunks.push(
        Buffer.from(
          (
            {
              b: "\b",
              f: "\f",
              n: "\n",
              r: "\r",
              t: "\t",
              v: "\v",
              "\\": "\\"
            } as Record<string, string>
          )[match[3]] ?? match[3],
          "utf8"
        )
      );
    offset = match.index + match[0].length;
  }
  chunks.push(Buffer.from(value.slice(offset), "utf8"));
  return Buffer.concat(chunks).toString("utf8");
}

/** Parse PostgreSQL plain-text COPY data only. SQL statements are inert text. */
export function parseCopyDump(sql: string): DumpSource {
  const tables: Record<string, SourceRow[]> = Object.create(null);
  const skippedTables = new Set<string>();
  let active: { name: string; columns: string[]; allowed: boolean } | null =
    null;
  for (const [index, raw] of sql.split("\n").entries()) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (active) {
      if (line === "\\.") {
        active = null;
        continue;
      }
      if (!active.allowed) continue;
      const values = line.split("\t");
      if (values.length !== active.columns.length)
        throw new Error(
          `Malformed COPY row in ${active.name}, line ${
            index + 1
          }: column count mismatch`
        );
      const row: SourceRow = Object.create(null);
      active.columns.forEach((column, offset) => {
        row[column] = decodeCopyValue(values[offset]);
      });
      tables[active.name].push(row);
      continue;
    }
    if (!line.startsWith("COPY ")) continue;
    if (!line.startsWith("COPY public.")) {
      const external = /^COPY ([^ ]+)\s+(?:\([^)]*\) )?FROM stdin;$/.exec(line);
      if (!external)
        throw new Error(`Unsupported COPY declaration at line ${index + 1}`);
      skippedTables.add(external[1]);
      active = { name: external[1], columns: [], allowed: false };
      continue;
    }
    const match =
      /^COPY public\.("[^"]+"|[a-z_][a-z_0-9]*) \(([^)]+)\) FROM stdin;$/.exec(
        line
      );
    if (!match)
      throw new Error(`Unsupported COPY declaration at line ${index + 1}`);
    const name = match[1].replace(/^"|"$/g, "");
    const columns = match[2]
      .split(",")
      .map((column) => column.trim().replace(/^"|"$/g, ""));
    if (
      new Set(columns).size !== columns.length ||
      columns.some((column) => !/^[A-Za-z_][A-Za-z_0-9-]*$/.test(column))
    )
      throw new Error(`Invalid COPY columns in ${name}`);
    const allowed =
      CONTENT_TABLES.has(name) ||
      /^components_(?:sections|shared|annoucnements|contact|home)_/.test(name);
    if (allowed) {
      if (tables[name]) throw new Error(`Duplicate COPY table ${name}`);
      tables[name] = [];
    } else skippedTables.add(name);
    active = { name, columns, allowed };
  }
  if (active) throw new Error(`Truncated COPY data in ${active.name}`);
  return { tables, skippedTables: [...skippedTables].sort() };
}

export async function parseDump(path: string): Promise<DumpSource> {
  return parseCopyDump(await readFile(path, "utf8"));
}
