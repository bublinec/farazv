CREATE TABLE "content_records" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"slug" text,
	"public_slug" text,
	"draft" jsonb NOT NULL,
	"published" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" jsonb,
	"read_only" boolean DEFAULT false NOT NULL,
	"eligible_week" text
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"public_id" text,
	"url" text NOT NULL,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "static_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text,
	"published_at" timestamp with time zone,
	"content" jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_public_path_unique" ON "content_records" USING btree ("kind","public_slug") WHERE "content_records"."public_slug" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "content_current_week_unique" ON "content_records" USING btree ("eligible_week") WHERE "content_records"."eligible_week" is not null;--> statement-breakpoint
CREATE INDEX "content_kind_updated_idx" ON "content_records" USING btree ("kind","updated_at");--> statement-breakpoint
CREATE INDEX "media_mime_idx" ON "media_assets" USING btree ("mime");