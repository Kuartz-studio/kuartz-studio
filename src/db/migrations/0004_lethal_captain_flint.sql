PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_file_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`task_id` text,
	`added_by_user_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`format` text DEFAULT 'other' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_file_attachment`("id", "project_id", "task_id", "added_by_user_id", "title", "url", "format", "created_at") SELECT "id", "project_id", "task_id", "added_by_user_id", "title", "url", "format", "created_at" FROM `file_attachment`;--> statement-breakpoint
DROP TABLE `file_attachment`;--> statement-breakpoint
ALTER TABLE `__new_file_attachment` RENAME TO `file_attachment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;