CREATE TABLE IF NOT EXISTS "contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256),
	"early_bird_date" timestamp NOT NULL,
	"cutoff_date" timestamp NOT NULL,
	"contest_date" timestamp NOT NULL,
	"university" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contests" ADD CONSTRAINT "contests_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
