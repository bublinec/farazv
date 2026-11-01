import type {
  Bulletin,
  EditorialEntry,
  MediaAsset,
  RegularSchedule,
  SiteSettings
} from "./types";

/** Shared persisted/editor contracts. No server clients or secrets belong here. */
export type RecordKind = keyof ContentDocumentMap;
export type EditorialRecordKind = Exclude<RecordKind, "bulletin" | "settings">;

export interface RichTextNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichTextNode[];
}

export interface RichTextDocument extends RichTextNode {
  type: "doc";
  content: RichTextNode[];
}

export interface EditorialDocument extends EditorialEntry {
  body?: RichTextDocument;
  isPoster?: boolean;
  posterDestination?: string;
  posterExpiresOn?: string;
  showInNews?: boolean;
}

export interface BulletinDocument extends Omit<Bulletin, "published"> {
  donations?: { label: string; amount?: string; category?: string }[];
}

export interface SettingsDocument extends SiteSettings {
  regularSchedule: RegularSchedule;
  contactNote?: string;
  officeNote?: string;
  mobile?: string;
  ico?: string;
  mapLink?: string;
  priests?: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
    image?: MediaAsset;
  }[];
  donationQr?: MediaAsset;
}

/** The envelope kind is the single discriminator for persisted documents. */
export interface ContentDocumentMap {
  article: EditorialDocument;
  news: EditorialDocument;
  notice: EditorialDocument;
  event: EditorialDocument;
  bulletin: BulletinDocument;
  settings: SettingsDocument;
}

export type ContentDocument = ContentDocumentMap[RecordKind];

export interface SourceProvenance {
  kind: string;
  id: string;
  hash: string;
  importedVersion: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  anomalies?: string[];
}

interface ContentRecordEnvelope {
  id: string;
  title: string;
  slug: string | null;
  version: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string;
  source: SourceProvenance | null;
  readOnly: boolean;
}

/** Distribution keeps kind, draft and published correlated when narrowed. */
export type ContentRecordFor<K extends RecordKind> = {
  [Kind in K]: ContentRecordEnvelope & {
    kind: Kind;
    draft: ContentDocumentMap[Kind];
    published: ContentDocumentMap[Kind] | null;
  };
}[K];

export type ContentRecord = ContentRecordFor<RecordKind>;

export interface AdminRecordSummary
  extends Omit<ContentRecord, "draft" | "published"> {
  isPublished: boolean;
  hasUnpublishedChanges?: boolean;
  weekStart?: string;
  cover?: MediaAsset;
}
