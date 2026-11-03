import type { CalendarDate } from "@/content/types";
import { formatDate } from "@/lib/calendar";

const timestampFormatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Bratislava"
});

export function formatAdminTimestamp(value: string) {
  return timestampFormatter.format(new Date(value));
}

/** Read-only imports retain invalid source dates instead of repairing or hiding them. */
export function formatRecordDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric" }
): string {
  try {
    return formatDate(value as CalendarDate, options);
  } catch {
    return String(value || "Dátum neuvedený");
  }
}
