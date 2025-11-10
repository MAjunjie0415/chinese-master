CREATE TABLE "course_words" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_words_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"course_id" integer NOT NULL,
	"word_id" integer NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_words_course_word_unique" UNIQUE("course_id","word_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"cover_image" text,
	"description" text,
	"total_words" integer DEFAULT 0 NOT NULL,
	"difficulty" text DEFAULT 'beginner',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "practice_records" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_records_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"mode" text NOT NULL,
	"duration" integer,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"accuracy" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"last_learned_at" timestamp,
	"is_completed" boolean DEFAULT false NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_courses_user_course_unique" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "course_words" ADD CONSTRAINT "course_words_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_words" ADD CONSTRAINT "course_words_word_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_records" ADD CONSTRAINT "practice_records_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_words_course_id_idx" ON "course_words" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_words_order_idx" ON "course_words" USING btree ("course_id","order");--> statement-breakpoint
CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "practice_records_user_id_idx" ON "practice_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "practice_records_course_id_idx" ON "practice_records" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "practice_records_mode_idx" ON "practice_records" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "practice_records_created_at_idx" ON "practice_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_courses_user_id_idx" ON "user_courses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_courses_course_id_idx" ON "user_courses" USING btree ("course_id");