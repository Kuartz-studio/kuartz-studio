ALTER TABLE `project` ADD `client_portal_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `project_client_portal_token_unique` ON `project` (`client_portal_token`);