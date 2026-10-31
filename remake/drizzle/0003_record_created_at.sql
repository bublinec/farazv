-- Existing records keep their original creation date when known; do not label
-- the migration time as the creation time of historical content.
ALTER TABLE "content_records" ADD COLUMN "created_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "content_records"
SET "created_at" = ("source"->>'createdAt')::timestamptz
WHERE "source"->>'createdAt' IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "content_records" ALTER COLUMN "created_at" SET DEFAULT now();
