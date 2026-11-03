import "server-only";
import type { CalendarDate } from "@/content/types";
import { addDays, getLocalDate } from "@/lib/calendar";

/** Optional deterministic fixture clock. Never used as a production schedule. */
export function getPreviewNow(): Date {
  const override =
    process.env.CONTENT_SOURCE === "fixtures" &&
    process.env.VERCEL_ENV !== "production"
      ? process.env.PREVIEW_DATE
      : undefined;
  if (!override) return new Date();
  try {
    const date = addDays(override as CalendarDate, 0);
    // A date-only fixture uses daytime, before the Saturday evening cutoff.
    return new Date(`${date}T12:00:00.000Z`);
  } catch {
    throw new Error(
      "PREVIEW_DATE must be a real calendar date in YYYY-MM-DD format"
    );
  }
}

export function getPreviewDate(): CalendarDate {
  return getLocalDate(getPreviewNow());
}
