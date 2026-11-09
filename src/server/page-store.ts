import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import type { ContentRecordFor } from "@/content/documents";
import {
  pageRecordId,
  pageRoute,
  pageSlugPattern,
  slugifyPageTitle,
  type PageDocument,
  type PageGroup,
  type PageRevision,
  type PageSummary
} from "@/content/page-documents";
import { getDb } from "./db";
import { contentRecords, contentRevisions } from "./db/schema";
import { ContentError } from "./errors";
import { getRecord, updateRecord } from "./content-store";
import {
  builtInEditablePages,
  emptyPageDocument,
  isBuiltInEditablePage,
  isStaticInformationRoute,
  seedPageDocument
} from "./page-seed";
import { validateDocument } from "./validation";

/** Built-in pages first (in menu order), then pages added by editors. */
export async function listPages(): Promise<PageSummary[]> {
  const rows = await getDb()
    .select({
      id: contentRecords.id,
      title: contentRecords.title,
      route: sql<string>`${contentRecords.draft}->>'route'`,
      group: sql<PageGroup>`${contentRecords.draft}->>'group'`,
      isPublished: sql<boolean>`${contentRecords.published} is not null`,
      hasUnpublishedChanges: sql<boolean>`${contentRecords.published} is not null and ${contentRecords.draft} <> ${contentRecords.published}`,
      updatedAt: contentRecords.updatedAt
    })
    .from(contentRecords)
    .where(eq(contentRecords.kind, "page"))
    .orderBy(contentRecords.createdAt, contentRecords.id);

  const records = new Map(rows.map((row) => [row.route, row]));
  const builtIn = builtInEditablePages().map((page): PageSummary => {
    const row = records.get(page.route);
    return {
      route: page.route,
      group: page.group,
      title: row?.title ?? page.title,
      builtIn: true,
      recordId: row?.id ?? null,
      isPublished: row?.isPublished ?? false,
      hasUnpublishedChanges: row?.hasUnpublishedChanges ?? false,
      updatedAt: row?.updatedAt ?? null
    };
  });
  const added = rows
    .filter((row) => !isBuiltInEditablePage(row.route))
    .map(
      (row): PageSummary => ({
        route: row.route,
        group: row.group,
        title: row.title,
        builtIn: false,
        recordId: row.id,
        isPublished: row.isPublished,
        hasUnpublishedChanges: row.hasUnpublishedChanges,
        updatedAt: row.updatedAt
      })
    );

  return [...builtIn, ...added];
}

async function insertPage(
  route: string,
  draft: PageDocument,
  actor: string
): Promise<ContentRecordFor<"page"> | null> {
  const id = pageRecordId(route);
  const document = validateDocument("page", draft);

  const created = await getDb().transaction(async (transaction) => {
    const [row] = await transaction
      .insert(contentRecords)
      .values({
        id,
        kind: "page",
        title: document.title || "Bez názvu",
        slug: route,
        draft: document
      })
      .onConflictDoNothing()
      .returning({ id: contentRecords.id, version: contentRecords.version });
    if (!row) return false;

    // The first history entry is the starting point, e.g. the code version.
    await transaction.insert(contentRevisions).values({
      id: randomUUID(),
      recordId: id,
      version: row.version,
      action: "save",
      document,
      actor
    });
    return true;
  });

  return created ? ((await getRecord(id)) as ContentRecordFor<"page">) : null;
}

/** Open a built-in page: the first call copies its current code version. */
export async function openBuiltInPage(route: string, actor: string) {
  if (!isBuiltInEditablePage(route))
    throw new ContentError(404, "Stránka sa nenašla.", "NOT_FOUND");

  const existing = await getRecord(pageRecordId(route));
  if (existing) return existing;

  return (
    (await insertPage(route, seedPageDocument(route), actor)) ??
    ((await getRecord(pageRecordId(route))) as ContentRecordFor<"page">)
  );
}

/** Add a new sacrament or service page as a private draft. */
export async function createPage(
  group: unknown,
  title: unknown,
  slug: unknown,
  actor: string
) {
  if (group !== "sacrament" && group !== "service")
    throw new ContentError(422, "Vyberte skupinu stránky.", "INVALID_CONTENT");
  if (typeof title !== "string" || !title.trim() || title.length > 300)
    throw new ContentError(
      422,
      "Vyplňte názov novej stránky.",
      "INVALID_CONTENT",
      "title"
    );

  const pageSlug =
    typeof slug === "string" && slug.trim()
      ? slug.trim()
      : slugifyPageTitle(title);
  if (!pageSlugPattern.test(pageSlug) || pageSlug.length > 80)
    throw new ContentError(
      422,
      "Adresa môže obsahovať malé písmená bez diakritiky, čísla a pomlčky.",
      "INVALID_CONTENT",
      "slug"
    );

  const route = pageRoute(group, pageSlug);
  if (isStaticInformationRoute(route))
    throw new ContentError(
      409,
      `Adresa /${route} už patrí existujúcej stránke. Zvoľte inú.`,
      "DUPLICATE_CONTENT",
      "slug"
    );

  const created = await insertPage(
    route,
    emptyPageDocument(group, route, title.trim()),
    actor
  );
  if (!created)
    throw new ContentError(
      409,
      `Stránka s adresou /${route} už existuje.`,
      "DUPLICATE_CONTENT",
      "slug"
    );

  return created;
}

export async function listPageRevisions(
  recordId: string
): Promise<PageRevision[]> {
  const rows = await getDb()
    .select({
      id: contentRevisions.id,
      recordId: contentRevisions.recordId,
      version: contentRevisions.version,
      action: contentRevisions.action,
      actor: contentRevisions.actor,
      createdAt: contentRevisions.createdAt,
      title: sql<string>`coalesce(${contentRevisions.document}->>'title', '')`
    })
    .from(contentRevisions)
    .where(eq(contentRevisions.recordId, recordId))
    .orderBy(desc(contentRevisions.createdAt), desc(contentRevisions.version))
    .limit(100);

  return rows;
}

/**
 * Restore an earlier version into the page. Like any save, a page that is
 * already public shows the restored version immediately.
 */
export async function restorePageRevision(
  recordId: string,
  revisionId: string,
  version: number,
  actor: string
) {
  const record = await getRecord(recordId);
  if (!record || record.kind !== "page")
    throw new ContentError(404, "Stránka sa nenašla.", "NOT_FOUND");

  const [revision] = await getDb()
    .select({ document: contentRevisions.document })
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.id, revisionId),
        eq(contentRevisions.recordId, recordId)
      )
    )
    .limit(1);
  if (!revision) throw new ContentError(404, "Verzia sa nenašla.", "NOT_FOUND");

  return updateRecord(recordId, version, revision.document, "save", {
    actor,
    revisionAction: "restore"
  });
}
