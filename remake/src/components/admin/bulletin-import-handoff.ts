import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { isBulletinImportResult } from "@/lib/bulletin-import-result";

const key = "farazv:bulletin-import-review";
const lifetime = 60 * 60 * 1000;

/** A one-use handoff within this tab; it never saves imported content to the server. */
export function storeBulletinImport(
  weekStart: CalendarDate,
  result: BulletinImportResult,
  fillForm = false
) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        version: 2,
        expiresAt: Date.now() + lifetime,
        weekStart,
        result,
        fillForm
      })
    );
  } catch {
    throw new Error(
      "Prehliadač nepovolil dočasne preniesť dokument. Otvorte správny týždeň a vyberte dokument znova."
    );
  }
}

export function takeBulletinImport(
  weekStart: CalendarDate
): { result: BulletinImportResult; fillForm: boolean } | undefined {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return;
    if (stored.length > 4_000_000) {
      clearBulletinImport();
      return;
    }
    const handoff = JSON.parse(stored);
    if (
      !handoff ||
      handoff.version !== 2 ||
      !Number.isFinite(handoff.expiresAt) ||
      handoff.expiresAt < Date.now() ||
      !isBulletinImportResult(handoff.result)
    ) {
      clearBulletinImport();
      return;
    }
    if (handoff.weekStart !== weekStart) return;
    clearBulletinImport();
    return { result: handoff.result, fillForm: handoff.fillForm === true };
  } catch {
    clearBulletinImport();
  }
}

export function clearBulletinImport() {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Uploading, reviewing and saving still work when browser storage is blocked.
  }
}
