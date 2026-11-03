CREATE TABLE "feedback_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"subject" text NOT NULL,
	"email" text,
	"details" jsonb NOT NULL,
	"fingerprint" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feedback_rate_expiry_idx" ON "feedback_rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "feedback_status_created_idx" ON "visitor_feedback" USING btree ("status","created_at","id");