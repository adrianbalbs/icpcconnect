ALTER TABLE "site_coordinators" DROP CONSTRAINT "site_coordinators_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_coordinators" ADD CONSTRAINT "site_coordinators_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
