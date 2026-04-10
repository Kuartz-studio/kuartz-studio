CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_base64` text,
	`password_hash` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `project_to_user` (
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	PRIMARY KEY(`project_id`, `user_id`),
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`url` text,
	`logo_base64` text,
	`priority` integer DEFAULT 0,
	`target_date` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_slug_unique` ON `project` (`slug`);--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`issue_number` integer,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'BACKLOG' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_by_user_id` text NOT NULL,
	`target_date` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `task_assignee` (
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `user_id`),
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `task_tag` (
	`task_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`task_id`, `tag_id`),
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `document_to_task` (
	`document_id` text NOT NULL,
	`task_id` text NOT NULL,
	PRIMARY KEY(`document_id`, `task_id`),
	FOREIGN KEY (`document_id`) REFERENCES `document`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `document` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`order` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comment` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`author_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `file_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`added_by_user_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`format` text DEFAULT 'other' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`entity_title` text,
	`user_id` text NOT NULL,
	`metadata` text,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`link_to` text,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
