import type { GuestPinComment, PinComment } from './comments.ts';
import type { Image } from './images.ts';
import type { MapRef } from './maps.ts';
import type { IsoTimestamp } from './scalars.ts';
import type { PostAuthor, UserSummary } from './users.ts';

type PinAttributes = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  comment: string;
  images: Image[];
  property_option_ids: number[];
  map: MapRef;
  likes_count: number;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type Pin = PinAttributes & {
  author: PostAuthor;
  comments: PinComment[];
  editable: boolean;
  liked: boolean;
};

export type GuestPin = PinAttributes & {
  author: UserSummary;
  comments: GuestPinComment[];
};
