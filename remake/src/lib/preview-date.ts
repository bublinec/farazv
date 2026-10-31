import "server-only";
import type { CalendarDate } from "@/content/types";
import { addDays, getLocalDate } from "@/lib/calendar";

/** Optional deterministic fixture date. Never used as a production schedule. */
export function getPreviewDate(): CalendarDate {
  const override =
    process.env.CONTENT_SOURCE === "fixtures" &&
    process.env.VERCEL_ENV !== "production"
      ? process.env.PREVIEW_DATE
      : undefined;
  if (!override) return getLocalDate();
  try {
    return addDays(override as CalendarDate, 0);
  } catch {
    throw new Error(
      "PREVIEW_DATE must be a real calendar date in YYYY-MM-DD format"
    );
  }
}
