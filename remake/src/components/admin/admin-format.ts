import type { CalendarDate } from "@/content/types";
import { formatDate } from "@/lib/calendar";
/** Read-only imports retain invalid source dates instead of repairing or hiding them. */
export function formatRecordDate(
  value: CalendarDate,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    return formatDate(value, options);
  } catch {
    return String(value || "Dátum neuvedený");
  }
}
