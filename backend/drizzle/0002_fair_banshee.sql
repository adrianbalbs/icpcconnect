ALTER TABLE "replacements" RENAME COLUMN "id" TO "team_id";--> statement-breakpoint
ALTER TABLE "replacements" DROP CONSTRAINT "replacements_id_student_details_id_fk";
--> statement-breakpoint
ALTER TABLE "replacements" ADD COLUMN "leaving_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replacements" ADD CONSTRAINT "replacements_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
