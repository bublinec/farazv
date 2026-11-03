import "server-only";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  lt,
  ne,
  or,
  sql
} from "drizzle-orm";
import type {
  BulletinDocument,
  EditorialDocument,
  EditorialRecordKind,
  SettingsDocument
} from "@/content/documents";
import { postRecordKinds } from "@/content/posts";
import { saintCharbel } from "@/content/saint-charbel";
import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import {
  decodeCursor,
  encodeCursor,
  editorialPageSize,
  type EditorialPage,
  type EditorialSummary
} from "@/lib/editorial";
import { editorialRecordPath } from "@/lib/record-routing";
import { getDb } from "./db";
import { contentRecords } from "./db/schema";

// Public reads select the published snapshot explicitly. Drafts and provenance
// never enter these projections; request caching remains in public-content.ts.
export async function getPublishedSettings(): Promise<SettingsDocument | null> {
  const [row] = await getDb()
    .select({ document: contentRecords.published })
    .from(contentRecords)
    .where(
      and(
        eq(contentRecords.kind, "settings"),
        isNotNull(contentRecords.published)
      )
    )
    .limit(1);

  return (row?.document as SettingsDocument | null) ?? null;
}

export async function getPublishedEntry(
  kind: EditorialRecordKind,
  slug: string
): Promise<EditorialDocument | null> {
  const [row] = await getDb()
    .select({ document: contentRecords.published })
    .from(contentRecords)
    .where(
      and(
        eq(contentRecords.kind, kind),
        eq(contentRecords.publicSlug, slug),
        isNotNull(contentRecords.published)
      )
    )
    .limit(1);

  return (row?.document as EditorialDocument | null) ?? null;
}

export async function getPublishedEditorialPage(
  kind: "article" | "news",
  cursor?: string | null,
  activeOn?: CalendarDate
): Promise<EditorialPage> {
  const limit = editorialPageSize(kind, Boolean(cursor));
  const rows = await getEditorialSummaries(kind, cursor, activeOn, limit + 1);
  const items = rows.slice(0, limit);
  return {
    items,
    nextCursor:
      rows.length > limit ? encodeCursor(items[items.length - 1]) : null
  };
}

/** The homepage shows every active post, without pagination. */
export function getPublishedActivePosts(today: CalendarDate) {
  return getEditorialSummaries("news", undefined, today);
}

async function getEditorialSummaries(
  kind: "article" | "news",
  cursor?: string | null,
  activeOn?: CalendarDate,
  limit?: number
): Promise<EditorialSummary[]> {
  const after = cursor ? decodeCursor(cursor) : null;
  const date = sql<string>`${contentRecords.published}->>'date'`;
  const query = getDb()
    .select({
      id: contentRecords.id,
      slug: contentRecords.publicSlug,
      kind: contentRecords.kind,
      title: sql<string>`${contentRecords.published}->>'title'`,
      excerpt: sql<string>`${contentRecords.published}->>'excerpt'`,
      date,
      author: sql<string | null>`${contentRecords.published}->>'author'`,
      cover: sql<
        EditorialSummary["cover"]
      >`${contentRecords.published}->'cover'`
    })
    .from(contentRecords)
    .where(
      and(
        kind === "article"
          ? eq(contentRecords.kind, "article")
          : or(
              inArray(contentRecords.kind, [...postRecordKinds]),
              and(
                eq(contentRecords.kind, "article"),
                sql`${contentRecords.published}->>'showInNews' = 'true'`
              )
            ),
        isNotNull(contentRecords.published),
        isNotNull(contentRecords.publicSlug),
        // This dated post now has its own permanent homepage section.
        kind === "news"
          ? or(
              eq(contentRecords.kind, "article"),
              ne(contentRecords.publicSlug, saintCharbel.formerPostSlug)
            )
          : undefined,
        // Expired posters leave the homepage; their detail URLs stay available.
        activeOn
          ? sql`(coalesce(${contentRecords.published}->>'isPoster', 'false') <> 'true' or coalesce(${contentRecords.published}->>'posterExpiresOn', '') = '' or ${contentRecords.published}->>'posterExpiresOn' >= ${activeOn})`
          : undefined,
        after
          ? or(
              lt(date, after.date),
              and(eq(date, after.date), lt(contentRecords.id, after.id))
            )
          : undefined
      )
    )
    .orderBy(desc(date), desc(contentRecords.id));
  const rows = await (limit === undefined ? query : query.limit(limit));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug!,
    title: row.title,
    excerpt: row.excerpt ?? "",
    date: row.date as CalendarDate,
    author: row.author || undefined,
    cover: row.cover || undefined,
    href: editorialRecordPath(row.kind as EditorialRecordKind, row.slug!)
  }));
}

export async function getPublishedBulletins(today: CalendarDate) {
  const monday = getMonday(today);
  const rows = await getDb()
    .select({ document: contentRecords.published })
    .from(contentRecords)
    .where(
      and(
        eq(contentRecords.kind, "bulletin"),
        isNotNull(contentRecords.published),
        sql`${contentRecords.eligibleWeek} between ${addDays(
          monday,
          -7
        )} and ${addDays(monday, 7)}`
      )
    )
    .orderBy(desc(contentRecords.eligibleWeek))
    .limit(3);
  return rows.map((row) => ({
    ...(row.document as BulletinDocument),
    published: true
  }));
}
