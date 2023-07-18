CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `posts_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`locale` text,
	`title` text,
	`number` integer,
	`post_id` integer,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_field` (
	`id` integer PRIMARY KEY NOT NULL,
	`locale` text,
	`sub_field` text,
	`order` integer,
	`posts_id` integer,
	FOREIGN KEY (`posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
