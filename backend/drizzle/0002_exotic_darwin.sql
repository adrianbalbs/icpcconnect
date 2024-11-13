ALTER TABLE "teams" ADD COLUMN "contest" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_contest_contests_id_fk" FOREIGN KEY ("contest") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
