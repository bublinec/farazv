import "server-only";
import { and, desc, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";
import type {
  LectorSchedule,
  LectorScheduleList
} from "@/content/lector-schedules";
import { lectorMonths } from "@/lib/lector-schedules";
import { getDb } from "./db";
import { lectorSchedules } from "./db/schema";
import { ContentError } from "./errors";
import { withLectorSession } from "./lector-access";
import {
  validateLectorMonth,
  validateLectorPdf,
  validateLectorVersion
} from "./lector-validation";

const metadata = {
  month: lectorSchedules.month,
  version: lectorSchedules.version,
  available: sql<boolean>`${lectorSchedules.pdf} is not null`,
  bytes: sql<number>`coalesce(octet_length(${lectorSchedules.pdf}),0)`,
  updatedAt: lectorSchedules.updatedAt,
  updatedBy: lectorSchedules.updatedBy
};
function monthsWithEmptySlots(
  months: string[],
  rows: LectorSchedule[]
): LectorSchedule[] {
  return months.map(
    (month) =>
      rows.find((row) => row.month === month) ?? {
        month,
        version: 0,
        available: false,
        bytes: 0,
        updatedAt: null
      }
  );
}

export async function listAdminLectorSchedules(
  cursor?: string
): Promise<LectorScheduleList> {
  const months = lectorMonths();
  if (cursor !== undefined) validateLectorMonth(cursor);
  const rows = await getDb()
    .select(metadata)
    .from(lectorSchedules)
    .where(inArray(lectorSchedules.month, months));
  const history = await getDb()
    .select(metadata)
    .from(lectorSchedules)
    .where(
      and(
        lt(lectorSchedules.month, months[0]),
        isNotNull(lectorSchedules.pdf),
        cursor ? lt(lectorSchedules.month, cursor) : undefined
      )
    )
    .orderBy(desc(lectorSchedules.month))
    .limit(13);
  return {
    months: monthsWithEmptySlots(months, rows),
    history: history.slice(0, 12),
    nextCursor: history.length > 12 ? history[11].month : null
  };
}

export async function saveLectorSchedule(
  monthValue: unknown,
  versionValue: unknown,
  bytes: Buffer,
  actor: string
) {
  const month = validateLectorMonth(monthValue);
  const version = validateLectorVersion(versionValue);
  const pdf = validateLectorPdf(bytes);
  if (!lectorMonths().includes(month))
    throw new ContentError(
      422,
      "Nahrať môžete rozpis na aktuálny alebo nasledujúci mesiac.",
      "MONTH_NOT_OPEN"
    );

  const rows =
    version === 0
      ? await getDb()
          .insert(lectorSchedules)
          .values({ month, pdf, updatedBy: actor })
          .onConflictDoNothing()
          .returning({ month: lectorSchedules.month })
      : await getDb()
          .update(lectorSchedules)
          .set({
            pdf,
            version: sql`${lectorSchedules.version}+1`,
            updatedBy: actor,
            updatedAt: sql`now()`
          })
          .where(
            and(
              eq(lectorSchedules.month, month),
              eq(lectorSchedules.version, version)
            )
          )
          .returning({ month: lectorSchedules.month });
  if (!rows.length)
    throw new ContentError(
      409,
      "Rozpis medzičasom zmenil iný používateľ. Obnovte zoznam a skúste znova.",
      "SCHEDULE_CONFLICT"
    );
  return { saved: true };
}

export async function deleteLectorSchedule(
  monthValue: unknown,
  versionValue: unknown,
  actor: string
) {
  const month = validateLectorMonth(monthValue);
  const version = validateLectorVersion(versionValue);
  // Keep a tombstone and monotonic version, preventing a stale edit after delete/recreate.
  const rows = await getDb()
    .update(lectorSchedules)
    .set({
      pdf: null,
      version: sql`${lectorSchedules.version}+1`,
      updatedBy: actor,
      updatedAt: sql`now()`
    })
    .where(
      and(
        eq(lectorSchedules.month, month),
        eq(lectorSchedules.version, version),
        isNotNull(lectorSchedules.pdf)
      )
    )
    .returning({ month: lectorSchedules.month });
  if (!rows.length)
    throw new ContentError(
      409,
      "Rozpis sa medzičasom zmenil. Obnovte zoznam a skúste znova.",
      "SCHEDULE_CONFLICT"
    );
  return { deleted: true };
}

export async function getAdminLectorPdf(monthValue: unknown): Promise<Buffer> {
  const month = validateLectorMonth(monthValue);
  const [row] = await getDb()
    .select({ pdf: lectorSchedules.pdf })
    .from(lectorSchedules)
    .where(eq(lectorSchedules.month, month));
  if (!row?.pdf)
    throw new ContentError(
      404,
      "Rozpis na tento mesiac zatiaľ nie je nahraný.",
      "SCHEDULE_NOT_FOUND"
    );
  return row.pdf;
}

export async function listPublicLectorSchedules(request: Request) {
  return withLectorSession(request, async (tx) => {
    const months = lectorMonths();
    const rows = await tx
      .select({
        month: metadata.month,
        version: metadata.version,
        available: metadata.available,
        bytes: metadata.bytes,
        updatedAt: metadata.updatedAt
      })
      .from(lectorSchedules)
      .where(inArray(lectorSchedules.month, months));
    return { months: monthsWithEmptySlots(months, rows) };
  });
}

export async function getPublicLectorPdf(
  request: Request,
  monthValue: unknown
): Promise<Buffer> {
  return withLectorSession(request, async (tx) => {
    const month = validateLectorMonth(monthValue);
    if (!lectorMonths().includes(month))
      throw new ContentError(
        404,
        "Tento rozpis nie je dostupný.",
        "SCHEDULE_NOT_FOUND"
      );
    const [row] = await tx
      .select({ pdf: lectorSchedules.pdf })
      .from(lectorSchedules)
      .where(eq(lectorSchedules.month, month));
    if (!row?.pdf)
      throw new ContentError(
        404,
        "Rozpis na tento mesiac zatiaľ nie je nahraný.",
        "SCHEDULE_NOT_FOUND"
      );
    return row.pdf;
  });
}
