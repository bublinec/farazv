import type { AdminRecordSummary } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { readAdminJson } from "./admin-api";

/** Exact dates, independent of editable titles; ambiguity must never select an arbitrary draft. */
export async function findEditableBulletin(
  weekStart: CalendarDate,
  signal?: AbortSignal
): Promise<AdminRecordSummary | undefined> {
  const matches: AdminRecordSummary[] = [];
  let cursor: string | null = null;

  do {
    const query = new URLSearchParams({ kind: "bulletin", weekStart });
    if (cursor) query.set("cursor", cursor);
    const page = await readAdminJson(
      await fetch(`/api/admin/records?${query}`, { cache: "no-store", signal })
    );
    for (const item of page.items as AdminRecordSummary[]) {
      if (item.weekStart === weekStart && !item.readOnly) matches.push(item);
    }
    cursor = page.nextCursor ?? null;
  } while (cursor && matches.length < 2);

  if (matches.length > 1)
    throw new Error(
      "Pre tento týždeň existuje viac záznamov. Vyberte správny v prehľade oznamov."
    );
  return matches[0];
}
