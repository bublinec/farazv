import type { AdminRecordSummary, ContentRecordFor } from "@/content/documents";
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

/** Load the snapshots as well when the UI must distinguish draft and live content. */
export async function loadEditableBulletin(
  weekStart: CalendarDate,
  signal?: AbortSignal
): Promise<ContentRecordFor<"bulletin"> | undefined> {
  const item = await findEditableBulletin(weekStart, signal);
  if (!item || signal?.aborted) return;

  const record = await readAdminJson(
    await fetch(`/api/admin/records/${encodeURIComponent(item.id)}`, {
      cache: "no-store",
      signal
    })
  );
  if (record.kind !== "bulletin" || record.readOnly)
    throw new Error("Týždeň sa nepodarilo načítať.");
  return record as ContentRecordFor<"bulletin">;
}
