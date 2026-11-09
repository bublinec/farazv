import type { ContentRecord, EditorialRecordKind } from "@/content/documents";

const editorialPrefixes: Record<EditorialRecordKind, string> = {
  article: "/farnost/nase-spolocenstvo",
  news: "/prispevky",
  event: "/prispevky",
  notice: "/vyveska"
};

/** Events and news share a public route family; notices and articles own theirs. */
export function editorialRecordPath(kind: EditorialRecordKind, slug: string) {
  return `${editorialPrefixes[kind]}/${encodeURIComponent(slug)}`;
}

export function publicRecordPath(record: ContentRecord): string | null {
  if (!record.published) return null;

  switch (record.kind) {
    case "bulletin":
      return "/farnost/farske-oznamy";
    case "settings":
      return "/kontakt";
    case "page":
      return `/${record.published.route}`;
    case "article":
    case "news":
    case "event":
    case "notice":
      return editorialRecordPath(record.kind, record.published.slug);
  }
}
