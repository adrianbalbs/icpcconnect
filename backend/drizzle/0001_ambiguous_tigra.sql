CREATE TABLE IF NOT EXISTS "replacements" (
	"id" uuid,
	"student_id" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replacements" ADD CONSTRAINT "replacements_id_student_details_id_fk" FOREIGN KEY ("id") REFERENCES "public"."student_details"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
