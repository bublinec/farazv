import type { EditorialEntry } from "@/content/types";

export type EditorialKind = "article" | "news";
export type EditorialSummary = Omit<EditorialEntry, "blocks"> & {
  href?: string;
};

export interface EditorialPage {
  items: EditorialSummary[];
  nextCursor: string | null;
}

export const INITIAL_EDITORIAL_COUNT = 10;
export const MORE_EDITORIAL_COUNT = 6;

export function editorialPageSize(kind: EditorialKind, hasCursor: boolean) {
  if (kind === "article") return 12;
  return hasCursor ? MORE_EDITORIAL_COUNT : INITIAL_EDITORIAL_COUNT;
}

interface EditorialCursor {
  date: string;
  id: string;
}

export class InvalidEditorialCursor extends Error {
  constructor() {
    super("Neplatný odkaz na ďalšie články.");
    this.name = "InvalidEditorialCursor";
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Date and source ID together provide a deterministic order, even on the same day. */
function compareEntries(left: EditorialCursor, right: EditorialCursor): number {
  return compareText(right.date, left.date) || compareText(right.id, left.id);
}

export function encodeCursor(entry: EditorialCursor): string {
  return `v1.${entry.date}.${encodeURIComponent(entry.id)}`;
}

export function decodeCursor(cursor: string): EditorialCursor {
  if (cursor.length > 600 || !cursor.startsWith("v1.")) {
    throw new InvalidEditorialCursor();
  }
  const date = cursor.slice(3, 13);
  if (cursor[13] !== "." || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new InvalidEditorialCursor();
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new InvalidEditorialCursor();
  }
  let id: string;
  try {
    id = decodeURIComponent(cursor.slice(14));
  } catch {
    throw new InvalidEditorialCursor();
  }
  if (!id || id.length > 160 || /[\u0000-\u001f\u007f]/.test(id)) {
    throw new InvalidEditorialCursor();
  }
  return { date, id };
}

/** Public summaries deliberately exclude rich-text bodies. */
export function summarizeEditorial(
  entry: EditorialEntry & { href?: string }
): EditorialSummary {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    date: entry.date,
    author: entry.author,
    cover: entry.cover,
    ...(entry.href ? { href: entry.href } : {})
  };
}

export function editorialPage(
  entries: readonly EditorialEntry[],
  cursor?: string | null,
  kind: EditorialKind = "news"
): EditorialPage {
  const after = cursor ? decodeCursor(cursor) : undefined;
  const limit = editorialPageSize(kind, Boolean(after));
  const sorted = allEditorialSummaries(entries);
  const remaining = after
    ? sorted.filter((entry) => compareEntries(entry, after) > 0)
    : sorted;
  const batch = remaining.slice(0, limit);
  return {
    items: batch,
    nextCursor:
      remaining.length > limit ? encodeCursor(batch[batch.length - 1]) : null
  };
}

export function allEditorialSummaries(
  entries: readonly EditorialEntry[]
): EditorialSummary[] {
  return [...entries].sort(compareEntries).map(summarizeEditorial);
}

/** Unknown/duplicate query parameters cannot turn this endpoint into an unbounded export. */
export function editorialPageFromRequest(
  entries: readonly EditorialEntry[],
  searchParams: URLSearchParams
): EditorialPage {
  for (const key of searchParams.keys()) {
    if (key !== "cursor") throw new InvalidEditorialCursor();
  }
  if (
    searchParams.getAll("cursor").length > 1 ||
    searchParams.get("cursor") === ""
  ) {
    throw new InvalidEditorialCursor();
  }
  return editorialPage(entries, searchParams.get("cursor"));
}

export function editorialPath(
  entry: Pick<EditorialEntry, "slug"> & { href?: string },
  kind: EditorialKind
): string {
  if (entry.href) return entry.href;
  const prefix =
    kind === "article" ? "/farnost/nase-spolocenstvo" : "/prispevky";
  return `${prefix}/${encodeURIComponent(entry.slug)}`;
}

export function formatEditorialDate(date: string): string {
  return new Intl.DateTimeFormat("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bratislava"
  }).format(new Date(`${date}T12:00:00Z`));
}

export function isSafeEditorialLink(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\"))
    return true;
  try {
    const url = new URL(href);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}
