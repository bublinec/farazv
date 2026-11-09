CREATE TABLE "content_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"record_id" text NOT NULL,
	"version" integer NOT NULL,
	"action" text NOT NULL,
	"document" jsonb NOT NULL,
	"actor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_revisions_action_check" CHECK ("content_revisions"."action" in ('save', 'publish', 'unpublish', 'restore'))
);
--> statement-breakpoint
CREATE INDEX "content_revisions_record_idx" ON "content_revisions" USING btree ("record_id","created_at");