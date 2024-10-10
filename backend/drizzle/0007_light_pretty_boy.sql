ALTER TABLE "site_coordinators" RENAME COLUMN "site" TO "university";--> statement-breakpoint
ALTER TABLE "site_coordinators" DROP CONSTRAINT "site_coordinators_site_universities_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_coordinators" ADD CONSTRAINT "site_coordinators_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
