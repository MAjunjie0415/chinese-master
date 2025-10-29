CREATE TABLE "words" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "words_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chinese" text NOT NULL,
	"pinyin" text NOT NULL,
	"english" text NOT NULL,
	"scene" text,
	"example" text,
	"category" text NOT NULL,
	"frequency" integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"word_id" integer NOT NULL,
	"last_reviewed" timestamp DEFAULT now() NOT NULL,
	"next_review" timestamp NOT NULL,
	"mastered" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_progress_user_word_unique" UNIQUE("user_id","word_id")
);
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_word_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "words_category_idx" ON "words" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_progress_user_next_review_idx" ON "user_progress" USING btree ("user_id","next_review");