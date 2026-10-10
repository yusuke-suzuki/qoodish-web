DROP TABLE `maps_fts`;--> statement-breakpoint
DROP TABLE `pins_fts`;--> statement-breakpoint
DROP TABLE `chapters_fts`;--> statement-breakpoint
DROP TABLE `users_fts`;--> statement-breakpoint
DROP TABLE `chapters_search_documents`;--> statement-breakpoint
DROP TABLE `maps_search_documents`;--> statement-breakpoint
DROP TABLE `pins_search_documents`;--> statement-breakpoint
DROP TABLE `users_search_documents`;--> statement-breakpoint
ALTER TABLE `chapters` ADD `content_text` text;--> statement-breakpoint
CREATE VIRTUAL TABLE `maps_fts` USING fts5(`name`, `description`, content='maps', content_rowid='id', tokenize='trigram');--> statement-breakpoint
CREATE TRIGGER `maps_fts_ai` AFTER INSERT ON `maps` BEGIN
  INSERT INTO `maps_fts`(`rowid`, `name`, `description`) VALUES (new.`id`, new.`name`, new.`description`);
END;--> statement-breakpoint
CREATE TRIGGER `maps_fts_ad` AFTER DELETE ON `maps` BEGIN
  INSERT INTO `maps_fts`(`maps_fts`, `rowid`, `name`, `description`) VALUES ('delete', old.`id`, old.`name`, old.`description`);
END;--> statement-breakpoint
CREATE TRIGGER `maps_fts_au` AFTER UPDATE OF `name`, `description` ON `maps` BEGIN
  INSERT INTO `maps_fts`(`maps_fts`, `rowid`, `name`, `description`) VALUES ('delete', old.`id`, old.`name`, old.`description`);
  INSERT INTO `maps_fts`(`rowid`, `name`, `description`) VALUES (new.`id`, new.`name`, new.`description`);
END;--> statement-breakpoint
INSERT INTO `maps_fts`(`maps_fts`) VALUES ('rebuild');--> statement-breakpoint
CREATE VIRTUAL TABLE `pins_fts` USING fts5(`name`, `comment`, content='pins', content_rowid='id', tokenize='trigram');--> statement-breakpoint
CREATE TRIGGER `pins_fts_ai` AFTER INSERT ON `pins` BEGIN
  INSERT INTO `pins_fts`(`rowid`, `name`, `comment`) VALUES (new.`id`, new.`name`, new.`comment`);
END;--> statement-breakpoint
CREATE TRIGGER `pins_fts_ad` AFTER DELETE ON `pins` BEGIN
  INSERT INTO `pins_fts`(`pins_fts`, `rowid`, `name`, `comment`) VALUES ('delete', old.`id`, old.`name`, old.`comment`);
END;--> statement-breakpoint
CREATE TRIGGER `pins_fts_au` AFTER UPDATE OF `name`, `comment` ON `pins` BEGIN
  INSERT INTO `pins_fts`(`pins_fts`, `rowid`, `name`, `comment`) VALUES ('delete', old.`id`, old.`name`, old.`comment`);
  INSERT INTO `pins_fts`(`rowid`, `name`, `comment`) VALUES (new.`id`, new.`name`, new.`comment`);
END;--> statement-breakpoint
INSERT INTO `pins_fts`(`pins_fts`) VALUES ('rebuild');--> statement-breakpoint
CREATE VIRTUAL TABLE `chapters_fts` USING fts5(`title`, `content_text`, content='chapters', content_rowid='id', tokenize='trigram');--> statement-breakpoint
CREATE TRIGGER `chapters_fts_ai` AFTER INSERT ON `chapters` BEGIN
  INSERT INTO `chapters_fts`(`rowid`, `title`, `content_text`) VALUES (new.`id`, new.`title`, new.`content_text`);
END;--> statement-breakpoint
CREATE TRIGGER `chapters_fts_ad` AFTER DELETE ON `chapters` BEGIN
  INSERT INTO `chapters_fts`(`chapters_fts`, `rowid`, `title`, `content_text`) VALUES ('delete', old.`id`, old.`title`, old.`content_text`);
END;--> statement-breakpoint
CREATE TRIGGER `chapters_fts_au` AFTER UPDATE OF `title`, `content_text` ON `chapters` BEGIN
  INSERT INTO `chapters_fts`(`chapters_fts`, `rowid`, `title`, `content_text`) VALUES ('delete', old.`id`, old.`title`, old.`content_text`);
  INSERT INTO `chapters_fts`(`rowid`, `title`, `content_text`) VALUES (new.`id`, new.`title`, new.`content_text`);
END;--> statement-breakpoint
INSERT INTO `chapters_fts`(`chapters_fts`) VALUES ('rebuild');--> statement-breakpoint
CREATE VIRTUAL TABLE `users_fts` USING fts5(`name`, content='users', content_rowid='id', tokenize='trigram');--> statement-breakpoint
CREATE TRIGGER `users_fts_ai` AFTER INSERT ON `users` BEGIN
  INSERT INTO `users_fts`(`rowid`, `name`) VALUES (new.`id`, new.`name`);
END;--> statement-breakpoint
CREATE TRIGGER `users_fts_ad` AFTER DELETE ON `users` BEGIN
  INSERT INTO `users_fts`(`users_fts`, `rowid`, `name`) VALUES ('delete', old.`id`, old.`name`);
END;--> statement-breakpoint
CREATE TRIGGER `users_fts_au` AFTER UPDATE OF `name` ON `users` BEGIN
  INSERT INTO `users_fts`(`users_fts`, `rowid`, `name`) VALUES ('delete', old.`id`, old.`name`);
  INSERT INTO `users_fts`(`rowid`, `name`) VALUES (new.`id`, new.`name`);
END;--> statement-breakpoint
INSERT INTO `users_fts`(`users_fts`) VALUES ('rebuild');
