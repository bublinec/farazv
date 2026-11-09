import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
  check,
  customType
} from "drizzle-orm/pg-core";
import type { EditorGrantRole } from "@/content/editor-access";
import type { ContentDocument, SourceProvenance } from "@/content/documents";
import type {
  FeedbackDetails,
  FeedbackStatus,
  FeedbackTopic
} from "@/content/feedback";

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
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string"
    }).defaultNow(),
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

/** Saved and published versions of editable pages, kept for restoring. */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: text("id").primaryKey(),
    recordId: text("record_id").notNull(),
    version: integer("version").notNull(),
    action: text("action")
      .$type<"save" | "publish" | "unpublish" | "restore">()
      .notNull(),
    document: jsonb("document").$type<ContentDocument>().notNull(),
    actor: text("actor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("content_revisions_record_idx").on(table.recordId, table.createdAt),
    check(
      "content_revisions_action_check",
      sql`${table.action} in ('save', 'publish', 'unpublish', 'restore')`
    )
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
export const editorAccess = pgTable(
  "editor_access",
  {
    email: text("email").primaryKey(),
    role: text("role").$type<EditorGrantRole>().notNull().default("editor"),
    grantedBy: text("granted_by").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    revokedBy: text("revoked_by"),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" })
  },
  (table) => [
    check(
      "editor_access_role_check",
      sql`${table.role} in ('editor', 'lektorka')`
    )
  ]
);

export const editorAccessAudit = pgTable("editor_access_audit", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  actor: text("actor").notNull(),
  previousRole: text("previous_role").$type<EditorGrantRole>(),
  nextRole: text("next_role").$type<EditorGrantRole>(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
});

/** Visitor messages are private records, with no publishing or public snapshot. */
export const visitorFeedback = pgTable(
  "visitor_feedback",
  {
    id: text("id").primaryKey(),
    topic: text("topic").$type<FeedbackTopic>().notNull(),
    subject: text("subject").notNull(),
    email: text("email"),
    details: jsonb("details").$type<FeedbackDetails>().notNull(),
    fingerprint: text("fingerprint").notNull(),
    status: text("status").$type<FeedbackStatus>().notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("feedback_status_created_idx").on(
      table.status,
      table.createdAt,
      table.id
    )
  ]
);

/** Short-lived HMAC buckets; neither messages nor buckets store raw addresses. */
export const feedbackRateLimits = pgTable(
  "feedback_rate_limits",
  {
    key: text("key").primaryKey(),
    attempts: integer("attempts").notNull().default(1),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string"
    }).notNull()
  },
  (table) => [index("feedback_rate_expiry_idx").on(table.expiresAt)]
);

/** Private documents are never represented as public media or content snapshots. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea"
});

export const lectorSchedules = pgTable(
  "lector_schedules",
  {
    month: text("month").primaryKey(),
    pdf: bytea("pdf"),
    version: integer("version").notNull().default(1),
    updatedBy: text("updated_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
  },
  (table) => [
    check(
      "lector_schedule_month",
      sql`${table.month} ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'`
    ),
    check(
      "lector_schedule_pdf_size",
      sql`${table.pdf} is null or octet_length(${table.pdf}) <= 3145728`
    ),
    check("lector_schedule_version", sql`${table.version} > 0`)
  ]
);

export const lectorSecurity = pgTable("lector_security", {
  id: text("id").primaryKey(),
  passwordHash: text("password_hash"),
  revision: integer("revision").notNull().default(0),
  changedBy: text("changed_by"),
  changedAt: timestamp("changed_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow()
});

export const lectorSessions = pgTable(
  "lector_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    revision: integer("revision").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string"
    }).notNull()
  },
  (table) => [index("lector_session_expiry_idx").on(table.expiresAt)]
);

export const lectorRateLimits = pgTable(
  "lector_rate_limits",
  {
    key: text("key").primaryKey(),
    attempts: integer("attempts").notNull().default(1),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string"
    }).notNull()
  },
  (table) => [index("lector_rate_expiry_idx").on(table.expiresAt)]
);
