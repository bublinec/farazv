import type {
  ContentRecord,
  RichTextDocument,
  SourceProvenance
} from "../../src/content/documents";
import type { ContentBlock, MediaAsset } from "../../src/content/types";

export type SourceRow = Record<string, string | null>;
export interface DumpSource {
  tables: Record<string, SourceRow[]>;
  skippedTables: string[];
}
export interface MigratedMedia {
  id: string;
  sourceId: string;
  publicId: string | null;
  url: string;
  mime: string;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string;
  sourceHash: string;
  /** Retained privately for asset recovery; never serialize the inventory publicly. */
  metadata: {
    name: string;
    originalHash: string;
    extension: string;
    sizeKilobytes: number | null;
    formats: unknown;
    provider: string;
    providerMetadata: unknown;
    availability?: {
      checkedAt: string;
      status: number | null;
      available: boolean;
    };
    references: { type: string; id: string; field: string; order: number }[];
  };
}
export interface MigratedStaticPage {
  id: string;
  kind: "admin-page" | "page";
  sourceId: string;
  title: string;
  slug: string;
  route: string | null;
  description: string;
  body: RichTextDocument;
  blocks: ContentBlock[];
  cover?: MediaAsset;
  publishedAt: string | null;
  source: SourceProvenance;
  sections: {
    id: string;
    type: string;
    order: number;
    body: RichTextDocument;
    blocks: ContentBlock[];
  }[];
}
export interface MigrationReport {
  schemaVersion: 1;
  sourceCounts: Record<string, number>;
  records: Record<string, { total: number; published: number; draft: number }>;
  media: {
    total: number;
    images: number;
    other: number;
    relationCount: number;
    invalidUrls: number;
    unreferenced: number;
  };
  staticPages: { total: number; published: number; mappedRoutes: number };
  bodyReconciliations: {
    sourceId: string;
    choice: string;
    appendedParagraphs: number;
    appendedImages: number;
    flatCharacters: number;
    sectionCharacters: number;
  }[];
  anomalies: { kind: string; sourceId: string; codes: string[] }[];
  sectionTypes: Record<string, number>;
  unresolvedComponents: { type: string; id: string }[];
  crossKindSlugCollisions: number;
  settings: { imported: boolean; recurringScheduleConfirmed: false };
  donationProjection: {
    droppedEmptyContainers: number;
    categorizedEntries: number;
    uncategorizedEntries: number;
  };
}
export interface MigrationResult {
  records: ContentRecord[];
  media: MigratedMedia[];
  staticPages: MigratedStaticPage[];
  report: MigrationReport;
}
