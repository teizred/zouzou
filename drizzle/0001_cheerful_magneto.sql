CREATE TABLE "couples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user1_id" text NOT NULL,
	"user2_id" text,
	"invite_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "couples_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "moods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT '' NOT NULL,
	"value" text NOT NULL,
	"note" text,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT '' NOT NULL,
	"week_start" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "diary" ADD COLUMN "user_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "maybe" ADD COLUMN "user_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "maybe" ADD COLUMN "is_shared" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "user_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "user_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "is_shared" boolean DEFAULT false NOT NULL;