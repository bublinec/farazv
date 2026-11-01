import type { SettingsDocument } from "@/content/documents";
import { isSafeLink } from "@/lib/rich-text";
import {
  asArray,
  asObject,
  draftMasses,
  draftMedia,
  fail,
  keepFields,
  nonempty,
  optionalText,
  requirePublishedMassTimes,
  requireText,
  settingsTextLimits
} from "./shared";

export function parseSettingsDraft(
  input: Record<string, unknown>
): SettingsDocument {
  optionalText(input.id, 200, "Neplatná identita obsahu.");
  for (const key of [
    "name",
    "shortName",
    "location",
    "address",
    "phone",
    "email",
    "iban"
  ])
    requireText(
      input[key],
      key === "address"
        ? settingsTextLimits.draftAddress
        : settingsTextLimits.field,
      "Skontrolujte kontaktné a platobné údaje."
    );

  for (const [field, nameKey] of [
    ["officeHours", "day"],
    ["preparationMeetings", "name"]
  ]) {
    for (const value of asArray(
      input[field],
      50,
      "Skontrolujte úradné hodiny a náuky."
    )) {
      const row = asObject(
        value,
        "Skontrolujte riadok úradných hodín alebo náuk."
      );
      requireText(row[nameKey], 100, "Skontrolujte popis riadka.");
      requireText(row.time, 300, "Skontrolujte čas riadka.");
      keepFields(row, [nameKey, "time"]);
    }
  }

  optionalText(
    input.preparationNote,
    5000,
    "Poznámka k náukám je príliš dlhá."
  );
  for (const key of ["contactNote", "officeNote", "mobile", "ico"]) {
    optionalText(
      input[key],
      key.endsWith("Note") ? 10000 : 100,
      "Skontrolujte doplňujúce kontaktné údaje."
    );
  }

  optionalText(input.mapLink, 4096, "Skontrolujte odkaz na mapu.");
  if (input.mapLink) {
    try {
      const url = new URL(input.mapLink as string);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        !isSafeLink(input.mapLink)
      )
        fail("Mapa musí byť bežný HTTP alebo HTTPS odkaz.");
    } catch {
      fail("Mapa musí byť bežný HTTP alebo HTTPS odkaz.");
    }
  }

  const regular = asObject(
    input.regularSchedule,
    "Skontrolujte pravidelný rozpis."
  );
  for (const [day, masses] of Object.entries(regular)) {
    if (!/^[0-6]$/.test(day)) fail("Neplatný deň pravidelného rozpisu.");
    draftMasses(masses, true);
  }

  if (input.donationQr !== undefined) draftMedia(input.donationQr, true);

  for (const value of asArray(
    input.priests ?? [],
    30,
    "Skontrolujte kontakty na kňazov."
  )) {
    const row = asObject(value, "Skontrolujte kontakt.");
    requireText(row.name, 300, "Skontrolujte meno kontaktu.");
    requireText(row.role, 300, "Skontrolujte popis kontaktu.");
    optionalText(row.phone, 100, "Skontrolujte telefón kontaktu.");
    optionalText(row.email, 320, "Skontrolujte e-mail kontaktu.");
    if (row.image !== undefined) draftMedia(row.image);
    keepFields(row, ["name", "role", "phone", "email", "image"]);
  }

  keepFields(input, [
    "name",
    "shortName",
    "location",
    "address",
    "phone",
    "email",
    "iban",
    "officeHours",
    "preparationMeetings",
    "preparationNote",
    "contactNote",
    "officeNote",
    "mobile",
    "ico",
    "mapLink",
    "regularSchedule",
    "donationQr",
    "priests"
  ]);

  return input as unknown as SettingsDocument;
}

export function requirePublishedSettings(settings: SettingsDocument) {
  for (const key of [
    "name",
    "shortName",
    "location",
    "address",
    "phone",
    "email"
  ] as const) {
    const maximum =
      key === "address"
        ? settingsTextLimits.publishedAddress
        : settingsTextLimits.field;
    if (!nonempty(settings[key], maximum))
      fail("Vyplňte základné kontaktné údaje.", key);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email))
    fail("Skontrolujte e-mailovú adresu.", "email");

  const iban = settings.iban.replace(/\s/g, "");
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban))
    fail("Skontrolujte IBAN farského účtu.", "iban");
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (char) =>
    String(char.charCodeAt(0) - 55)
  );
  let mod = 0;
  for (const digit of digits) mod = (mod * 10 + Number(digit)) % 97;
  if (mod !== 1) fail("Kontrolný súčet IBAN nie je platný.", "iban");

  settings.officeHours.forEach((row, index) => {
    if (!row.day.trim())
      fail("Vyplňte deň úradných hodín.", `officeHours.${index}.day`);
    if (!row.time.trim())
      fail("Vyplňte čas úradných hodín.", `officeHours.${index}.time`);
  });
  settings.preparationMeetings.forEach((row, index) => {
    if (!row.name.trim())
      fail("Vyplňte názov náuky.", `preparationMeetings.${index}.name`);
    if (!row.time.trim())
      fail("Vyplňte čas náuky.", `preparationMeetings.${index}.time`);
  });
  for (const [day, masses] of Object.entries(settings.regularSchedule))
    requirePublishedMassTimes(masses, `regularSchedule.${day}`);
  settings.priests?.forEach((priest, index) => {
    if (!priest.name.trim())
      fail("Vyplňte meno kontaktu.", `priests.${index}.name`);
  });
}
