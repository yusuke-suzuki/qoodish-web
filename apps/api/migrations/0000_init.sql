CREATE TABLE `blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`blocked_id` integer NOT NULL,
	`blocker_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_blocks_on_blocked_id` ON `blocks` (`blocked_id`);--> statement-breakpoint
CREATE INDEX `index_blocks_on_blocker_id_and_blocked_id` ON `blocks` (`blocker_id`,`blocked_id`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`map_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_bookmarks_on_map_id_and_user_id` ON `bookmarks` (`map_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `index_bookmarks_on_map_id` ON `bookmarks` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_bookmarks_on_user_id` ON `bookmarks` (`user_id`);--> statement-breakpoint
CREATE TABLE `chapter_revision_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter_revision_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`image_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`chapter_revision_id`) REFERENCES `chapter_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_on_chapter_revision_id_image_id_9e3b64d6f1` ON `chapter_revision_images` (`chapter_revision_id`,`image_id`);--> statement-breakpoint
CREATE INDEX `index_chapter_revision_images_on_chapter_revision_id` ON `chapter_revision_images` (`chapter_revision_id`);--> statement-breakpoint
CREATE INDEX `index_chapter_revision_images_on_image_id` ON `chapter_revision_images` (`image_id`);--> statement-breakpoint
CREATE TABLE `chapter_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`map_features` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chapter_revisions_content_json" CHECK(json_valid("chapter_revisions"."content")),
	CONSTRAINT "chapter_revisions_map_features_json" CHECK(json_valid("chapter_revisions"."map_features"))
);
--> statement-breakpoint
CREATE INDEX `index_chapter_revisions_on_chapter_id_and_id` ON `chapter_revisions` (`chapter_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_chapter_revisions_on_chapter_id` ON `chapter_revisions` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `index_chapter_revisions_on_user_id` ON `chapter_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`journey_id` integer,
	`map_features` text NOT NULL,
	`map_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `chapter_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chapters_content_json" CHECK(json_valid("chapters"."content")),
	CONSTRAINT "chapters_map_features_json" CHECK(json_valid("chapters"."map_features"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_chapters_on_journey_id` ON `chapters` (`journey_id`);--> statement-breakpoint
CREATE INDEX `index_chapters_on_current_revision_id` ON `chapters` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_chapters_on_map_id` ON `chapters` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_chapters_on_status_and_created_at` ON `chapters` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `index_chapters_on_user_id_and_status` ON `chapters` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `chapters_search_documents` (
	`chapter_id` integer PRIMARY KEY NOT NULL,
	`terms` text NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `coauthorship_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`invitee_id` integer NOT NULL,
	`inviter_id` integer NOT NULL,
	`map_id` integer NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`invitee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_coauthorship_invitations_on_invitee_id_and_status` ON `coauthorship_invitations` (`invitee_id`,`status`);--> statement-breakpoint
CREATE INDEX `index_coauthorship_invitations_on_invitee_id` ON `coauthorship_invitations` (`invitee_id`);--> statement-breakpoint
CREATE INDEX `index_coauthorship_invitations_on_inviter_id` ON `coauthorship_invitations` (`inviter_id`);--> statement-breakpoint
CREATE INDEX `index_coauthorship_invitations_on_map_id_and_invitee_id` ON `coauthorship_invitations` (`map_id`,`invitee_id`);--> statement-breakpoint
CREATE INDEX `index_coauthorship_invitations_on_map_id` ON `coauthorship_invitations` (`map_id`);--> statement-breakpoint
CREATE TABLE `coauthorships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`map_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_coauthorships_on_map_id_and_user_id` ON `coauthorships` (`map_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `index_coauthorships_on_map_id` ON `coauthorships` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_coauthorships_on_user_id` ON `coauthorships` (`user_id`);--> statement-breakpoint
CREATE TABLE `comment_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body` text NOT NULL,
	`comment_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_comment_revisions_on_comment_id_and_id` ON `comment_revisions` (`comment_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_comment_revisions_on_comment_id` ON `comment_revisions` (`comment_id`);--> statement-breakpoint
CREATE INDEX `index_comment_revisions_on_user_id` ON `comment_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body` text NOT NULL,
	`commentable_id` integer NOT NULL,
	`commentable_type` text NOT NULL,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `comment_revisions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `index_comments_on_commentable_type_and_commentable_id` ON `comments` (`commentable_type`,`commentable_id`);--> statement-breakpoint
CREATE INDEX `index_comments_on_current_revision_id` ON `comments` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_comments_on_user_id` ON `comments` (`user_id`);--> statement-breakpoint
CREATE TABLE `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`registration_token` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_devices_on_user_id_and_registration_token` ON `devices` (`user_id`,`registration_token`);--> statement-breakpoint
CREATE INDEX `index_devices_on_registration_token` ON `devices` (`registration_token`);--> statement-breakpoint
CREATE INDEX `index_devices_on_user_id` ON `devices` (`user_id`);--> statement-breakpoint
CREATE TABLE `featured_maps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`map_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_featured_maps_on_created_at_and_map_id` ON `featured_maps` (`created_at`,`map_id`);--> statement-breakpoint
CREATE INDEX `index_featured_maps_on_map_id` ON `featured_maps` (`map_id`);--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`url` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_images_on_url` ON `images` (`url`);--> statement-breakpoint
CREATE INDEX `index_images_on_user_id` ON `images` (`user_id`);--> statement-breakpoint
CREATE TABLE `journal_bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`journal_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`journal_id`) REFERENCES `journals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_journal_bookmarks_on_journal_id_and_user_id` ON `journal_bookmarks` (`journal_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `index_journal_bookmarks_on_journal_id` ON `journal_bookmarks` (`journal_id`);--> statement-breakpoint
CREATE INDEX `index_journal_bookmarks_on_user_id` ON `journal_bookmarks` (`user_id`);--> statement-breakpoint
CREATE TABLE `journal_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`description` text,
	`journal_id` integer NOT NULL,
	`title` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`journal_id`) REFERENCES `journals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_journal_revisions_on_journal_id_and_id` ON `journal_revisions` (`journal_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_journal_revisions_on_journal_id` ON `journal_revisions` (`journal_id`);--> statement-breakpoint
CREATE INDEX `index_journal_revisions_on_user_id` ON `journal_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `journals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`description` text,
	`title` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `journal_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_journals_on_user_id` ON `journals` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_journals_on_current_revision_id` ON `journals` (`current_revision_id`);--> statement-breakpoint
CREATE TABLE `journey_checkin_revision_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`image_id` integer NOT NULL,
	`journey_checkin_revision_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`journey_checkin_revision_id`) REFERENCES `journey_checkin_revisions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_checkin_revision_images_on_revision_id_and_image_id` ON `journey_checkin_revision_images` (`journey_checkin_revision_id`,`image_id`);--> statement-breakpoint
CREATE INDEX `index_journey_checkin_revision_images_on_image_id` ON `journey_checkin_revision_images` (`image_id`);--> statement-breakpoint
CREATE INDEX `idx_on_journey_checkin_revision_id_79ea77d6c2` ON `journey_checkin_revision_images` (`journey_checkin_revision_id`);--> statement-breakpoint
CREATE TABLE `journey_checkin_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`checked_in_at` text NOT NULL,
	`created_at` text NOT NULL,
	`journey_checkin_id` integer NOT NULL,
	`note` text,
	`status` text DEFAULT 'recorded' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`journey_checkin_id`) REFERENCES `journey_checkins`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_journey_checkin_revisions_on_journey_checkin_id_and_id` ON `journey_checkin_revisions` (`journey_checkin_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_journey_checkin_revisions_on_journey_checkin_id` ON `journey_checkin_revisions` (`journey_checkin_id`);--> statement-breakpoint
CREATE INDEX `index_journey_checkin_revisions_on_user_id` ON `journey_checkin_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `journey_checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`checked_in_at` text NOT NULL,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`journey_id` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`name` text NOT NULL,
	`note` text,
	`pin_id` integer,
	`status` text DEFAULT 'recorded' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `journey_checkin_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pin_id`) REFERENCES `pins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_journey_checkins_on_journey_id_and_pin_id` ON `journey_checkins` (`journey_id`,`pin_id`);--> statement-breakpoint
CREATE INDEX `index_journey_checkins_on_current_revision_id` ON `journey_checkins` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_journey_checkins_on_pin_id` ON `journey_checkins` (`pin_id`);--> statement-breakpoint
CREATE TABLE `journeys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`encoded_path` text,
	`finished_at` text,
	`map_id` integer,
	`started_at` text,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_journeys_on_map_id` ON `journeys` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_journeys_on_user_id_and_map_id_and_finished_at` ON `journeys` (`user_id`,`map_id`,`finished_at`);--> statement-breakpoint
CREATE TABLE `map_revision_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`image_id` integer NOT NULL,
	`map_revision_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`map_revision_id`) REFERENCES `map_revisions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_map_revision_images_on_map_revision_id_and_image_id` ON `map_revision_images` (`map_revision_id`,`image_id`);--> statement-breakpoint
CREATE INDEX `index_map_revision_images_on_image_id` ON `map_revision_images` (`image_id`);--> statement-breakpoint
CREATE INDEX `index_map_revision_images_on_map_revision_id` ON `map_revision_images` (`map_revision_id`);--> statement-breakpoint
CREATE TABLE `map_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`description` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`map_id` integer NOT NULL,
	`name` text NOT NULL,
	`private` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_map_revisions_on_map_id_and_id` ON `map_revisions` (`map_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_map_revisions_on_map_id` ON `map_revisions` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_map_revisions_on_user_id` ON `map_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `maps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`base_id_val` text,
	`base_name` text,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`description` text NOT NULL,
	`invitable` integer DEFAULT false,
	`latitude` real DEFAULT 0 NOT NULL,
	`longitude` real DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`private` integer DEFAULT true,
	`shared` integer DEFAULT false,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `map_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_maps_on_current_revision_id` ON `maps` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_maps_on_status_and_created_at` ON `maps` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `index_maps_on_user_id` ON `maps` (`user_id`);--> statement-breakpoint
CREATE TABLE `maps_search_documents` (
	`map_id` integer PRIMARY KEY NOT NULL,
	`terms` text NOT NULL,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`journey_id` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`name` text NOT NULL,
	`pin_id` integer,
	`position` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pin_id`) REFERENCES `pins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_milestones_on_journey_id_and_pin_id` ON `milestones` (`journey_id`,`pin_id`);--> statement-breakpoint
CREATE INDEX `index_milestones_on_journey_id_and_position` ON `milestones` (`journey_id`,`position`);--> statement-breakpoint
CREATE INDEX `index_milestones_on_pin_id` ON `milestones` (`pin_id`);--> statement-breakpoint
CREATE TABLE `moderation_decisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_id` integer,
	`content_snapshot` text,
	`created_at` text NOT NULL,
	`moderatable_id` integer NOT NULL,
	`moderatable_type` text NOT NULL,
	`moderator_id` integer,
	`outcome` text NOT NULL,
	`reason` text NOT NULL,
	`reviewed_revision_id` integer,
	`staff_member_id` integer,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`moderator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_member_id`) REFERENCES `staff_members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_moderation_decisions_on_author_id` ON `moderation_decisions` (`author_id`);--> statement-breakpoint
CREATE INDEX `index_moderation_decisions_on_moderatable_and_time` ON `moderation_decisions` (`moderatable_type`,`moderatable_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `index_moderation_decisions_on_moderator_id` ON `moderation_decisions` (`moderator_id`);--> statement-breakpoint
CREATE INDEX `index_moderation_decisions_on_staff_member_id` ON `moderation_decisions` (`staff_member_id`);--> statement-breakpoint
CREATE TABLE `mutes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`muted_id` integer NOT NULL,
	`muter_id` integer NOT NULL,
	FOREIGN KEY (`muted_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `index_mutes_on_muted_id` ON `mutes` (`muted_id`);--> statement-breakpoint
CREATE INDEX `index_mutes_on_muter_id_and_muted_id` ON `mutes` (`muter_id`,`muted_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`key` text,
	`notifiable_id` integer,
	`notifiable_type` text,
	`notifier_id` integer,
	`notifier_type` text,
	`read` integer DEFAULT false,
	`recipient_id` integer,
	`recipient_type` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `index_notifications_on_notifiable_id_and_notifiable_type` ON `notifications` (`notifiable_id`,`notifiable_type`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_notifiable_type_and_notifiable_id` ON `notifications` (`notifiable_type`,`notifiable_id`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_notifier_id_and_notifier_type` ON `notifications` (`notifier_id`,`notifier_type`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_notifier_type_and_notifier_id` ON `notifications` (`notifier_type`,`notifier_id`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_recipient_id_and_recipient_type` ON `notifications` (`recipient_id`,`recipient_type`);--> statement-breakpoint
CREATE INDEX `index_notifications_on_recipient_type_and_recipient_id` ON `notifications` (`recipient_type`,`recipient_id`);--> statement-breakpoint
CREATE TABLE `pin_properties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`map_id` integer NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`multiple` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`current_revision_id` integer,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_revision_id`) REFERENCES `pin_property_revisions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `index_pin_properties_on_map_id` ON `pin_properties` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_pin_properties_on_current_revision_id` ON `pin_properties` (`current_revision_id`);--> statement-breakpoint
CREATE TABLE `pin_property_option_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pin_property_option_id` integer NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pin_property_option_id`) REFERENCES `pin_property_options`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `index_pin_property_option_revisions_on_pin_property_option_id` ON `pin_property_option_revisions` (`pin_property_option_id`);--> statement-breakpoint
CREATE INDEX `index_pin_property_option_revisions_on_user_id` ON `pin_property_option_revisions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_on_pin_property_option_id_id_cd060b3bcd` ON `pin_property_option_revisions` (`pin_property_option_id`,`id`);--> statement-breakpoint
CREATE TABLE `pin_property_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pin_property_id` integer NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`current_revision_id` integer,
	FOREIGN KEY (`pin_property_id`) REFERENCES `pin_properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_revision_id`) REFERENCES `pin_property_option_revisions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `index_pin_property_options_on_pin_property_id` ON `pin_property_options` (`pin_property_id`);--> statement-breakpoint
CREATE INDEX `index_pin_property_options_on_current_revision_id` ON `pin_property_options` (`current_revision_id`);--> statement-breakpoint
CREATE TABLE `pin_property_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pin_property_id` integer NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pin_property_id`) REFERENCES `pin_properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `index_pin_property_revisions_on_pin_property_id` ON `pin_property_revisions` (`pin_property_id`);--> statement-breakpoint
CREATE INDEX `index_pin_property_revisions_on_user_id` ON `pin_property_revisions` (`user_id`);--> statement-breakpoint
CREATE INDEX `index_pin_property_revisions_on_pin_property_id_and_id` ON `pin_property_revisions` (`pin_property_id`,`id`);--> statement-breakpoint
CREATE TABLE `pin_revision_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`image_id` integer NOT NULL,
	`pin_revision_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pin_revision_id`) REFERENCES `pin_revisions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_pin_revision_images_on_pin_revision_id_and_image_id` ON `pin_revision_images` (`pin_revision_id`,`image_id`);--> statement-breakpoint
CREATE INDEX `index_pin_revision_images_on_image_id` ON `pin_revision_images` (`image_id`);--> statement-breakpoint
CREATE INDEX `index_pin_revision_images_on_pin_revision_id` ON `pin_revision_images` (`pin_revision_id`);--> statement-breakpoint
CREATE TABLE `pin_revision_property_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pin_revision_id` integer NOT NULL,
	`pin_property_option_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`pin_revision_id`) REFERENCES `pin_revisions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pin_property_option_id`) REFERENCES `pin_property_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_on_pin_revision_id_pin_property_option_id_e17f1d524a` ON `pin_revision_property_options` (`pin_revision_id`,`pin_property_option_id`);--> statement-breakpoint
CREATE INDEX `index_pin_revision_property_options_on_pin_revision_id` ON `pin_revision_property_options` (`pin_revision_id`);--> statement-breakpoint
CREATE INDEX `index_pin_revision_property_options_on_pin_property_option_id` ON `pin_revision_property_options` (`pin_property_option_id`);--> statement-breakpoint
CREATE TABLE `pin_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`name` text NOT NULL,
	`pin_id` integer NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`pin_id`) REFERENCES `pins`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_pin_revisions_on_pin_id_and_id` ON `pin_revisions` (`pin_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_pin_revisions_on_pin_id` ON `pin_revisions` (`pin_id`);--> statement-breakpoint
CREATE INDEX `index_pin_revisions_on_user_id` ON `pin_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `pins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment` text NOT NULL,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`map_id` integer NOT NULL,
	`name` text NOT NULL,
	`spot_id` integer,
	`status` text DEFAULT 'published' NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `pin_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_pins_on_created_at` ON `pins` (`created_at`);--> statement-breakpoint
CREATE INDEX `index_pins_on_current_revision_id` ON `pins` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_pins_on_map_id` ON `pins` (`map_id`);--> statement-breakpoint
CREATE INDEX `index_pins_on_status_and_created_at` ON `pins` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `index_pins_on_user_id` ON `pins` (`user_id`);--> statement-breakpoint
CREATE TABLE `pins_search_documents` (
	`pin_id` integer PRIMARY KEY NOT NULL,
	`terms` text NOT NULL,
	FOREIGN KEY (`pin_id`) REFERENCES `pins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`content_snapshot` text,
	`created_at` text NOT NULL,
	`details` text,
	`locale` text NOT NULL,
	`moderatable_id` integer NOT NULL,
	`moderatable_type` text NOT NULL,
	`reported_revision_id` integer,
	`reporter_id` integer,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_reports_on_moderatable` ON `reports` (`moderatable_type`,`moderatable_id`);--> statement-breakpoint
CREATE INDEX `index_reports_on_reporter_id` ON `reports` (`reporter_id`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`permission` text NOT NULL,
	`role_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_role_permissions_on_role_id_and_permission` ON `role_permissions` (`role_id`,`permission`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`description` text,
	`name` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_roles_on_name` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `staff_member_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`role_id` integer NOT NULL,
	`staff_member_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_member_id`) REFERENCES `staff_members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_staff_member_roles_on_staff_member_id_and_role_id` ON `staff_member_roles` (`staff_member_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `index_staff_member_roles_on_role_id` ON `staff_member_roles` (`role_id`);--> statement-breakpoint
CREATE TABLE `staff_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`email` text NOT NULL,
	`revoked_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_staff_members_on_email` ON `staff_members` (`email`);--> statement-breakpoint
CREATE TABLE `unblocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`block_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_unblocks_on_block_id` ON `unblocks` (`block_id`);--> statement-breakpoint
CREATE TABLE `unmutes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`mute_id` integer NOT NULL,
	FOREIGN KEY (`mute_id`) REFERENCES `mutes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_unmutes_on_mute_id` ON `unmutes` (`mute_id`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	`web_push` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "user_preferences_web_push_json" CHECK(json_valid("user_preferences"."web_push"))
);
--> statement-breakpoint
CREATE INDEX `index_user_preferences_on_user_id` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`biography` text,
	`created_at` text NOT NULL,
	`name` text,
	`updated_at` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `index_user_revisions_on_user_id_and_id` ON `user_revisions` (`user_id`,`id`);--> statement-breakpoint
CREATE INDEX `index_user_revisions_on_user_id` ON `user_revisions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`biography` text,
	`created_at` text NOT NULL,
	`current_revision_id` integer,
	`email` text,
	`image_id` integer,
	`locale` text,
	`name` text,
	`uid` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`current_revision_id`) REFERENCES `user_revisions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_users_on_uid` ON `users` (`uid`);--> statement-breakpoint
CREATE INDEX `index_users_on_current_revision_id` ON `users` (`current_revision_id`);--> statement-breakpoint
CREATE INDEX `index_users_on_image_id` ON `users` (`image_id`);--> statement-breakpoint
CREATE TABLE `users_search_documents` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`terms` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`votable_id` integer,
	`votable_type` text,
	`vote_flag` integer,
	`vote_scope` text,
	`vote_weight` integer,
	`voter_id` integer,
	`voter_type` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `index_votes_on_votable_and_voter` ON `votes` (`votable_type`,`votable_id`,`voter_type`,`voter_id`);--> statement-breakpoint
CREATE INDEX `index_votes_on_votable_id_and_votable_type_and_vote_scope` ON `votes` (`votable_id`,`votable_type`,`vote_scope`);--> statement-breakpoint
CREATE INDEX `index_votes_on_votable_type_and_votable_id` ON `votes` (`votable_type`,`votable_id`);--> statement-breakpoint
CREATE INDEX `index_votes_on_voter_id_and_voter_type_and_vote_scope` ON `votes` (`voter_id`,`voter_type`,`vote_scope`);--> statement-breakpoint
CREATE INDEX `index_votes_on_voter_type_and_voter_id` ON `votes` (`voter_type`,`voter_id`);