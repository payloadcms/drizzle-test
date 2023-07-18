CREATE TABLE `pages` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`relation_has_one` integer,
	FOREIGN KEY (`relation_has_one`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_relation_has_many` (
	`id` integer PRIMARY KEY NOT NULL,
	`pages_id` integer,
	`_posts_id` integer NOT NULL,
	`_order` integer NOT NULL,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`_posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`title` text,
	`number` integer,
	`_post_id` integer NOT NULL,
	FOREIGN KEY (`_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_field` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text,
	`_order` integer,
	`_posts_id` integer,
	FOREIGN KEY (`_posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_field_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`sub_field` text,
	`post_my_array_field_id` integer NOT NULL,
	FOREIGN KEY (`post_my_array_field_id`) REFERENCES `posts_my_array_field`(`id`) ON UPDATE no action ON DELETE no action
);
