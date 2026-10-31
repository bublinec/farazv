import {
  BULLETIN_IMPORT_MAX_TEXT,
  type BulletinImportResult
} from "@/content/bulletin-import";
import { addDays, getMonday } from "./calendar";
import type { CalendarDate } from "@/content/types";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.length <= BULLETIN_IMPORT_MAX_TEXT;
}

function optionalText(value: unknown) {
  return value === undefined || text(value);
}

function date(value: unknown): value is CalendarDate {
  if (typeof value !== "string") return false;
  try {
    return addDays(value as CalendarDate, 0) === value;
  } catch {
    return false;
  }
}

function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length <= BULLETIN_IMPORT_MAX_TEXT;
}

/** The API and tab handoff share this guard so malformed review data cannot crash the editor. */
export function isBulletinImportResult(
  value: unknown
): value is BulletinImportResult {
  if (!object(value)) return false;
  if (!text(value.filename) || value.filename.length > 200 || !text(value.text))
    return false;
  if (!["doc", "docx", "text"].includes(value.format as string)) return false;
  if (
    value.suggestedWeekStart !== null &&
    (!date(value.suggestedWeekStart) ||
      getMonday(value.suggestedWeekStart) !== value.suggestedWeekStart)
  )
    return false;

  if (
    !list(value.days) ||
    value.days.length > 62 ||
    !value.days.every(
      (day) =>
        object(day) &&
        date(day.date) &&
        optionalText(day.liturgy) &&
        ["scheduled", "no-masses", "unpublished"].includes(
          day.status as string
        ) &&
        list(day.masses) &&
        day.masses.every(
          (mass) =>
            object(mass) &&
            text(mass.time) &&
            optionalText(mass.location) &&
            optionalText(mass.intention) &&
            optionalText(mass.celebrant) &&
            optionalText(mass.label)
        )
    )
  )
    return false;

  if (
    new Set(value.days.map((day) => (day as Record<string, unknown>).date))
      .size !== value.days.length
  )
    return false;
  if (!list(value.announcements) || !value.announcements.every(text))
    return false;
  if (!list(value.unassigned) || !value.unassigned.every(text)) return false;
  if (
    !list(value.donations) ||
    !value.donations.every(
      (donation) =>
        object(donation) &&
        text(donation.label) &&
        optionalText(donation.amount) &&
        optionalText(donation.category)
    )
  )
    return false;
  if (
    !list(value.warnings) ||
    !value.warnings.every(
      (warning) =>
        object(warning) &&
        text(warning.code) &&
        text(warning.message) &&
        (warning.date === undefined || date(warning.date))
    )
  )
    return false;

  return true;
}
