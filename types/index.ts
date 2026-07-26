import type { SerializedEditorState } from 'lexical';

export type AutocompleteOption = {
  label: string;
  value: string;
};

export type PushNotification = {
  coauthor_invited: boolean;
  liked: boolean;
  comment: boolean;
  published: boolean;
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

export type MapRef = {
  id: number;
  name: string;
  private: boolean;
};

export type JournalRef = {
  id: number;
  title: string;
};

export type Journal = {
  id: number;
  title: string;
  description: string;
  author: {
    id: number;
    name: string;
    image: ImageVariants | null;
    image_url: string;
  };
  chapters_count: number;
  editable: boolean;
  bookmarking: boolean;
  created_at: string;
  updated_at: string;
};

export type PointGeometry = {
  type: 'Point';
  coordinates: [number, number];
};

// Property names follow the simplestyle spec, so a chapter's map opens with
// its labels intact in other GeoJSON tools.
export type MapFeatureProperties = {
  title?: string;
  description?: string;
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

export type Chapter = {
  id: number;
  map_id: number | null;
  journey_id: number | null;
  title: string;
  status: 'draft' | 'published';
  content: SerializedEditorState;
  map_features: MapFeatureCollection;
  image: ImageVariants | null;
  editable: boolean;
  author: Author;
  map: MapRef | null;
  journal: JournalRef | null;
  liked: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type JourneyCheckin = {
  id: number;
  review_id: number;
  spot: Spot;
  checked_in_at: string;
  note: string | null;
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
