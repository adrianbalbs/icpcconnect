ALTER TABLE "students" ALTER COLUMN "university" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "photo_consent" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "registration_details" DROP COLUMN IF EXISTS "allergies";--> statement-breakpoint
ALTER TABLE "registration_details" DROP COLUMN IF EXISTS "photo_consent";