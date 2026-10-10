import type { ImageVariants } from './images.ts';
import type { JournalRef } from './journals.ts';
import type { MapRef } from './maps.ts';
import type { IsoTimestamp } from './scalars.ts';
import type { ChapterAuthor, GuestChapterAuthor } from './users.ts';

export type ChapterStatus = 'draft' | 'published';

export type ChapterContent = {
  root: Record<string, unknown>;
  [key: string]: unknown;
};

export type PointGeometry = {
  type: 'Point';
  coordinates: [number, number];
};

export type MapFeatureProperties = {
  title?: string | null;
  description?: string | null;
  [key: string]: unknown;
};

export type MapFeature = {
  type: 'Feature';
  geometry: PointGeometry;
  properties: MapFeatureProperties | null;
};

export type MapFeatureCollection = {
  type: 'FeatureCollection';
  features: MapFeature[];
};

type ChapterAttributes<Content> = {
  id: number;
  journey_id: number | null;
  title: string;
  status: ChapterStatus;
  content: Content;
  map_features: MapFeatureCollection;
  image: ImageVariants | null;
  image_url: string;
  journal: JournalRef | null;
  likes_count: number;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type Chapter<Content = ChapterContent> = ChapterAttributes<Content> & {
  map_id: number | null;
  author: ChapterAuthor;
  map: MapRef | null;
  editable: boolean;
  liked: boolean;
};

export type ChapterDetail<Content = ChapterContent> = Chapter<Content> & {
  comments_count: number;
};

export type GuestChapter<Content = ChapterContent> =
  ChapterAttributes<Content> & {
    map_id: number;
    author: GuestChapterAuthor;
    map: MapRef;
  };

export type GuestChapterDetail<Content = ChapterContent> =
  GuestChapter<Content> & {
    comments_count: number;
  };
