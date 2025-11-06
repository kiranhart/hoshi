ALTER TABLE `allergy` ADD `reaction` text;--> statement-breakpoint
ALTER TABLE `allergy` ADD `severity` varchar(20) DEFAULT 'mild' NOT NULL;--> statement-breakpoint
ALTER TABLE `allergy` ADD `is_medicine` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `emergency_contact` ADD `relation` varchar(100);