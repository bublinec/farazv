import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";
import type { ContentDocument, SourceProvenance } from "@/content/documents";

export const contentRecords = pgTable(
  "content_records",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    title: text("title").notNull().default(""),
    slug: text("slug"),
    publicSlug: text("public_slug"),
    draft: jsonb("draft").$type<ContentDocument>().notNull(),
    published: jsonb("published").$type<ContentDocument>(),
    version: integer("version").notNull().default(1),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "string"
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    source: jsonb("source").$type<SourceProvenance>(),
    readOnly: boolean("read_only").notNull().default(false),
    eligibleWeek: text("eligible_week")
  },
  (table) => [
    uniqueIndex("content_public_path_unique")
      .on(
        sql`(case when ${table.kind} in ('news', 'event') then 'news' else ${table.kind} end)`,
        table.publicSlug
      )
      .where(sql`${table.publicSlug} is not null`),
    uniqueIndex("content_current_week_unique")
      .on(table.eligibleWeek)
      .where(sql`${table.eligibleWeek} is not null`),
    index("content_kind_updated_idx").on(table.kind, table.updatedAt)
  ]
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    publicId: text("public_id"),
    url: text("url").notNull(),
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt").notNull().default(""),
    caption: text("caption"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
  },
  (table) => [index("media_mime_idx").on(table.mime)]
);

export const staticSources = pgTable("static_sources", {
  id: text("id").primaryKey(),
  slug: text("slug"),
  publishedAt: timestamp("published_at", {
    withTimezone: true,
    mode: "string"
  }),
  content: jsonb("content").$type<Record<string, unknown>>().notNull()
});

export const importRuns = pgTable("import_runs", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  report: jsonb("report").$type<Record<string, unknown>>().notNull()
});

/** Admins come from environment configuration; only revocable editor grants live here. */
export const editorAccess = pgTable("editor_access", {
  email: text("email").primaryKey(),
  grantedBy: text("granted_by").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  revokedBy: text("revoked_by"),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" })
});
