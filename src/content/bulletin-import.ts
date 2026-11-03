import type { BulletinDocument } from "./documents";
import type { CalendarDate, ScheduleDay } from "./types";

/** An import is a reviewable suggestion, never a saved or published bulletin. */
export interface BulletinImportResult {
  filename: string;
  format: "doc" | "docx" | "text";
  text: string;
  suggestedWeekStart: CalendarDate | null;
  days: ScheduleDay[];
  announcements: string[];
  donations: NonNullable<BulletinDocument["donations"]>;
  warnings: { code: string; message: string; date?: CalendarDate }[];
  unassigned: string[];
}

export const BULLETIN_IMPORT_MAX_BYTES = 3_000_000;
export const BULLETIN_IMPORT_MAX_TEXT = 200_000;
