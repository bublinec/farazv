import assert from "node:assert/strict";
import test from "node:test";
import type {
  Bulletin,
  CalendarDate,
  RegularSchedule
} from "../src/content/types";
import {
  addDays,
  formatDate,
  getLocalDate,
  getMonday,
  getNextLocalMidnight,
  getPublicWeek
} from "../src/lib/calendar";

const regular: RegularSchedule = {
  0: [
    {
      time: "09:00",
      location: "Kostol",
      celebrant: "Never infer",
      intention: "Never infer"
    }
  ],
  1: [{ time: "18:00" }],
  2: [],
  3: [{ time: "18:00" }],
  4: [{ time: "18:00" }],
  5: [{ time: "18:00" }],
  6: [{ time: "07:00" }]
};

function bulletin(weekStart: CalendarDate, published = true): Bulletin {
  return {
    id: `week-${weekStart}`,
    weekStart,
    published,
    days: Array.from({ length: 7 }, (_, index) => ({
      date: addDays(weekStart, index),
      liturgy: `Liturgy ${index}`,
      masses: [
        {
          time: `${String(index + 6).padStart(2, "0")}:00`,
          intention: "Za farnosť"
        }
      ],
      status: "scheduled"
    })),
    announcements: []
  };
}

test("calendar helpers cross months, leap days and years without timezone drift", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-30", -1), "2026-03-29");
  assert.equal(getMonday("2026-11-01"), "2026-10-26");
  assert.equal(getMonday("2026-11-02"), "2026-11-02");
  assert.match(formatDate("2026-11-01", { weekday: "long" }), /nedeľa/);
  assert.throws(() => addDays("2026-02-30", 0), RangeError);
  assert.throws(() => addDays("2026-11-01", 0.5), RangeError);
});

test("today is Bratislava's date in both winter and summer", () => {
  assert.equal(getLocalDate(new Date("2026-10-31T23:30:00Z")), "2026-11-01");
  assert.equal(getLocalDate(new Date("2026-07-01T22:30:00Z")), "2026-07-02");
  assert.equal(getLocalDate(new Date("2026-07-01T21:59:00Z")), "2026-07-01");
});

test("next parish midnight respects a 23-hour spring day and 25-hour autumn day", () => {
  const spring = new Date("2026-03-28T23:00:00Z");
  assert.equal(
    getNextLocalMidnight(spring).toISOString(),
    "2026-03-29T22:00:00.000Z"
  );
  assert.equal(
    getNextLocalMidnight(spring).getTime() - spring.getTime(),
    23 * 60 * 60 * 1000
  );
  const autumn = new Date("2026-10-24T22:00:00Z");
  assert.equal(
    getNextLocalMidnight(autumn).toISOString(),
    "2026-10-25T23:00:00.000Z"
  );
  assert.equal(
    getNextLocalMidnight(autumn).getTime() - autumn.getTime(),
    25 * 60 * 60 * 1000
  );
  assert.equal(
    getNextLocalMidnight(new Date("2026-10-31T20:50:00Z")).toISOString(),
    "2026-10-31T23:00:00.000Z"
  );
});

test("an empty CMS produces eight dated fallback days without invented details", () => {
  const result = getPublicWeek([], "2026-10-28", regular);
  assert.equal(result.bulletin, undefined);
  assert.equal(result.days.length, 8);
  assert.equal(result.days[0].date, "2026-10-25");
  assert.equal(result.days[7].date, "2026-11-01");
  assert.deepEqual(result.days[0].masses, [
    { time: "09:00", location: "Kostol" }
  ]);
  assert.equal(result.days[0].status, "unpublished");
  assert.equal(result.days[0].isRegular, true);
  assert.equal(result.days[0].liturgy, undefined);
  assert.equal(result.days[2].status, "unpublished");
  assert.deepEqual(result.days[2].masses, []);
});

