import type { BulletinDocument } from "@/content/documents";
import type { BulletinImportResult } from "@/content/bulletin-import";
import { sameMasses } from "./mass";
import { formatDate } from "./calendar";

function sameDonations(
  left: BulletinDocument["donations"] = [],
  right: BulletinDocument["donations"] = []
) {
  return (
    left.length === right.length &&
    left.every((donation, index) => {
      const other = right[index];
      return (
        donation.label === other.label &&
        (donation.amount ?? "") === (other.amount ?? "") &&
        (donation.category ?? "") === (other.category ?? "")
      );
    })
  );
}

/** Name actual existing content that the import will replace, rather than merging duplicate Mass times. */
export function bulletinImportReplacements(
  current: BulletinDocument,
  next: BulletinDocument
): string[] {
  const replacements: string[] = [];

  current.days.forEach((day, index) => {
    const imported = next.days[index];
    if (!imported || day === imported) return;
    const replacesMasses =
      (day.masses.length > 0 || day.status === "no-masses") &&
      (day.status !== imported.status ||
        !sameMasses(day.masses, imported.masses));
    const replacesLiturgy = day.liturgy && day.liturgy !== imported.liturgy;
    if (replacesMasses || replacesLiturgy)
      replacements.push(
        `Rozpis ${formatDate(day.date)}${
          replacesMasses ? ` (${day.masses.length} omší)` : ""
        }`
      );
  });

  if (
    current.announcements.length &&
    JSON.stringify(current.announcements) !== JSON.stringify(next.announcements)
  )
    replacements.push(`Farské oznamy (${current.announcements.length})`);
  if (
    current.donations?.length &&
    !sameDonations(current.donations, next.donations)
  )
    replacements.push(`Dary a zbierky (${current.donations.length})`);

  return replacements;
}

/** Fill recognized fields only; a partial import must not erase other days. */
export function applyBulletinImport(
  document: BulletinDocument,
  imported: BulletinImportResult
): BulletinDocument {
  const ownsNotices =
    !imported.suggestedWeekStart ||
    imported.suggestedWeekStart === document.weekStart;

  return {
    ...document,
    days: document.days.map((day) => {
      const found = imported.days.find(
        (candidate) => candidate.date === day.date
      );
      if (!found) return day;

      return {
        ...day,
        ...(found.liturgy ? { liturgy: found.liturgy } : {}),
        ...(found.masses.length || found.status === "no-masses"
          ? { masses: found.masses, status: found.status }
          : {})
      };
    }),
    ...(ownsNotices && imported.announcements.length
      ? { announcements: imported.announcements }
      : {}),
    ...(ownsNotices && imported.donations.length
      ? { donations: imported.donations }
      : {})
  };
}
