import {
  BULLETIN_IMPORT_MAX_TEXT,
  type BulletinImportResult
} from "@/content/bulletin-import";
import type { CalendarDate, Mass, ScheduleDay } from "@/content/types";
import { addDays, getMonday } from "./calendar";
import { getMassLabel } from "./mass";

type Warning = BulletinImportResult["warnings"][number];
type ParserOptions = {
  filename: string;
  format?: BulletinImportResult["format"];
  referenceWeekStart?: CalendarDate;
};
type Token = { value: string; table: boolean; line?: number; cell?: number };
type DayHeader = {
  start: number;
  end: number;
  weekday?: number;
  day?: number;
  month?: number;
  year?: number;
};

const WEEKDAYS = [
  "nedela",
  "pondelok",
  "utorok",
  "streda",
  "stvrtok",
  "piatok",
  "sobota"
];
const DATE = /^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.(?:\s*((?:19|20)\d{2}))?\s*$/;
const TIME = /^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*h(?:od)?\.?)?(?=$|\s|[–—-])/i;
const NOTICE_MARKER = /^(?:[•●▪]\s*|[–-]\s+|\d+[.)]\s+)/;
const MAX_WARNINGS = 150;
const MAX_DAY_HEADERS = 62;

function plain(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function clean(value: string): string {
  return value.replace(/[\s\u00a0]+/g, " ").trim();
}

function calendarDate(year: number, month: number, day: number) {
  const value = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? (value as CalendarDate)
    : null;
}

function weekdayOf(date: CalendarDate): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

/** A Sunday-led bulletin belongs to the following Monday's review window. */
function bulletinWeek(date: CalendarDate): CalendarDate {
  return getMonday(addDays(date, weekdayOf(date) === 0 ? 1 : 0));
}

function datedStrings(value: string): CalendarDate[] {
  const result: CalendarDate[] = [];
  for (const match of value.matchAll(
    /\b(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*((?:19|20)\d{2})\b/g
  )) {
    const date = calendarDate(
      Number(match[3]),
      Number(match[2]),
      Number(match[1])
    );
    if (date) result.push(date);
  }
  for (const match of value.matchAll(/\b((?:19|20)\d{2})-(\d{2})-(\d{2})\b/g)) {
    const date = calendarDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );
    if (date) result.push(date);
  }
  return [...new Set(result)];
}

function tokensFor(text: string): Token[] {
  return text.split("\n").flatMap((line, lineIndex) => {
    const table = line.includes("\t") || /\|.*\|/.test(line);
    return (table ? line.split(/[\t|]/) : [line]).map((value, cell) => ({
      value: clean(value),
      table,
      line: lineIndex,
      cell
    }));
  });
}

function findHeaders(tokens: Token[]): DayHeader[] {
  const headers: DayHeader[] = [];
  // One additional header marks where the unprocessed source begins.
  for (
    let index = 0;
    index < tokens.length && headers.length <= MAX_DAY_HEADERS;
    index += 1
  ) {
    const value = plain(tokens[index].value);
    const weekday = WEEKDAYS.findIndex(
      (name) => value === name || value.startsWith(`${name} `)
    );
    if (weekday === -1) {
      const standalone = tokens[index].value.match(DATE);
      if (
        standalone &&
        tokens
          .slice(index + 1, index + 9)
          .some((token) => TIME.test(token.value))
      ) {
        headers.push({
          start: index,
          end: index + 1,
          day: Number(standalone[1]),
          month: Number(standalone[2]),
          ...(standalone[3] ? { year: Number(standalone[3]) } : {})
        });
      }
      continue;
    }

    const sameLine = tokens[index].value.slice(WEEKDAYS[weekday].length).trim();
    let match = sameLine.match(DATE);
    let end = index + 1;
    if (!match && !sameLine) {
      let next = index + 1;
      while (next < tokens.length && !tokens[next].value && next < index + 5)
        next += 1;
      match = tokens[next]?.value.match(DATE) ?? null;
      if (match) end = next + 1;
    }
    // A sentence beginning with a weekday is not a day heading.
    if (!match && sameLine) continue;

    headers.push({
      start: index,
      end,
      weekday,
      ...(match
        ? {
            day: Number(match[1]),
            month: Number(match[2]),
            ...(match[3] ? { year: Number(match[3]) } : {})
          }
        : {})
    });
    index = end - 1;
  }
  return headers;
}

function chooseAnchor(
  headers: DayHeader[],
  text: string,
  options: ParserOptions,
  warn: (warning: Warning) => void
): CalendarDate | null {
  const headerDates = headers.flatMap((header) => {
    if (!header.year || !header.month || !header.day) return [];
    const date = calendarDate(header.year, header.month, header.day);
    return date ? [date] : [];
  });
  const filenameDates = datedStrings(options.filename);
  const explicitDates = datedStrings(text);
  const filenameDateSet = new Set(filenameDates);
  const explicitDateSet = new Set(explicitDates);
  const reference = options.referenceWeekStart;
  // Candidate dates in the same year have identical weekday evidence. Keep
  // the first source-priority anchor per year, bounding work for noisy input.
  const byYear = new Map<string, CalendarDate>();
  for (const date of [
    ...headerDates,
    ...filenameDates,
    ...explicitDates,
    ...(reference ? [reference] : [])
  ]) {
    if (!byYear.has(date.slice(0, 4))) byYear.set(date.slice(0, 4), date);
  }
  const candidates = [...byYear.values()];
  if (!candidates.length) {
    warn({
      code: "missing-year",
      message:
        "Nenašiel sa rok rozpisu. Vyberte týždeň a skúste import zopakovať; rok sa automaticky nedopĺňa podľa dnešného dátumu."
    });
    return null;
  }

  const scored = candidates.map((date, order) => {
    const year = Number(date.slice(0, 4));
    let score = filenameDateSet.has(date)
      ? 4
      : explicitDateSet.has(date)
      ? 2
      : 0;
    for (const header of headers) {
      // An explicit year attached to the actual schedule is stronger evidence
      // than a filename or an old footer, including when weekdays repeat.
      if (header.year) score += header.year === year ? 6 : -6;
      if (!header.day || !header.month || header.weekday === undefined)
        continue;
      const value = calendarDate(header.year ?? year, header.month, header.day);
      if (value) score += weekdayOf(value) === header.weekday ? 3 : -3;
    }
    return { date, order, score };
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  const anchor = scored[0].date;
  const sourceYears = new Set(
    [...headerDates, ...filenameDates, ...explicitDates].map((date) =>
      date.slice(0, 4)
    )
  );
  if (sourceYears.size > 1) {
    warn({
      code: "conflicting-years",
      message: `Dokument obsahuje rozdielne roky (${[...sourceYears].join(
        ", "
      )}). Použil sa rok ${anchor.slice(
        0,
        4
      )} podľa dátumov a dní v rozpise. Skontrolujte zvyšky starších hlavičiek a piat.`
    });
  }
  if (!headerDates.length && !filenameDates.length && !explicitDates.length) {
    warn({
      code: "reference-year",
      message: `Rok ${anchor.slice(
        0,
        4
      )} bol doplnený z vybraného týždňa. Skontrolujte dátumy.`
    });
  }
  if (
    filenameDates.length &&
    !filenameDates.some((date) => date.slice(0, 4) === anchor.slice(0, 4))
  ) {
    warn({
      code: "filename-date-conflict",
      message:
        "Dátum v názve súboru nesúhlasí s dňami rozpisu. Prednosť dostali dátumy zodpovedajúce názvom dní; skontrolujte rok."
    });
  }
  return anchor;
}

function resolveDate(
  header: DayHeader,
  anchor: CalendarDate,
  previous?: CalendarDate
) {
  if (header.day && header.month) {
    const year = header.year ?? Number((previous ?? anchor).slice(0, 4));
    const choices = (header.year ? [year] : [year - 1, year, year + 1])
      .map((candidate) => calendarDate(candidate, header.month!, header.day!))
      .filter((date): date is CalendarDate => Boolean(date));
    const target = previous ? addDays(previous, 1) : anchor;
    choices.sort(
      (a, b) =>
        Math.abs(Date.parse(a) - Date.parse(target)) -
        Math.abs(Date.parse(b) - Date.parse(target))
    );
    return choices[0] ?? null;
  }
  if (header.weekday === undefined) return null;
  const first = previous
    ? addDays(previous, 1)
    : addDays(getMonday(addDays(anchor, 1)), -1);
  const weekday = weekdayOf(first);
  return addDays(first, (header.weekday - weekday + 7) % 7);
}

function isExtractionMetadata(value: string): boolean {
  return /^\[(?:hlavicky a paty|poznamky|komentare) dokumentu\]/.test(
    plain(value)
  );
}

function isMetadata(value: string): boolean {
  const text = plain(value);
  return (
    isExtractionMetadata(value) ||
    /^(?:rimskokatolicka cirkev|nam\.? snp|rozpis bohosluzieb|liturgicky kalendar|den$|cas$|umysel$|knaz$|farske oznamy$|oznamy$)/.test(
      text
    )
  );
}

function isSignature(value: string): boolean {
  return (
    /(?:farar|dekan|kaplan|duchovny spravca)\s*$/i.test(plain(value)) &&
    value.length < 120 &&
    value.includes(",") &&
    isCelebrant(value.split(",")[0].trim())
  );
}

function isCelebrant(value: string): boolean {
  if (value.length > 90 || /[+†\d]/.test(value)) return false;
  if (
    /^(?:za\b|zomreli\b|umysel\b|farska\b|deti\b|mladez\b|lieskovec\b|zolna\b|nemocnica\b)/.test(
      plain(value)
    )
  )
    return false;
  return /^(?:(?:Mons\.|ThDr\.|PhDr\.|Mgr\.|Ing\.|Bc\.|P\.|DP\.|vdp\.)\s*)*(?:[A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ][\p{L}'’-]*\.?)(?:\s+[A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ][\p{L}'’-]*\.?){0,3}$/u.test(
    value
  );
}

function isNoticeStart(value: string): boolean {
  // Explicit list markers remain useful evidence even for very short notices.
  if (NOTICE_MARKER.test(value)) return true;
  return (
    value.length > 45 &&
    /^[A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/.test(value) &&
    /^(?:v\s|vo\s|od\s|na\s|nas\b|nasa\b|obcianske\b|knazsky\b|pozyvame\b|prosi|dakujeme\b|dnes\b|oznamujeme\b|vsetk|svieck)/.test(
      plain(value)
    )
  );
}

function massDetails(value: string): Omit<Mass, "time" | "celebrant"> {
  let intention = clean(value);
  let location: string | undefined;
  let label: string | undefined;
  const place = intention.match(
    /^(Lieskovec|Zolná|Nemocnica)(?:\s*[:–—-]\s*|\s+|$)/i
  );
  if (place) {
    location = place[1];
    intention = intention.slice(place[0].length).trim();
  }
  const group = intention.match(/^(Farská|Deti|Mládež)(?:\s*[:–—-]\s*|\s+|$)/i);
  if (group) {
    label = group[1];
    intention = intention.slice(group[0].length).trim();
  }
  const designation = getMassLabel({ location, label });
  return {
    ...(designation ? { label: designation } : {}),
    ...(intention ? { intention } : {})
  };
}

function parseDay(
  date: CalendarDate,
  tokens: Token[],
  isLastDay: boolean,
  warn: (warning: Warning) => void,
  unassigned: string[]
): { day: ScheduleDay; tail: Token[] } {
  const masses: Mass[] = [];
  const liturgy: string[] = [];
  let tail: Token[] = [];
  let explicitNoMasses = false;
  let incompletePrelude = false;
  let started = false;
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    if (!token.value) {
      index += 1;
      continue;
    }
    if (isMetadata(token.value)) {
      if (started && isLastDay) {
        tail = tokens.slice(index);
        break;
      }
      unassigned.push(token.value);
      index += 1;
      continue;
    }
    const time = token.value.match(TIME);
    if (!time) {
      if (
        isLastDay &&
        (started || (liturgy.length > 0 && isNoticeStart(token.value)))
      ) {
        tail = tokens.slice(index);
        break;
      }
      if (
        /^(?:bez\s+(?:sv[aä]tej\s+|sv\.?\s*)?omse|(?:sv[aä]ta\s+|sv\.?\s*)?omsa\s+(?:nebude|sa\s+nekona)|bohosluzby\s+(?:nebudu|sa\s+nekonaju))/.test(
          plain(token.value)
        )
      )
        explicitNoMasses = true;
      if (
        !started &&
        (/^[+†]/.test(token.value) || /^za\s/.test(plain(token.value)))
      ) {
        incompletePrelude = true;
        unassigned.push(token.value);
        warn({
          code: "missing-time",
          message:
            "Časť rozpisu obsahuje úmysel bez rozpoznaného času. Zostala medzi nerozpoznaným textom; doplňte čas ručne.",
          date
        });
      } else if (!started && incompletePrelude) unassigned.push(token.value);
      else if (!started) {
        const continuation =
          /^[a-záäčďéíĺľňóôŕšťúýž]/.test(token.value) &&
          !/^(?:spomienka|sviatok|slavnost)$/.test(plain(token.value));
        if (continuation && liturgy.length)
          liturgy[liturgy.length - 1] += ` ${token.value}`;
        else liturgy.push(token.value);
      } else unassigned.push(token.value);
      index += 1;
      continue;
    }

    started = true;
    let next = index + 1;
    while (next < tokens.length && !TIME.test(tokens[next].value)) next += 1;
    const remainder = token.value.slice(time[0].length).trim();
    const fields = [
      ...(remainder ? [{ value: remainder, table: token.table }] : []),
      ...tokens.slice(index + 1, next).filter((entry) => entry.value)
    ];
    const hour = Number(time[1]);
    const minute = Number(time[2]);
    if (hour > 23 || minute > 59) {
      unassigned.push(
        [token.value, ...fields.map((entry) => entry.value)].join("\n")
      );
      warn({
        code: "invalid-time",
        message: `Čas „${time[0]}“ sa nepodarilo použiť. Údaje riadka zostali medzi nerozpoznaným textom.`,
        date
      });
      index = next;
      continue;
    }

    // Table boundaries and short name-only fields are stronger evidence than
    // guessing a surname from an intention or splitting a name from a sentence.
    const nextCell = tokens[index + 1];
    const emptyIntentionCell =
      !remainder &&
      token.table &&
      nextCell?.table &&
      token.line === nextCell.line &&
      !nextCell.value;
    let celebrantIndex = fields.findIndex(
      (field, fieldIndex) =>
        (fieldIndex > 0 || emptyIntentionCell) && isCelebrant(field.value)
    );
    const noticeIndex = fields.findIndex(
      (field, fieldIndex) =>
        !field.table &&
        (isSignature(field.value) ||
          isMetadata(field.value) ||
          (fieldIndex > 0 && isNoticeStart(field.value)))
    );
    if (noticeIndex !== -1 && celebrantIndex >= noticeIndex)
      celebrantIndex = -1;
    const bodyEnd =
      celebrantIndex !== -1
        ? celebrantIndex
        : noticeIndex !== -1
        ? noticeIndex
        : fields.length;
    const details = massDetails(
      fields
        .slice(0, bodyEnd)
        .map((field) => field.value)
        .join(" ")
    );
    const celebrant =
      celebrantIndex !== -1 ? fields[celebrantIndex].value : undefined;
    const mass: Mass = {
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`,
      ...details,
      ...(celebrant ? { celebrant } : {})
    };
    masses.push(mass);
    if (!details.intention || !celebrant) {
      warn({
        code: "incomplete-mass",
        message: `Pri omši o ${mass.time} chýba alebo nie je jednoznačný ${
          !details.intention && !celebrant
            ? "úmysel aj celebrant"
            : !details.intention
            ? "úmysel"
            : "celebrant"
        }. Doplňte údaje podľa zdroja.`,
        date
      });
    }

    const leftovers = fields.slice(
      celebrantIndex !== -1 ? celebrantIndex + 1 : bodyEnd
    );
    if (leftovers.length) {
      const noticeFollows = leftovers.some(
        (field) =>
          !field.table &&
          (isNoticeStart(field.value) ||
            isSignature(field.value) ||
            isMetadata(field.value))
      );
      if (isLastDay && (next === tokens.length || noticeFollows)) {
        const sourceIndex = tokens.indexOf(leftovers[0]);
        tail = sourceIndex >= 0 ? tokens.slice(sourceIndex) : leftovers;
        break;
      } else {
        unassigned.push(leftovers.map((field) => field.value).join("\n"));
        warn({
          code: "unassigned-row",
          message:
            "Časť riadka rozpisu sa nepodarilo jednoznačne priradiť. Skontrolujte nerozpoznaný text; môže obsahovať omšu bez času.",
          date
        });
      }
    }
    index = next;
  }

  if (!masses.length && !explicitNoMasses) {
    warn({
      code: "missing-masses",
      message:
        "Pre tento deň sa nenašiel platný čas omše. Deň zostal neoverený; chýbajúci čas neznamená, že omša nebude.",
      date
    });
  }
  if (masses.length && explicitNoMasses) {
    warn({
      code: "contradictory-day",
      message:
        "Zdroj zároveň uvádza omše aj deň bez omše. Skontrolujte stav dňa.",
      date
    });
  }
  return {
    day: {
      date,
      ...(liturgy.length ? { liturgy: liturgy.join(" · ") } : {}),
      masses,
      status: masses.length
        ? "scheduled"
        : explicitNoMasses
        ? "no-masses"
        : "unpublished"
    },
    tail
  };
}

function parseNotices(tokens: Token[], unassigned: string[]) {
  const announcements: string[] = [];
  const donations: BulletinImportResult["donations"] = [];
  let parts: string[] = [];
  let donationCategory: string | undefined;
  let metadataOnly = false;
  const flush = () => {
    if (parts.length) announcements.push(clean(parts.join(" ")));
    parts = [];
  };

  for (const { value } of tokens) {
    if (!value) {
      flush();
      continue;
    }
    if (isExtractionMetadata(value)) metadataOnly = true;
    if (metadataOnly) {
      flush();
      unassigned.push(value);
      continue;
    }
    if (isMetadata(value) || isSignature(value)) {
      flush();
      unassigned.push(value);
      donationCategory = undefined;
      continue;
    }
    if (
      /^(?:milodary|dary na|na kostol darovali|zbierka)(?:\s*[:–—-]|$)/.test(
        plain(value)
      ) &&
      value.length < 120
    ) {
      flush();
      donationCategory = value.replace(/[:–—-]\s*$/, "");
      unassigned.push(value);
      continue;
    }
    const amount = value.match(/\b\d[\d\s]*(?:[,.]\d{1,2})?\s*(?:€|eur\b)/i);
    if (donationCategory && amount && !isNoticeStart(value)) {
      flush();
      const label = clean(
        value.replace(amount[0], "").replace(/[\s:–—-]+$/, "")
      );
      donations.push({
        label: label || value,
        amount: clean(amount[0]),
        category: donationCategory
      });
      continue;
    }
    if (donationCategory && isNoticeStart(value)) donationCategory = undefined;
    const text = value.replace(NOTICE_MARKER, "");
    if (isNoticeStart(value)) flush();
    if (!text) {
      unassigned.push(value);
      continue;
    }
    if (
      !parts.length &&
      !NOTICE_MARKER.test(value) &&
      text.length < 20 &&
      !/[.!?]/.test(text)
    ) {
      unassigned.push(value);
      continue;
    }
    parts.push(text);
  }
  flush();
  return { announcements, donations };
}

function warnAboutDraftLimits(
  days: ScheduleDay[],
  notices: Pick<BulletinImportResult, "announcements" | "donations">,
  warn: (warning: Warning) => void
) {
  for (const day of days) {
    if (day.masses.length > 30)
      warn({
        code: "draft-limit-masses",
        message:
          "Deň obsahuje viac než 30 omší, ktoré povoľuje formulár. Údaje zostali zachované; pred uložením ich rozdeľte alebo upravte.",
        date: day.date
      });
    if ((day.liturgy?.length ?? 0) > 1000)
      warn({
        code: "draft-limit-liturgy",
        message:
          "Názov liturgie presahuje 1 000 znakov. Text zostal zachovaný; pred uložením ho skráťte.",
        date: day.date
      });
    if (
      day.masses.some((mass) =>
        [mass.celebrant, mass.intention, mass.location, mass.label].some(
          (value) => (value?.length ?? 0) > 3000
        )
      )
    ) {
      warn({
        code: "draft-limit-mass-text",
        message:
          "Niektorý údaj omše presahuje 3 000 znakov. Text zostal zachovaný; skontrolujte spojenie riadkov a pred uložením ho upravte.",
        date: day.date
      });
    }
  }
  if (notices.announcements.length > 100)
    warn({
      code: "draft-limit-announcements",
      message:
        "Našlo sa viac než 100 oznamov, ktoré povoľuje formulár. Oznamy zostali zachované; pred uložením ich spojte alebo rozdeľte do ďalšieho záznamu."
    });
  if (notices.announcements.some((notice) => notice.length > 10000))
    warn({
      code: "draft-limit-announcement-text",
      message:
        "Niektorý oznam presahuje 10 000 znakov. Text zostal zachovaný; pred uložením ho rozdeľte na kratšie oznamy."
    });
  if (notices.donations.length > 200)
    warn({
      code: "draft-limit-donations",
      message:
        "Našlo sa viac než 200 milodarov, ktoré povoľuje formulár. Údaje zostali zachované; pred uložením ich upravte."
    });
  if (
    notices.donations.some(
      (donation) =>
        donation.label.length > 3000 ||
        (donation.amount?.length ?? 0) > 100 ||
        (donation.category?.length ?? 0) > 150
    )
  )
    warn({
      code: "draft-limit-donation-text",
      message:
        "Niektorý milodar presahuje limit formulára (označenie 3 000, suma 100 alebo kategória 150 znakov). Údaje zostali zachované; pred uložením ich skráťte."
    });
}

/** Recover suggestions without modifying, saving or publishing parish content. */
export function parseBulletinText(
  text: string,
  options: ParserOptions
): BulletinImportResult {
  const warnings: Warning[] = [];
  const warn = (warning: Warning) => {
    if (warnings.length < MAX_WARNINGS) warnings.push(warning);
    else if (warning.code.startsWith("draft-limit-")) {
      warnings.pop();
      warnings.unshift(warning);
    }
  };
  if (text.length > BULLETIN_IMPORT_MAX_TEXT) {
    text = text.slice(0, BULLETIN_IMPORT_MAX_TEXT);
    warn({
      code: "text-truncated",
      message:
        "Dokument je príliš rozsiahly. Spracovala sa iba úvodná časť; skontrolujte a doplňte chýbajúci obsah."
    });
  }
  text = text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[\u0000-\u0008\u000e-\u001f\u007f]/g, "")
    .replace(/[\u000b\u000c\u2028\u2029]/g, "\n")
    .trim();
  const sourceTokens = tokensFor(text);
  const metadataStart = sourceTokens.findIndex((token) =>
    isExtractionMetadata(token.value)
  );
  // The extractor appends headers, footnotes and comments after the body. Keep
  // that appendix for review, but never let its dates/times become schedule rows
  // or notices. The full text still supplies conflicting-year warnings below.
  const tokens =
    metadataStart === -1 ? sourceTokens : sourceTokens.slice(0, metadataStart);
  const unassigned =
    metadataStart === -1
      ? []
      : sourceTokens
          .slice(metadataStart)
          .map((token) => token.value)
          .filter(Boolean);
  const headers = findHeaders(tokens);
  const anchor = chooseAnchor(
    headers.slice(0, MAX_DAY_HEADERS),
    text,
    options,
    warn
  );
  const days: ScheduleDay[] = [];
  let noticeTokens: Token[] = [];
  let previous: CalendarDate | undefined;
  const overflowStart = headers[MAX_DAY_HEADERS]?.start;
  if (overflowStart !== undefined) {
    unassigned.push(
      tokens
        .slice(overflowStart)
        .map((token) => token.value)
        .join("\n")
    );
    warn({
      code: "day-limit",
      message:
        "Spracovalo sa prvých 62 hlavičiek dní. Ďalšia časť zostala medzi nerozpoznaným textom aj v pôvodnom texte; skontrolujte ju a importujte samostatne."
    });
  }

  if (!headers.length || !anchor) {
    warn({
      code: "schedule-not-found",
      message:
        "Rozpis sa nepodarilo spoľahlivo priradiť k dátumom. Dostupný text ostal zachovaný na ručné doplnenie."
    });
    noticeTokens = tokens.slice(0, overflowStart);
  } else {
    for (const token of tokens.slice(0, headers[0].start)) {
      if (token.value) unassigned.push(token.value);
    }
    headers.slice(0, MAX_DAY_HEADERS).forEach((header, index) => {
      const date = resolveDate(header, anchor, previous);
      const section = tokens.slice(
        header.end,
        headers[index + 1]?.start ?? tokens.length
      );
      if (!date) {
        unassigned.push(
          tokens
            .slice(header.start, headers[index + 1]?.start ?? tokens.length)
            .map((token) => token.value)
            .join("\n")
        );
        warn({
          code: "invalid-date",
          message: "Neplatný dátum v rozpise zostal medzi nerozpoznaným textom."
        });
        return;
      }
      if (header.weekday !== undefined && weekdayOf(date) !== header.weekday) {
        warn({
          code: "weekday-mismatch",
          message:
            "Dátum nesúhlasí s uvedeným dňom týždňa. Overte rok a dátum.",
          date
        });
      }
      if (!header.day)
        warn({
          code: "inferred-date",
          message:
            "Dátum bol doplnený podľa názvu dňa a vybraného týždňa. Skontrolujte ho.",
          date
        });
      const parsed = parseDay(
        date,
        section,
        index === headers.length - 1,
        warn,
        unassigned
      );
      const duplicate = days.find((day) => day.date === date);
      if (duplicate) {
        const noMasses =
          duplicate.status === "no-masses" || parsed.day.status === "no-masses";
        for (const mass of parsed.day.masses) duplicate.masses.push(mass);
        if (parsed.day.liturgy)
          duplicate.liturgy = [duplicate.liturgy, parsed.day.liturgy]
            .filter(Boolean)
            .join(" · ");
        duplicate.status = duplicate.masses.length
          ? "scheduled"
          : noMasses
          ? "no-masses"
          : "unpublished";
        if (duplicate.masses.length && noMasses)
          warn({
            code: "contradictory-day",
            message:
              "Opakované časti dňa zároveň uvádzajú omše aj deň bez omše. Skontrolujte stav dňa.",
            date
          });
        warn({
          code: "duplicate-day",
          message:
            "Dátum sa v zdroji opakuje. Riadky boli spojené; skontrolujte prípadné duplicitné omše.",
          date
        });
      } else days.push(parsed.day);
      for (const token of parsed.tail) noticeTokens.push(token);
      previous = date;
    });
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = days[0]?.date ?? anchor;
  const suggestedWeekStart = firstDate ? bulletinWeek(firstDate) : null;
  if (suggestedWeekStart) {
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(suggestedWeekStart, offset);
      if (!days.some((day) => day.date === date))
        warn({
          code: "missing-day",
          message:
            "Tento deň sa v dokumente nenašiel. Pri importe zostane neoverený.",
          date
        });
    }
    if (
      options.referenceWeekStart &&
      suggestedWeekStart !== options.referenceWeekStart
    ) {
      warn({
        code: "different-week",
        message: `Dokument patrí k týždňu od ${suggestedWeekStart}, ktorý sa líši od otvoreného formulára. Pred použitím skontrolujte vybraný týždeň.`
      });
    }
  }
  const notices = parseNotices(noticeTokens, unassigned);
  warnAboutDraftLimits(days, notices, warn);
  if (!notices.announcements.length)
    warn({
      code: "announcements-not-found",
      message:
        "Nenašli sa samostatné farské oznamy. Skontrolujte pôvodný a nerozpoznaný text."
    });
  if (unassigned.length)
    warn({
      code: "unassigned-text",
      message:
        "Časť dokumentu zostala medzi nerozpoznaným textom (napríklad podpis, hlavičky alebo neúplné riadky). Pred uložením ju skontrolujte."
    });

  return {
    filename: options.filename,
    format: options.format ?? "text",
    text,
    suggestedWeekStart,
    days,
    ...notices,
    warnings,
    unassigned: [...new Set(unassigned.filter(Boolean))]
  };
}
