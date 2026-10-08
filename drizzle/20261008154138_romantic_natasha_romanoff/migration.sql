ALTER TABLE "user" ADD CONSTRAINT "user_email_key" UNIQUE("email");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" ("provider_id","account_id");