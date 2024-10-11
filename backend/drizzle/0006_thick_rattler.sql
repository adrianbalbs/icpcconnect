ALTER TABLE "registration_details" DROP CONSTRAINT "registration_details_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_details" ADD CONSTRAINT "registration_details_id_students_id_fk" FOREIGN KEY ("id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
