ALTER TABLE "users" ADD COLUMN "plan" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "custom_course_usage_count" integer DEFAULT 0 NOT NULL;