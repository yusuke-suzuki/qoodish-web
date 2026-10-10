import type { ImageVariants } from './images.ts';
import type { IsoTimestamp } from './scalars.ts';
import type { PostAuthor, UserSummary } from './users.ts';

export type MapRef = {
  id: number;
  name: string;
  private: boolean;
};

type MapAttributes = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  private: boolean;
  image: ImageVariants | null;
  image_url: string;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type AppMap = MapAttributes & {
  author: PostAuthor;
  bookmarking: boolean;
  editable: boolean;
  bookmarkable: boolean;
};

export type GuestMap = MapAttributes & {
  author: UserSummary;
  bookmarking: false;
  editable: false;
  bookmarkable: false;
};
