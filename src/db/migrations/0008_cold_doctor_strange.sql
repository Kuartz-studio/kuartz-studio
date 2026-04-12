DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "project_slug_unique";--> statement-breakpoint
DROP INDEX "project_client_portal_token_unique";--> statement-breakpoint
ALTER TABLE `task` ALTER COLUMN "order_in_project" TO "order_in_project" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_slug_unique` ON `project` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_client_portal_token_unique` ON `project` (`client_portal_token`);