import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import type {
  AdminRecordSummary,
  ContentDocument,
  ContentRecord,
  ContentRecordFor,
  RecordKind
} from "@/content/documents";
import { addDays, getMonday, getLocalDate } from "@/lib/calendar";
import { getPublishedSettings } from "./published-store";
import { getDb } from "./db";
import { contentRecords } from "./db/schema";
import { ContentError } from "./errors";
import { isCalendarDate, recordKinds, validateDocument } from "./validation";

type DbRow = typeof contentRecords.$inferSelect;
function toRecord(row: DbRow): ContentRecord {
  if (!recordKinds.includes(row.kind as RecordKind))
    throw new Error("Stored content has an unknown record kind.");

  // Historical quarantined documents remain readable. Strict validation belongs
  // to editor writes, not deserialization of the preserved source snapshot.
  return {
    id: row.id,
    kind: row.kind as RecordKind,
    title: row.title,
    slug: row.slug,
    draft: row.draft,
    published: row.published,
    version: row.version,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    source: row.source,
    readOnly: row.readOnly
  } as ContentRecord;
}

export async function getRecord(id: string): Promise<ContentRecord | null> {
  const [row] = await getDb()
    .select()
    .from(contentRecords)
    .where(eq(contentRecords.id, id))
    .limit(1);

  return row ? toRecord(row) : null;
}

export async function listRecords(
  options: {
    kind?: string;
    query?: string;
    cursor?: string;
    weekStart?: string;
  } = {}
) {
  if (options.kind && !recordKinds.includes(options.kind as RecordKind))
    throw new ContentError(400, "Neplatný typ obsahu.", "INVALID_QUERY");
  if (
    options.weekStart &&
    (options.kind !== "bulletin" ||
      !isCalendarDate(options.weekStart) ||
      getMonday(options.weekStart) !== options.weekStart)
  )
    throw new ContentError(
      400,
      "Vyberte platný pondelok týždňa oznamov.",
      "INVALID_QUERY"
    );
  let cursor: { date: string; id: string } | undefined;
  if (options.cursor) {
    try {
      cursor = JSON.parse(Buffer.from(options.cursor, "base64url").toString());
    } catch {
      throw new ContentError(400, "Neplatné stránkovanie.", "INVALID_QUERY");
    }
    if (
      !cursor ||
      typeof cursor.id !== "string" ||
      cursor.id.length > 200 ||
      typeof cursor.date !== "string" ||
      !Number.isFinite(Date.parse(cursor.date))
    )
      throw new ContentError(400, "Neplatné stránkovanie.", "INVALID_QUERY");
  }
  const rows = await getDb()
    .select({
      id: contentRecords.id,
      kind: contentRecords.kind,
      title: contentRecords.title,
      slug: contentRecords.slug,
      version: contentRecords.version,
      publishedAt: contentRecords.publishedAt,
      updatedAt: contentRecords.updatedAt,
      source: contentRecords.source,
      readOnly: contentRecords.readOnly,
      isPublished: sql<boolean>`${contentRecords.published} is not null`,
      weekStart: sql<string | null>`${contentRecords.draft}->>'weekStart'`
    })
    .from(contentRecords)
    .where(
      and(
        options.kind ? eq(contentRecords.kind, options.kind) : undefined,
        options.weekStart
          ? eq(sql`${contentRecords.draft}->>'weekStart'`, options.weekStart)
          : undefined,
        options.query
          ? ilike(
              contentRecords.title,
              `%${options.query.slice(0, 150).replace(/[\\%_]/g, "\\$&")}%`
            )
          : undefined,
        cursor
          ? or(
              lt(contentRecords.updatedAt, cursor.date),
              and(
                eq(contentRecords.updatedAt, cursor.date),
                lt(contentRecords.id, cursor.id)
              )
            )
          : undefined
      )
    )
    .orderBy(desc(contentRecords.updatedAt), desc(contentRecords.id))
    .limit(31);
  const items = rows.slice(0, 30).map((row) => ({
    ...row,
    kind: row.kind as RecordKind,
    weekStart: row.weekStart ?? undefined
  })) as AdminRecordSummary[];
  const last = items.at(-1);
  return {
    items,
    nextCursor:
      rows.length > 30 && last
        ? Buffer.from(
            JSON.stringify({ date: last.updatedAt, id: last.id })
          ).toString("base64url")
        : null
  };
}

