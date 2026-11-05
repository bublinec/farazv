CREATE TABLE "editor_access_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"actor" text NOT NULL,
	"previous_role" text,
	"next_role" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lector_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lector_schedules" (
	"month" text PRIMARY KEY NOT NULL,
	"pdf" "bytea",
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lector_schedule_month" CHECK ("lector_schedules"."month" ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'),
	CONSTRAINT "lector_schedule_pdf_size" CHECK ("lector_schedules"."pdf" is null or octet_length("lector_schedules"."pdf") <= 3145728),
	CONSTRAINT "lector_schedule_version" CHECK ("lector_schedules"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "lector_security" (
	"id" text PRIMARY KEY NOT NULL,
	"password_hash" text,
	"revision" integer DEFAULT 0 NOT NULL,
	"changed_by" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lector_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"revision" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "editor_access" ADD COLUMN "role" text DEFAULT 'editor' NOT NULL;--> statement-breakpoint
CREATE INDEX "lector_rate_expiry_idx" ON "lector_rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "lector_session_expiry_idx" ON "lector_sessions" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "editor_access" ADD CONSTRAINT "editor_access_role_check" CHECK ("editor_access"."role" in ('editor', 'lektorka'));