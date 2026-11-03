import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorialEntry } from "../src/content/types";
import {
  editorialPage,
  editorialPageFromRequest,
  editorialPath,
  formatEditorialDate,
  InvalidEditorialCursor,
  isSafeEditorialLink
} from "../src/lib/editorial";

function entry(
  id: string,
  date: EditorialEntry["date"] = "2026-10-31"
): EditorialEntry {
  return {
    id,
    date,
    slug: `clanok-${id}`,
    title: `Článok ${id}`,
    excerpt: "Krátke zhrnutie.",
    blocks: [
      { type: "paragraph", text: "Body must not appear in a list response." }
    ]
  };
}

test("first ten summaries then six per request; all entries appear exactly once", () => {
  const entries = Array.from({ length: 27 }, (_, index) =>
    entry(String(index).padStart(3, "0"))
  );
  const first = editorialPage(entries);
  assert.equal(first.items.length, 10);
  assert.equal(first.items[0].id, "026");
  assert.ok(first.nextCursor);
  assert.equal(JSON.stringify(first).includes("Body must not appear"), false);
  assert.equal(Object.hasOwn(first.items[0], "blocks"), false);
  const seen = first.items.map(({ id }) => id);
  let cursor: string | null = first.nextCursor;
  const batchSizes: number[] = [];
  while (cursor) {
    const page = editorialPage(entries, cursor);
    batchSizes.push(page.items.length);
    seen.push(...page.items.map(({ id }) => id));
    cursor = page.nextCursor;
  }
  assert.deepEqual(batchSizes, [6, 6, 5]);
  assert.equal(new Set(seen).size, entries.length);
  assert.equal(seen.length, entries.length);
  assert.equal(entries[0].id, "000", "sorting must not mutate source fixtures");
});

test("date order takes priority over the source ID", () => {
  const page = editorialPage([
    entry("999", "2024-01-01"),
    entry("001", "2026-10-31"),
    entry("005", "2026-10-31")
  ]);
  assert.deepEqual(
    page.items.map(({ id }) => id),
    ["005", "001", "999"]
  );
});

test("list serialization cannot leak future private record fields", () => {
  const extendedRecord = {
    ...entry("001"),
    draftBody: "private unpublished edits"
  };
  const result = JSON.stringify(editorialPage([extendedRecord]));
  assert.equal(result.includes("draftBody"), false);
  assert.equal(result.includes("private unpublished edits"), false);
});

test("cursor survives new publications and removal of its anchor record", () => {
  const entries = Array.from({ length: 20 }, (_, index) =>
    entry(String(index).padStart(3, "0"))
  );
  const first = editorialPage(entries);
  const changed = [
    entry("new", "2026-11-01"),
    ...entries.filter(({ id }) => id !== first.items.at(-1)?.id)
  ];
  const next = editorialPage(changed, first.nextCursor);
  assert.deepEqual(
    next.items.map(({ id }) => id),
    ["009", "008", "007", "006", "005", "004"]
  );
});

test("empty feeds and exact boundaries finish without a redundant cursor", () => {
  assert.deepEqual(editorialPage([]), { items: [], nextCursor: null });
  const ten = Array.from({ length: 10 }, (_, index) => entry(String(index)));
  assert.equal(editorialPage(ten).nextCursor, null);
});

test("invalid, overlong, duplicate, empty and unbounded paging parameters are rejected", () => {
  const invalid = [
    "cursor=wrong",
    "cursor=v1.2026-02-30.12",
    "cursor=v1.2026-10-31.",
    "cursor=v1.2026-10-31.%2500",
    "cursor=v1.2026-10-31.%25ZZ",
    `cursor=${"x".repeat(601)}`,
    "cursor=",
    "cursor=v1.2026-10-31.12&cursor=v1.2026-10-31.13",
    "limit=1000000",
    "pageSize=1000000",
    "offset=0"
  ];
  for (const query of invalid) {
    assert.throws(
      () => editorialPageFromRequest([entry("12")], new URLSearchParams(query)),
      InvalidEditorialCursor,
      query
    );
  }
});

test("route family keeps overlapping article and news slugs distinct", () => {
  const overlapping = { slug: "spolocenstvo" };
  assert.equal(
    editorialPath(overlapping, "article"),
    "/farnost/nase-spolocenstvo/spolocenstvo"
  );
  assert.equal(editorialPath(overlapping, "news"), "/prispevky/spolocenstvo");
});

test("calendar dates format in Slovak without a midnight timezone shift", () => {
  assert.match(formatEditorialDate("2026-10-25"), /25.*októbra.*2026/);
});

test("editorial links permit web/contact/local destinations and reject executable protocols", () => {
  for (const href of [
    "/prispevky",
    "https://farazv.sk",
    "mailto:fara@example.sk",
    "tel:+421111111111"
  ]) {
    assert.equal(isSafeEditorialLink(href), true, href);
  }
  for (const href of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//attacker.example",
    "/\\attacker.example",
    "relative-without-slash"
  ]) {
    assert.equal(isSafeEditorialLink(href), false, href);
  }
});
