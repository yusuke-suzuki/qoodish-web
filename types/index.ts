import type { SerializedEditorState } from 'lexical';

export type AutocompleteOption = {
  label: string;
  value: string;
};

export type PushNotification = {
  coauthor_invited: boolean;
  liked: boolean;
  comment: boolean;
};

export type ImageVariants = {
  url: string;
  avatar: string;
  card: string;
  hero: string;
  ogp: string;
};

export type Profile = {
  id: number;
  uid: string;
  name: string;
  biography: string;
  image: ImageVariants | null;
  maps_count: number;
  bookmarked_maps_count: number;
  reviews_count: number;
  push_notification: PushNotification;
};

export type Author = {
  id: number;
  name: string;
  biography: string;
  image: ImageVariants | null;
};

export type Comment = {
  id: number;
  review_id: number;
  author: Author;
  body: string;
  editable: boolean;
  liked: boolean;
  likes_count: number;
  created_at: string;
};

export type Image = ImageVariants & {
  id: number;
};

export type AppMap = {
  id: number;
  author: Author;
  name: string;
  description: string;
  private: boolean;
  latitude: number;
  longitude: number;
  bookmarking: boolean;
  bookmarkable: boolean;
  editable: boolean;
  image: ImageVariants | null;
  created_at: string;
  updated_at: string;
};

export type Coauthor = {
  id: number;
  name: string;
  image: ImageVariants | null;
  author: boolean;
  editable: boolean;
  created_at: string;
  updated_at: string;
};

export type CoauthorshipInvitation = {
  id: number;
  status: string;
  map: {
    id: number;
    name: string;
    description: string;
    image: ImageVariants | null;
  };
  inviter: Author;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: number;
  uid: string;
  name: string;
  biography: string;
  image: ImageVariants | null;
};

export type UserSearchResult = {
  id: number;
  name: string;
  image: ImageVariants | null;
  image_url: string;
};

export type Like = {
  id: number;
  voter: Author;
};

export type Review = {
  id: number;
  author: Author;
  name: string;
  comment: string;
  comments: Comment[];
  images: Image[];
  latitude: number;
  longitude: number;
  map: AppMap;
  editable: boolean;
  liked: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type Spot = {
  name: string;
  latitude: number;
  longitude: number;
};

export type Milestone = Spot & {
  id: number;
  review_id: number;
};

export type SpotAnchor = Spot & {
  review_id: number;
  checked_in_at: string | null;
};

export type MapRef = {
  id: number;
  name: string;
  private: boolean;
};

export type Chapter = {
  id: number;
  map_id: number | null;
  journey_id: number | null;
  title: string;
  status: 'draft' | 'published';
  content: SerializedEditorState;
  editable: boolean;
  author: Author;
  map: MapRef | null;
  created_at: string;
  updated_at: string;
};

export type JourneyCheckin = {
  id: number;
  review_id: number;
  spot: Spot;
  checked_in_at: string;
  images: Image[];
};

export type JourneyPathPoint = {
  latitude: number;
  longitude: number;
};

export type JourneySummary = {
  id: number;
  map_id: number | null;
  started_at: string | null;
  finished_at: string | null;
  milestones_count: number;
  checkins_count: number;
  chapter_id: number | null;
  map: MapRef | null;
  created_at: string;
  updated_at: string;
};

export type Journey = {
  id: number;
  map_id: number | null;
  started_at: string | null;
  finished_at: string | null;
  milestones: Milestone[];
  checkins: JourneyCheckin[];
  encoded_path: string | null;
  chapter_id: number | null;
  map: MapRef | null;
  created_at: string;
  updated_at: string;
};

export type Notifiable = {
  id: number;
  type: string;
  image: ImageVariants | null;
};

export type Notification = {
  id: number;
  key: string;
  click_action: string;
  notifiable: Notifiable;
  notifier: Author;
  read: boolean;
  created_at: string;
  updated_at: string;
};