test("a single published week uses exact dated days and leaves absent prior Sunday unpublished", () => {
  const current = bulletin("2026-10-26");
  const result = getPublicWeek([current], "2026-10-28", regular);
  assert.equal(result.bulletin?.id, current.id);
  assert.equal(result.days[0].status, "unpublished");
  assert.equal(result.days[1].liturgy, "Liturgy 0");
  assert.equal(result.days[1].isRegular, false);
  assert.equal(result.days[7].date, "2026-11-01");
  assert.equal(result.days[7].masses[0].time, "12:00");
});

test("prior Sunday comes from its actual date in the preceding bulletin", () => {
  const previous = bulletin("2026-10-19");
  previous.days[6].masses[0].time = "11:15";
  const current = bulletin("2026-10-26");
  // An accidentally copied day outside the current record's week cannot override it.
  current.days.push({
    date: "2026-10-25",
    masses: [{ time: "23:59" }],
    status: "scheduled"
  });
  const result = getPublicWeek([current, previous], "2026-10-28", regular);
  assert.equal(result.days[0].date, "2026-10-25");
  assert.equal(result.days[0].masses[0].time, "11:15");
});

test("future published records activate on Monday and Sunday keeps the ending week", () => {
  const current = bulletin("2026-10-26");
  const future = bulletin("2026-11-02");
  assert.equal(
    getPublicWeek([future, current], "2026-10-31", regular).bulletin?.id,
    current.id
  );
  const sunday = getPublicWeek([current, future], "2026-11-01", regular);
  assert.equal(sunday.bulletin?.id, current.id);
  assert.equal(sunday.days[0].date, "2026-10-25");
  assert.equal(sunday.days[7].date, "2026-11-01");
  assert.equal(sunday.days[7].masses[0].time, "12:00");
  // Input order and subsequent editing of an old record do not affect selection.
  assert.equal(
    getPublicWeek([future, current], "2026-11-01", regular).bulletin?.id,
    current.id
  );
  const monday = getPublicWeek([current, future], "2026-11-02", regular);
  assert.equal(monday.bulletin?.id, future.id);
  assert.equal(monday.days[0].date, "2026-11-01");
  assert.equal(monday.days[0].masses[0].time, "12:00");
  assert.equal(monday.days[1].date, "2026-11-02");
});

test("draft, expired, far-future and malformed-week bulletins cannot become current", () => {
  const expired = bulletin("2026-10-19");
  const draft = bulletin("2026-10-26", false);
  const future = bulletin("2026-11-09");
  const malformed = bulletin("2026-10-27");
  const result = getPublicWeek(
    [expired, draft, future, malformed],
    "2026-10-28",
    regular
  );
  assert.equal(result.bulletin, undefined);
  assert.equal(result.days[3].status, "unpublished");
  assert.equal(result.days[3].liturgy, undefined);
});

test("missing publication is distinct from an explicitly confirmed no-Mass day", () => {
  const current = bulletin("2026-10-26");
  current.days[1].status = "no-masses";
  current.days[2].status = "unpublished";
  current.days.splice(3, 1);
  const result = getPublicWeek([current], "2026-10-28", regular);
  assert.equal(result.days[2].status, "no-masses");
  assert.deepEqual(result.days[2].masses, []);
  assert.equal(result.days[2].isRegular, false);
  assert.equal(result.days[3].status, "unpublished");
  assert.equal(result.days[3].liturgy, undefined);
  assert.deepEqual(result.days[3].masses, [{ time: "18:00" }]);
  assert.equal(result.days[4].status, "unpublished");
});

test("the no-data Sunday view keeps the ending week, and returned masses do not mutate source records", () => {
  const fallback = getPublicWeek([], "2026-11-01", regular);
  assert.equal(fallback.days[0].date, "2026-10-25");
  assert.equal(fallback.days[7].date, "2026-11-01");
  const current = bulletin("2026-10-26");
  const result = getPublicWeek([current], "2026-10-28", regular);
  result.days[1].masses[0].time = "23:59";
  assert.equal(current.days[0].masses[0].time, "06:00");
});
