ALTER TABLE "languages_spoken_by_student" DROP CONSTRAINT "languages_spoken_by_student_student_id_registration_details_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "languages_spoken_by_student" ADD CONSTRAINT "languages_spoken_by_student_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
