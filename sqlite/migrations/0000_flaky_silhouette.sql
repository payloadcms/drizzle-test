CREATE TABLE `pages` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text
);
--> statement-breakpoint
CREATE TABLE `pages_relationships` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`order` integer,
	`posts_id` integer,
	`pages_id` integer,
	`people_id` integer,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`people_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY NOT NULL,
	`full_name` text
);
--> statement-breakpoint
CREATE TABLE `people_relationships` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`order` integer,
	`posts_id` integer,
	`pages_id` integer,
	`people_id` integer,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`people_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `posts_block1` (
	`id` integer PRIMARY KEY NOT NULL,
	`non_localized_text` text,
	`_path` text NOT NULL,
	`_locale` text,
	`_order` integer NOT NULL,
	`_parent_id` integer,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_block1_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`localized_text` text,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts_block1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_block2` (
	`id` integer PRIMARY KEY NOT NULL,
	`number` integer,
	`_path` text NOT NULL,
	`_locale` text,
	`_order` integer,
	`_parent_id` integer,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`title` text,
	`number` integer,
	`my_group_sub_field_localized` text,
	`my_group_sub_group_sub_sub_field_localized` text,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text,
	`_order` integer NOT NULL,
	`_parent_id` integer,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_locales` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`sub_field` text,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts_my_array`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_array_my_sub_array` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text,
	`_order` integer NOT NULL,
	`_parent_id` integer,
	`sub_sub_field` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts_my_array`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts_my_group_group_array` (
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text,
	`_order` integer NOT NULL,
	`_parent_id` integer,
	`group_array_text` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
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
--> statement-breakpoint
CREATE TABLE `users_relationships` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`order` integer,
	`posts_id` integer,
	`pages_id` integer,
	`people_id` integer,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posts_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`people_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
