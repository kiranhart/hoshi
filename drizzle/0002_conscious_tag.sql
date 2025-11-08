CREATE TABLE `diagnosis` (
	`id` varchar(36) NOT NULL,
	`page_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`severity` varchar(20),
	`diagnosis_date` timestamp(3),
	`description` text,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnosis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `diagnosis` ADD CONSTRAINT `diagnosis_page_id_page_id_fk` FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON DELETE cascade ON UPDATE no action;