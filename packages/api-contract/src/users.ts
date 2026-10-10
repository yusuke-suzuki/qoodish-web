import type { ImageVariants } from './images.ts';

export type UserSummary = {
  id: number;
  name: string;
  image: ImageVariants | null;
  image_url: string;
};

export type ViewerRelation = {
  blocking: boolean;
  muting: boolean;
};

export type PostAuthor = UserSummary & ViewerRelation;

export type GuestChapterAuthor = UserSummary & {
  biography: string | null;
};

export type ChapterAuthor = GuestChapterAuthor & ViewerRelation;

export type WebPushPreferences = {
  coauthor_invited: boolean;
  liked: boolean;
  comment: boolean;
  published: boolean;
};

export type PreferencesUpdate = {
  web_push: WebPushPreferences;
};

export type PublicUser = {
  id: number;
  uid: string;
  name: string;
  biography: string | null;
  image: ImageVariants | null;
  image_url: string;
  maps_count: number;
  bookmarked_maps_count: number;
  pins_count: number;
};

export type Profile = PublicUser & {
  push_notification: WebPushPreferences;
};

export type UserProfile = PublicUser &
  ViewerRelation & {
    blocked_by: boolean;
  };

export type GuestUserProfile = {
  id: number;
  name: string;
  biography: string | null;
  image: ImageVariants | null;
  image_url: string;
  maps_count: number;
  bookmarked_maps_count: number;
  pins_count: number;
  likes_count: number;
};

export type ModeratedAccount = {
  id: number;
  name: string;
  biography: string | null;
  image: ImageVariants | null;
  image_url: string;
};

export type BlockedAccount = ModeratedAccount;

export type MutedAccount = ModeratedAccount;
