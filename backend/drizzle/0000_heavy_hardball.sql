DO $$ BEGIN
 CREATE TYPE "public"."course_type" AS ENUM('Programming Fundamentals', 'Data Structures and Algorithms', 'Algorithm Design', 'Programming Challenges');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."language_experience" AS ENUM('none', 'some', 'prof');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."level" AS ENUM('A', 'B');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('student', 'coach', 'site_coordinator', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_codes" (
	"code" integer NOT NULL,
	"email" text NOT NULL,
	"created_at::timestamp without time zone" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coaches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"university" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "course_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses_completed_by_student" (
	"student_id" uuid NOT NULL,
	"course_id" integer NOT NULL,
	CONSTRAINT "courses_completed_by_student_student_id_course_id_pk" PRIMARY KEY("student_id","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invite_codes" (
	"code" integer NOT NULL,
	"role" integer NOT NULL,
	"created_at::timestamp without time zone" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages_spoken_by_student" (
	"student_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	CONSTRAINT "languages_spoken_by_student_student_id_language_code_pk" PRIMARY KEY("student_id","language_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registration_details" (
	"id" uuid PRIMARY KEY NOT NULL,
	"level" "level" NOT NULL,
	"contest_experience" integer DEFAULT 0 NOT NULL,
	"leetcode_rating" integer DEFAULT 0 NOT NULL,
	"codeforces_rating" integer DEFAULT 0 NOT NULL,
	"cpp_experience" "language_experience" NOT NULL,
	"c_experience" "language_experience" NOT NULL,
	"java_experience" "language_experience" NOT NULL,
	"python_experience" "language_experience" NOT NULL,
	"time_submitted" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_coordinators" (
	"id" uuid PRIMARY KEY NOT NULL,
	"university" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spoken_languages" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "students" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"pronouns" text,
	"dietary_requirements" text DEFAULT '',
	"tshirt_size" text,
	"team" uuid,
	"photo_consent" boolean NOT NULL,
	"university" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"university" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"hosted_at" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"given_name" varchar(35) NOT NULL,
	"family_name" varchar(35) NOT NULL,
	"password" varchar(128) NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verify_emails" (
	"code" integer NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "verify_emails_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coaches" ADD CONSTRAINT "coaches_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coaches" ADD CONSTRAINT "coaches_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
 ALTER TABLE "languages_spoken_by_student" ADD CONSTRAINT "languages_spoken_by_student_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "languages_spoken_by_student" ADD CONSTRAINT "languages_spoken_by_student_language_code_spoken_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."spoken_languages"("code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_details" ADD CONSTRAINT "registration_details_id_students_id_fk" FOREIGN KEY ("id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_coordinators" ADD CONSTRAINT "site_coordinators_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_coordinators" ADD CONSTRAINT "site_coordinators_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_team_teams_id_fk" FOREIGN KEY ("team") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "students" ADD CONSTRAINT "students_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
