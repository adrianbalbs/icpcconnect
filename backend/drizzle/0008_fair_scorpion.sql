CREATE TABLE IF NOT EXISTS "auth_codes" (
	"code" integer NOT NULL,
	"email" text NOT NULL,
	"created_at::timestamp without time zone" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invite_codes" (
	"code" integer NOT NULL,
	"role" integer NOT NULL,
	"created_at::timestamp without time zone" timestamp DEFAULT now() NOT NULL
);
