import type {
  BulletinDocument,
  ContentRecord,
  ContentRecordFor,
  EditorialDocument,
  SettingsDocument
} from "../src/content/documents";

// Compile-time contracts: a record kind must determine both document snapshots.
// This file is checked by TypeScript and has no runtime database/provider effects.
function documentsFollowRecordKind(record: ContentRecord) {
  switch (record.kind) {
    case "bulletin": {
      const draft: BulletinDocument = record.draft;
      const published: BulletinDocument | null = record.published;
      // @ts-expect-error A bulletin envelope cannot carry an editorial document.
      const editorial: EditorialDocument = record.draft;
      return [draft, published, editorial];
    }
    case "settings": {
      const draft: SettingsDocument = record.draft;
      const published: SettingsDocument | null = record.published;
      return [draft, published];
    }
    case "article":
    case "news":
    case "notice":
    case "event": {
      const draft: EditorialDocument = record.draft;
      const published: EditorialDocument | null = record.published;
      return [draft, published];
    }
  }
}

function invalidSnapshotPair(
  record: ContentRecordFor<"bulletin">,
  article: EditorialDocument
) {
  // @ts-expect-error Matching kind and draft are required when constructing records.
  const invalid: ContentRecord = { ...record, draft: article };
  return invalid;
}

void documentsFollowRecordKind;
void invalidSnapshotPair;
