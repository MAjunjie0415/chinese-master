CREATE TABLE "user_usage" (
	"id" integer GENERATED ALWAYS AS IDENTITY (sequence name "user_usage_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" uuid NOT NULL,
	"usage_date" date DEFAULT now() NOT NULL,
	"generation_count" integer DEFAULT 0 NOT NULL,
	"pronunciation_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_usage_userId_usage_date_pk" PRIMARY KEY("userId","usage_date")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invite_quota" integer DEFAULT 3 NOT NULL,
	"invited_count" integer DEFAULT 0 NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "golden_corpus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "golden_corpus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chinese" text NOT NULL,
	"pinyin" text NOT NULL,
	"english" text NOT NULL,
	"level" text NOT NULL,
	"category" text,
	"scene" text,
	"example_sentence" text,
	"audio_url" text,
	"embedding" vector(384),
	"source" text,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "golden_corpus_chinese_unique" UNIQUE("chinese")
);
--> statement-breakpoint
CREATE TABLE "cached_courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cached_courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"prompt_embedding" vector(1536) NOT NULL,
	"prompt_hash" text NOT NULL,
	"user_level" text,
	"generated_course" jsonb NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_hit_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"generated_by" uuid NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by" uuid,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_wishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_user_word_unique";--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_word_id_fk";
--> statement-breakpoint
DROP INDEX "user_progress_user_next_review_idx";--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "mastery_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "correct_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "error_history" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "first_seen_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "next_review_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "is_custom" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "source_text" text;--> statement-breakpoint
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wishes" ADD CONSTRAINT "user_wishes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_corpus_embedding" ON "golden_corpus" USING ivfflat ("embedding");--> statement-breakpoint
CREATE INDEX "idx_corpus_level" ON "golden_corpus" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_cache_embedding" ON "cached_courses" USING ivfflat ("prompt_embedding");--> statement-breakpoint
CREATE INDEX "idx_cache_hash" ON "cached_courses" USING btree ("prompt_hash");--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_progress_user_word" ON "user_progress" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE INDEX "idx_progress_next_review" ON "user_progress" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "courses_created_by_idx" ON "courses" USING btree ("created_by");--> statement-breakpoint
ALTER TABLE "user_progress" DROP COLUMN "last_reviewed";--> statement-breakpoint
ALTER TABLE "user_progress" DROP COLUMN "next_review";--> statement-breakpoint
ALTER TABLE "user_progress" DROP COLUMN "mastered";