import "server-only";
import { and, desc, eq, isNotNull, lt, or, sql } from "drizzle-orm";
import type {
  BulletinDocument,
  EditorialDocument,
  RecordKind,
  SettingsDocument
} from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import {
  decodeCursor,
  encodeCursor,
  INITIAL_EDITORIAL_COUNT,
  MORE_EDITORIAL_COUNT,
  type EditorialPage,
  type EditorialSummary
} from "@/lib/editorial";
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
  kind: RecordKind,
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
  cursor?: string | null
): Promise<EditorialPage> {
  const after = cursor ? decodeCursor(cursor) : null;
  const limit = after ? MORE_EDITORIAL_COUNT : INITIAL_EDITORIAL_COUNT;
  const date = sql<string>`${contentRecords.published}->>'date'`;
  const rows = await getDb()
    .select({
      document: sql<EditorialSummary>`jsonb_build_object('id', ${contentRecords.id}, 'slug', ${contentRecords.publicSlug}, 'title', ${contentRecords.published}->>'title', 'excerpt', ${contentRecords.published}->>'excerpt', 'date', ${date}, 'author', ${contentRecords.published}->>'author', 'cover', ${contentRecords.published}->'cover', 'href', (case when ${contentRecords.kind} = 'article' then '/farnost/nase-spolocenstvo/' when ${contentRecords.kind} = 'notice' then '/vyveska/' else '/prispevky/' end) || ${contentRecords.publicSlug})`
    })
    .from(contentRecords)
    .where(
      and(
        kind === "article"
          ? eq(contentRecords.kind, "article")
          : sql`(${contentRecords.kind} in ('article', 'news', 'notice', 'event') and (${contentRecords.published}->>'showInNews' = 'true' or (${contentRecords.kind} = 'news' and coalesce(${contentRecords.published}->>'showInNews', 'true') <> 'false')))`,
        isNotNull(contentRecords.published),
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
  const items = rows.slice(0, limit).map((row) => ({
    ...row.document,
    author: row.document.author || undefined,
    cover: row.document.cover || undefined,
    excerpt: row.document.excerpt ?? ""
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

export async function getPosterCandidates(): Promise<
  (EditorialDocument & { recordKind: RecordKind })[]
> {
  const rows = await getDb()
    .select({ document: contentRecords.published, kind: contentRecords.kind })
    .from(contentRecords)
    .where(
      and(
        isNotNull(contentRecords.published),
        sql`${contentRecords.published}->>'isPoster' = 'true'`
      )
    )
    .orderBy(
      desc(sql`${contentRecords.published}->>'date'`),
      desc(contentRecords.id)
    )
    .limit(100);
  return rows.map((row) => ({
    ...(row.document as EditorialDocument),
    recordKind: row.kind as RecordKind
  }));
}
