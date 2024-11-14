ALTER TABLE "registration_details" ADD COLUMN "time_submitted" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "student_details" DROP COLUMN IF EXISTS "time_submitted";