export async function createRecord<K extends RecordKind>(
  kind: K,
  weekStart?: string
): Promise<ContentRecordFor<K>> {
  if (!recordKinds.includes(kind))
    throw new ContentError(422, "Neplatný typ obsahu.", "INVALID_KIND");
  if (kind === "settings") {
    const existing = await getRecord("site-settings");
    if (existing) return existing as ContentRecordFor<K>;
  }
  const id = kind === "settings" ? "site-settings" : randomUUID();
  let draft: ContentDocument;
  if (kind === "bulletin") {
    if (!isCalendarDate(weekStart) || getMonday(weekStart) !== weekStart)
      throw new ContentError(
        422,
        "Vyberte pondelok pripravovaného týždňa.",
        "INVALID_WEEK"
      );
    const settings = await getPublishedSettings();
    draft = {
      id,
      weekStart,
      days: Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
        const masses = (settings?.regularSchedule[weekday] ?? []).map(
          ({ time, location, label }) => ({
            time,
            ...(location ? { location } : {}),
            ...(label ? { label } : {})
          })
        );
        return {
          date,
          liturgy: "",
          masses,
          status: masses.length
            ? ("scheduled" as const)
            : ("unpublished" as const)
        };
      }),
      announcements: [],
      donations: []
    };
  } else if (kind === "settings") {
    draft = {
      name: "",
      shortName: "",
      location: "",
      address: "",
      phone: "",
      email: "",
      iban: "",
      officeHours: [],
      preparationMeetings: [],
      regularSchedule: {},
      priests: []
    };
  } else {
    draft = {
      id,
      title: "",
      slug: "",
      excerpt: "",
      date: getLocalDate(),
      blocks: [],
      body: { type: "doc", content: [{ type: "paragraph" }] },
      showInNews: kind === "news"
    };
  }
  const [row] = await getDb()
    .insert(contentRecords)
    .values({
      id,
      kind,
      title:
        kind === "bulletin"
          ? `Farské oznamy ${weekStart}`
          : kind === "settings"
          ? "Nastavenia farnosti"
          : "Bez názvu",
      draft
    })
    .onConflictDoNothing()
    .returning();

  return (row ? toRecord(row) : (await getRecord(id))!) as ContentRecordFor<K>;
}

function publicIdentity(record: ContentRecord) {
  switch (record.kind) {
    case "bulletin":
      return { title: `Farské oznamy ${record.draft.weekStart}`, slug: null };
    case "settings":
      return { title: "Nastavenia farnosti", slug: null };
    case "article":
    case "news":
    case "notice":
    case "event": {
      const { title, slug } = record.draft;
      return {
        title: typeof title === "string" ? title : "",
        slug: typeof slug === "string" && slug ? slug : null
      };
    }
  }
}

function translateDbError(error: unknown): never {
  const cause =
    (error as { cause?: { code?: string } }).cause ??
    (error as { code?: string });
  if (cause?.code === "23505")
    throw new ContentError(
      409,
      "Táto URL alebo publikovaný týždeň už existuje. Skontrolujte ostatné záznamy.",
      "DUPLICATE_CONTENT"
    );
  throw error;
}

export async function updateRecord(
  id: string,
  version: number,
  input: unknown,
  action: "save" | "publish" | "unpublish"
) {
  if (!Number.isSafeInteger(version) || version < 1)
    throw new ContentError(
      422,
      "Chýba verzia záznamu. Obnovte stránku.",
      "INVALID_VERSION"
    );
  const current = await getRecord(id);
  if (!current) throw new ContentError(404, "Záznam sa nenašiel.", "NOT_FOUND");
  if (current.readOnly)
    throw new ContentError(
      403,
      "Historický rozpis je zachovaný iba na čítanie. Vytvorte nový týždeň.",
      "READ_ONLY"
    );
  if (current.version !== version)
    throw new ContentError(
      409,
      "Obsah medzitým zmenil iný redaktor. Vaše údaje zostali vo formulári; otvorte aktuálnu verziu v novej karte.",
      "VERSION_CONFLICT"
    );
  if (current.kind === "settings" && action === "unpublish")
    throw new ContentError(
      422,
      "Základné nastavenia farnosti nemožno zrušiť.",
      "SETTINGS_REQUIRED"
    );
  const document =
    action === "unpublish"
      ? current.draft
      : validateDocument(
          current.kind,
          input ?? current.draft,
          action === "publish"
        );
  if ("id" in document) document.id = id;
  // The parser above selected its document family from this envelope's kind.
  // Keep that correlation at this write boundary for the remaining operations.
  const edited = { ...current, draft: document } as ContentRecord;
  const identity = publicIdentity(edited);

  const [existing] = await getDb()
    .select({ publicSlug: contentRecords.publicSlug })
    .from(contentRecords)
    .where(eq(contentRecords.id, id));
  if (existing.publicSlug && existing.publicSlug !== identity.slug)
    throw new ContentError(
      422,
      "URL už publikovaného obsahu zostáva zachovaná aj po zmene názvu.",
      "IMMUTABLE_PATH"
    );
  if (
    current.kind === "settings" &&
    edited.kind === "settings" &&
    action === "publish" &&
    current.published
  ) {
    const previous = current.published;
    const next = edited.draft;
    if (
      previous.iban.replace(/\s/g, "") !== next.iban.replace(/\s/g, "") &&
      previous.donationQr?.src === next.donationQr?.src &&
      next.donationQr
    )
      throw new ContentError(
        422,
        "Pri zmene účtu aktualizujte alebo odstráňte aj platobný QR kód.",
        "STALE_DONATION_QR"
      );
  }
  try {
    const [row] = await getDb()
      .update(contentRecords)
      .set({
        draft: document,
        ...identity,
        updatedAt: new Date().toISOString(),
        version: sql`${contentRecords.version} + 1`,
        ...(action === "publish"
          ? {
              published: document,
              publicSlug: identity.slug,
              publishedAt: new Date().toISOString(),
              eligibleWeek:
                edited.kind === "bulletin" ? edited.draft.weekStart : null
            }
          : {}),
        ...(action === "unpublish"
          ? { published: null, eligibleWeek: null }
          : {})
      })
      .where(
        and(eq(contentRecords.id, id), eq(contentRecords.version, version))
      )
      .returning();
    if (!row)
      throw new ContentError(
        409,
        "Obsah medzitým zmenil iný redaktor. Vaše údaje zostali vo formulári.",
        "VERSION_CONFLICT"
      );
    return toRecord(row);
  } catch (error) {
    return translateDbError(error);
  }
}
