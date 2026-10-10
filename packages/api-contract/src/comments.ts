import type { IsoTimestamp } from './scalars.ts';
import type { UserSummary } from './users.ts';

type CommentAttributes = {
  id: number;
  author: UserSummary;
  body: string;
  likes_count: number;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type Comment = CommentAttributes & {
  liked: boolean;
};

export type GuestComment = CommentAttributes;

export type PinComment = Comment & {
  pin_id: number;
};

export type GuestPinComment = GuestComment & {
  pin_id: number;
};

export type ChapterComment = Comment & {
  editable: boolean;
};
