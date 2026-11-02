import type { BulletinDocument } from "@/content/documents";
import type { CalendarDate } from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";
import { splitLiturgy } from "@/lib/liturgy-day";
import {
  asArray,
  asObject,
  draftMasses,
  fail,
  isCalendarDate,
  keepFields,
  nonempty,
  optionalText,
  requirePublishedMassTimes,
  requireText
} from "./shared";

export function parseBulletinDraft(
  input: Record<string, unknown>
): BulletinDocument {
  optionalText(input.id, 200, "Neplatná identita obsahu.");
  if (
    !isCalendarDate(input.weekStart) ||
    getMonday(input.weekStart) !== input.weekStart
  )
    fail("Vyberte platný pondelok pripravovaného týždňa.");

  const days = asArray(
    input.days,
    7,
    "Rozpis musí obsahovať sedem dní od pondelka do nedele."
  );
  if (days.length !== 7)
    fail("Rozpis musí obsahovať sedem dní od pondelka do nedele.");

  days.forEach((value, index) => {
    const day = asObject(value, "Skontrolujte deň rozpisu.");
    if (
      !isCalendarDate(day.date) ||
      day.date !== addDays(input.weekStart as CalendarDate, index)
    )
      fail("Dátumy rozpisu musia zodpovedať vybranému týždňu.");
    if (
      !["scheduled", "no-masses", "unpublished"].includes(day.status as string)
    )
      fail("Skontrolujte stav každého dňa.");
    optionalText(day.liturgy, 1000, "Skontrolujte názov liturgie.");
    optionalText(
      day.liturgyType,
      300,
      "Typ liturgického dňa môže mať najviac 300 znakov."
    );
    Object.assign(
      day,
      splitLiturgy(
        day.liturgy as string | undefined,
        day.liturgyType as string | undefined
      )
    );
    draftMasses(day.masses);
    keepFields(day, ["date", "status", "liturgy", "liturgyType", "masses"]);
  });

  for (const value of asArray(
    input.announcements,
    100,
    "Skontrolujte farské oznamy."
  ))
    requireText(value, 10000, "Skontrolujte text farského oznamu.");

  for (const value of asArray(
    input.donations ?? [],
    200,
    "Skontrolujte milodary."
  )) {
    const row = asObject(value, "Skontrolujte milodary.");
    requireText(row.label, 3000, "Skontrolujte označenie milodaru.");
    optionalText(row.amount, 100, "Skontrolujte sumu milodaru.");
    optionalText(
      row.category,
      150,
      "Kategória milodaru môže mať najviac 150 znakov."
    );
    keepFields(row, ["label", "amount", "category"]);
  }

  keepFields(input, ["id", "weekStart", "days", "announcements", "donations"]);

  return input as unknown as BulletinDocument;
}

/** Shape, lengths and dates have already been checked by the draft parser. */
export function requirePublishedBulletin(bulletin: BulletinDocument) {
  for (const [index, day] of bulletin.days.entries()) {
    const path = `days.${index}`;
    if (day.status === "scheduled")
      requirePublishedMassTimes(day.masses, `${path}.masses`);
    if (day.status === "no-masses" && day.masses.length)
      fail("Deň bez omše nemôže obsahovať časy omší.", `${path}.status`);
    if (day.status === "scheduled" && !day.masses.length)
      fail("Pridajte omšu alebo označte deň bez omše.", `${path}.status`);
  }

  if (
    bulletin.donations?.some(
      (item) => !nonempty(item.label, 3000) && !nonempty(item.amount, 100)
    )
  )
    fail("Skontrolujte milodary.");
}
