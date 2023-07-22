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
	`my_group_sub_field` text,
	`my_group_sub_group_sub_sub_field` text
);
--> statement-breakpoint
CREATE TABLE `posts_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`title` text,
	`number` integer,
	`my_group_sub_field_localized` text,
	`my_group_sub_group_sub_sub_field_localized` text,
	`_post_id` integer NOT NULL,
	FOREIGN KEY (`_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text,
	`_order` integer,
	`_posts_id` integer,
	FOREIGN KEY (`_posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`sub_field` text,
	`post_my_array_id` integer NOT NULL,
	FOREIGN KEY (`post_my_array_id`) REFERENCES `posts_my_array`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_relationships` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`order` integer,
	`posts_id` integer,
	`pages_id` integer,
	`people_id` integer,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`people_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`email` text
);
