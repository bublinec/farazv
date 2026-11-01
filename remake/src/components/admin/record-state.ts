import type { AdminRecordSummary, ContentRecord } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import {
  addDays,
  BULLETIN_SWITCH_HOUR,
  getBulletinWeekStart
} from "@/lib/calendar";
import { formatRecordDate } from "./admin-format";

function canonical(value: unknown): string {
  return JSON.stringify(value, (_, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        )
      : item
  );
}

export function hasUnpublishedChanges(record: ContentRecord) {
  return (
    !!record.published &&
    canonical(record.draft) !== canonical(record.published)
  );
}

export function scheduledPublication(record: ContentRecord) {
  if (record.kind !== "bulletin" || !record.published) return null;

  const date = record.published.weekStart;
  return date > getBulletinWeekStart() ? date : null;
}

export function formatBulletinStart(weekStart: CalendarDate) {
  return `${formatRecordDate(
    addDays(weekStart, -2)
  )} o ${BULLETIN_SWITCH_HOUR}:00`;
}

export function recordStateLabel(record: ContentRecord) {
  if (record.readOnly) return "História";
  if (!record.published) return "Koncept";
  if (hasUnpublishedChanges(record)) return "Nezverejnené zmeny";

  const date = scheduledPublication(record);
  return date ? `Naplánované od ${formatBulletinStart(date)}` : "Zverejnené";
}

export function publicationMessage(record: ContentRecord) {
  if (record.kind === "settings") return "Nastavenia sú uložené.";

  const date = scheduledPublication(record);
  return date
    ? `Zverejnenie je naplánované od ${formatBulletinStart(date)}.`
    : "Zverejnené.";
}

export function summaryStateLabel(record: AdminRecordSummary) {
  if (record.readOnly) return "História · iba čítanie";
  if (!record.isPublished) return "Koncept";
  if (record.hasUnpublishedChanges) return "Nezverejnené zmeny";
  if (record.kind === "bulletin" && record.weekStart) {
    try {
      const date = addDays(record.weekStart as CalendarDate, 0);
      if (date > getBulletinWeekStart())
        return `Naplánované od ${formatBulletinStart(date)}`;
    } catch {
      // Keep preserved imported dates readable; editing validates them separately.
    }
  }
  return "Zverejnené";
}
