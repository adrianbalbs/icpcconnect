ALTER TABLE "students" ADD COLUMN "exclusions" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flagged" boolean DEFAULT false NOT NULL;