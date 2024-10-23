CREATE TABLE IF NOT EXISTS "verify_emails" (
	"code" integer NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "verify_emails_code_unique" UNIQUE("code")
);
