import "server-only";
import { and, desc, eq, inArray, isNotNull, lt, or, sql } from "drizzle-orm";
import type {
  BulletinDocument,
  EditorialDocument,
  EditorialRecordKind,
  SettingsDocument
} from "@/content/documents";
import { postKinds } from "@/content/posts";
import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import {
  decodeCursor,
  encodeCursor,
  INITIAL_EDITORIAL_COUNT,
  MORE_EDITORIAL_COUNT,
  type EditorialPage,
  type EditorialSummary,
  type PublishedEditorialEntry
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
): Promise<PublishedEditorialEntry | null> {
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

  return row?.document
    ? { ...(row.document as EditorialDocument), recordKind: kind }
    : null;
}

export async function getPublishedEditorialPage(
  kind: "article" | "news",
  cursor?: string | null,
  activeOn?: CalendarDate
): Promise<EditorialPage> {
  const after = cursor ? decodeCursor(cursor) : null;
  const limit = after ? MORE_EDITORIAL_COUNT : INITIAL_EDITORIAL_COUNT;
  const date = sql<string>`${contentRecords.published}->>'date'`;
  const rows = await getDb()
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
      >`${contentRecords.published}->'cover'`,
      isPoster: sql<boolean>`coalesce(${contentRecords.published}->>'isPoster', 'false') = 'true'`
    })
    .from(contentRecords)
    .where(
      and(
        kind === "article"
          ? eq(contentRecords.kind, "article")
          : or(
              inArray(contentRecords.kind, [...postKinds]),
              and(
                eq(contentRecords.kind, "article"),
                sql`${contentRecords.published}->>'showInNews' = 'true'`
              )
            ),
        isNotNull(contentRecords.published),
        isNotNull(contentRecords.publicSlug),
        // Expiry only removes a poster from the homepage; its archive and URL stay available.
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
    .orderBy(desc(date), desc(contentRecords.id))
    .limit(limit + 1);
  const items: EditorialSummary[] = rows.slice(0, limit).map((row) => ({
    id: row.id,
    slug: row.slug!,
    title: row.title,
    excerpt: row.excerpt ?? "",
    date: row.date as CalendarDate,
    author: row.author || undefined,
    cover: row.cover || undefined,
    isPoster: row.isPoster,
    recordKind: row.kind as EditorialRecordKind,
    href: editorialRecordPath(row.kind as EditorialRecordKind, row.slug!)
  }));
  return {
    items,
    nextCursor:
      rows.length > limit ? encodeCursor(items[items.length - 1]) : null
  };
}

export async function getPublishedBulletins(today: CalendarDate) {
  const monday = getMonday(addDays(today, 1));
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
