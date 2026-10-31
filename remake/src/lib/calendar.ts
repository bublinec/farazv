import type {
  Bulletin,
  CalendarDate,
  RegularSchedule,
  ScheduleDay
} from "@/content/types";

export const PARISH_TIME_ZONE = "Europe/Bratislava";

/** Date-only arithmetic uses UTC as a calendar, never as the parish's timezone. */
function parseDate(date: CalendarDate): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new RangeError(`Invalid calendar date: ${date}`);
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new RangeError(`Invalid calendar date: ${date}`);
  }
  return parsed;
}

export function getLocalDate(now = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARISH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}` as CalendarDate;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  if (!Number.isInteger(days))
    throw new RangeError("Calendar days must be an integer");
  const parsed = parseDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10) as CalendarDate;
}

export function getMonday(date: CalendarDate): CalendarDate {
  const weekday = parseDate(date).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

export function formatDate(
  date: CalendarDate,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "numeric",
    ...options,
    timeZone: PARISH_TIME_ZONE
  }).format(parseDate(date));
}

function validBulletin(bulletin: Bulletin): boolean {
  try {
    return (
      bulletin.published && getMonday(bulletin.weekStart) === bulletin.weekStart
    );
  } catch {
    return false;
  }
}

function regularDay(
  date: CalendarDate,
  regularSchedule: RegularSchedule
): ScheduleDay {
  const masses = (regularSchedule[parseDate(date).getUTCDay()] ?? []).map(
    ({ time, location, label }) => ({
      time,
      ...(location ? { location } : {}),
      ...(label ? { label } : {})
    })
  );
  // Missing publication is not a confirmed cancellation. Never infer a priest,
  // intention or liturgy from the recurring schedule.
  return { date, masses, status: "unpublished", isRegular: true };
}

/** The public view is Sunday–Sunday, with each Sunday read from its actual record. */
export function getPublicWeek(
  bulletins: Bulletin[],
  today: CalendarDate,
  regularSchedule: RegularSchedule
): { days: ScheduleDay[]; bulletin?: Bulletin } {
  parseDate(today);
  const published = bulletins
    .filter(validBulletin)
    .sort(
      (a, b) =>
        b.weekStart.localeCompare(a.weekStart) || a.id.localeCompare(b.id)
    );
  const bulletin = published.find(
    (item) =>
      today >= addDays(item.weekStart, -1) &&
      today <= addDays(item.weekStart, 6)
  );
  // On Sunday the upcoming Monday's window starts. A future bulletin becomes
  // eligible naturally, without edits, deployment or cache invalidation.
  const weekStart = bulletin?.weekStart ?? getMonday(addDays(today, 1));
  const firstSunday = addDays(weekStart, -1);
  const days = Array.from({ length: 8 }, (_, index): ScheduleDay => {
    const date = addDays(firstSunday, index);
    const source = published.find(
      (item) =>
        date >= item.weekStart &&
        date <= addDays(item.weekStart, 6) &&
        item.days.some((day) => day.date === date)
    );
    const day = source?.days.find((item) => item.date === date);
    if (!day || day.status === "unpublished")
      return regularDay(date, regularSchedule);
    // Defensively ignore masses attached to an explicit no-Mass day.
    return {
      ...day,
      masses:
        day.status === "no-masses"
          ? []
          : day.masses.map((mass) => ({ ...mass })),
      isRegular: false
    };
  });
  return { days, ...(bulletin ? { bulletin } : {}) };
}

/** Return the next Bratislava midnight, including 23/25-hour DST days. */
export function getNextLocalMidnight(now = new Date()): Date {
  const tomorrow = addDays(getLocalDate(now), 1);
  const target = new Date(`${tomorrow}T00:00:00.000Z`).getTime();
  let instant = target;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARISH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = formatter.formatToParts(new Date(instant));
    const part = (type: string) =>
      Number(parts.find((item) => item.type === type)?.value);
    const localAsUtc = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second")
    );
    instant += target - localAsUtc;
  }
  return new Date(instant);
}
