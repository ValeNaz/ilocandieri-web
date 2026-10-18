CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`area` text NOT NULL,
	`opening_id` text,
	`message` text DEFAULT '' NOT NULL,
	`cv_path` text,
	`cv_name` text,
	`cv_mime` text,
	`cv_size` integer,
	`privacy_accepted_at` integer NOT NULL,
	`privacy_version` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_hash` text,
	FOREIGN KEY (`opening_id`) REFERENCES `job_openings`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `applications_status_created_idx` ON `applications` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text,
	`entity_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_log_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_hash` text
);
--> statement-breakpoint
CREATE INDEX `contact_messages_status_created_idx` ON `contact_messages` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`text` text NOT NULL,
	`html` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_outbox_idempotency_key_unique` ON `email_outbox` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `email_outbox_status_created_idx` ON `email_outbox` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `email_templates` (
	`key` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_categories_slug_unique` ON `event_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `event_form_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`version` integer NOT NULL,
	`fields` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_form_versions_event_version_uq` ON `event_form_versions` (`event_id`,`version`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`location` text,
	`cover_id` text,
	`category_id` text,
	`audience` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`cta_type` text DEFAULT 'none' NOT NULL,
	`cta_label` text,
	`cta_target` text,
	`registration_mode` text,
	`capacity` integer,
	`max_seats_per_request` integer DEFAULT 1 NOT NULL,
	`pending_holds_seats` integer DEFAULT false NOT NULL,
	`reserved_criteria` text,
	`reserved_verification` text,
	`registration_opens_at` integer,
	`registration_closes_at` integer,
	`registration_manually_closed` integer DEFAULT false NOT NULL,
	`seats_confirmed` integer DEFAULT 0 NOT NULL,
	`seats_held` integer DEFAULT 0 NOT NULL,
	`privacy_note` text,
	`success_message` text,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `event_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_status_starts_idx` ON `events` (`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `events_category_idx` ON `events` (`category_id`);--> statement-breakpoint
CREATE TABLE `job_openings` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_openings_slug_unique` ON `job_openings` (`slug`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text DEFAULT '' NOT NULL,
	`credit` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_path_unique` ON `media` (`path`);--> statement-breakpoint
CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`cover_id` text,
	`category_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`seo_title` text,
	`seo_description` text,
	`og_image_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `news_categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`og_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_slug_unique` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `news_status_pub_idx` ON `news` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `news_category_idx` ON `news` (`category_id`);--> statement-breakpoint
CREATE TABLE `news_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_categories_slug_unique` ON `news_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `news_images` (
	`news_id` text NOT NULL,
	`media_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`news_id`, `media_id`),
	FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `page_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`type` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	`data` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `page_blocks_page_pos_idx` ON `page_blocks` (`page_id`,`position`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`og_image_id` text,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`og_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_key_unique` ON `pages` (`key`);--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_resets_token_hash_unique` ON `password_resets` (`token_hash`);--> statement-breakpoint
CREATE INDEX `password_resets_user_idx` ON `password_resets` (`user_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`external_id` text,
	`handle` text,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`image_url` text NOT NULL,
	`image_alt` text DEFAULT '' NOT NULL,
	`category` text,
	`price_text` text,
	`price_checked_at` integer,
	`available` integer,
	`visible` integer DEFAULT true NOT NULL,
	`featured_home` integer DEFAULT false NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`sync_status` text,
	`last_synced_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_url_uq` ON `products` (`url`);--> statement-breakpoint
CREATE INDEX `products_visible_pos_idx` ON `products` (`visible`,`position`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`form_version_id` text NOT NULL,
	`status` text NOT NULL,
	`seats` integer DEFAULT 1 NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_normalized` text NOT NULL,
	`phone` text,
	`answers` text,
	`dedupe_key` text,
	`admin_note` text,
	`decided_at` integer,
	`decided_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ip_hash` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`form_version_id`) REFERENCES `event_form_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_dedupe_key_unique` ON `registrations` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `registrations_event_status_idx` ON `registrations` (`event_id`,`status`);--> statement-breakpoint
CREATE INDEX `registrations_created_idx` ON `registrations` (`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);