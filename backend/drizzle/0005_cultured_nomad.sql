ALTER TABLE "courses_completed_by_student" DROP CONSTRAINT "courses_completed_by_student_student_id_registration_details_id_fk";
--> statement-breakpoint
ALTER TABLE "courses_completed_by_student" DROP CONSTRAINT "courses_completed_by_student_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "languages_spoken_by_student" DROP CONSTRAINT "languages_spoken_by_student_student_id_registration_details_id_fk";
--> statement-breakpoint
ALTER TABLE "languages_spoken_by_student" DROP CONSTRAINT "languages_spoken_by_student_language_code_spoken_languages_code_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses_completed_by_student" ADD CONSTRAINT "courses_completed_by_student_student_id_registration_details_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."registration_details"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses_completed_by_student" ADD CONSTRAINT "courses_completed_by_student_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "languages_spoken_by_student" ADD CONSTRAINT "languages_spoken_by_student_student_id_registration_details_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."registration_details"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "languages_spoken_by_student" ADD CONSTRAINT "languages_spoken_by_student_language_code_spoken_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."spoken_languages"("code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
