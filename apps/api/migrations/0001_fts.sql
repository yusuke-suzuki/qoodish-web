CREATE VIRTUAL TABLE `maps_fts` USING fts5(`terms`, content='maps_search_documents', content_rowid='map_id', tokenize='unicode61');--> statement-breakpoint
CREATE TRIGGER `maps_search_documents_ai` AFTER INSERT ON `maps_search_documents` BEGIN
  INSERT INTO `maps_fts`(`rowid`, `terms`) VALUES (new.`map_id`, new.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `maps_search_documents_ad` AFTER DELETE ON `maps_search_documents` BEGIN
  INSERT INTO `maps_fts`(`maps_fts`, `rowid`, `terms`) VALUES ('delete', old.`map_id`, old.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `maps_search_documents_au` AFTER UPDATE ON `maps_search_documents` BEGIN
  INSERT INTO `maps_fts`(`maps_fts`, `rowid`, `terms`) VALUES ('delete', old.`map_id`, old.`terms`);
  INSERT INTO `maps_fts`(`rowid`, `terms`) VALUES (new.`map_id`, new.`terms`);
END;--> statement-breakpoint
CREATE VIRTUAL TABLE `pins_fts` USING fts5(`terms`, content='pins_search_documents', content_rowid='pin_id', tokenize='unicode61');--> statement-breakpoint
CREATE TRIGGER `pins_search_documents_ai` AFTER INSERT ON `pins_search_documents` BEGIN
  INSERT INTO `pins_fts`(`rowid`, `terms`) VALUES (new.`pin_id`, new.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `pins_search_documents_ad` AFTER DELETE ON `pins_search_documents` BEGIN
  INSERT INTO `pins_fts`(`pins_fts`, `rowid`, `terms`) VALUES ('delete', old.`pin_id`, old.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `pins_search_documents_au` AFTER UPDATE ON `pins_search_documents` BEGIN
  INSERT INTO `pins_fts`(`pins_fts`, `rowid`, `terms`) VALUES ('delete', old.`pin_id`, old.`terms`);
  INSERT INTO `pins_fts`(`rowid`, `terms`) VALUES (new.`pin_id`, new.`terms`);
END;--> statement-breakpoint
CREATE VIRTUAL TABLE `chapters_fts` USING fts5(`terms`, content='chapters_search_documents', content_rowid='chapter_id', tokenize='unicode61');--> statement-breakpoint
CREATE TRIGGER `chapters_search_documents_ai` AFTER INSERT ON `chapters_search_documents` BEGIN
  INSERT INTO `chapters_fts`(`rowid`, `terms`) VALUES (new.`chapter_id`, new.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `chapters_search_documents_ad` AFTER DELETE ON `chapters_search_documents` BEGIN
  INSERT INTO `chapters_fts`(`chapters_fts`, `rowid`, `terms`) VALUES ('delete', old.`chapter_id`, old.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `chapters_search_documents_au` AFTER UPDATE ON `chapters_search_documents` BEGIN
  INSERT INTO `chapters_fts`(`chapters_fts`, `rowid`, `terms`) VALUES ('delete', old.`chapter_id`, old.`terms`);
  INSERT INTO `chapters_fts`(`rowid`, `terms`) VALUES (new.`chapter_id`, new.`terms`);
END;--> statement-breakpoint
CREATE VIRTUAL TABLE `users_fts` USING fts5(`terms`, content='users_search_documents', content_rowid='user_id', tokenize='unicode61');--> statement-breakpoint
CREATE TRIGGER `users_search_documents_ai` AFTER INSERT ON `users_search_documents` BEGIN
  INSERT INTO `users_fts`(`rowid`, `terms`) VALUES (new.`user_id`, new.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `users_search_documents_ad` AFTER DELETE ON `users_search_documents` BEGIN
  INSERT INTO `users_fts`(`users_fts`, `rowid`, `terms`) VALUES ('delete', old.`user_id`, old.`terms`);
END;--> statement-breakpoint
CREATE TRIGGER `users_search_documents_au` AFTER UPDATE ON `users_search_documents` BEGIN
  INSERT INTO `users_fts`(`users_fts`, `rowid`, `terms`) VALUES ('delete', old.`user_id`, old.`terms`);
  INSERT INTO `users_fts`(`rowid`, `terms`) VALUES (new.`user_id`, new.`terms`);
END;
