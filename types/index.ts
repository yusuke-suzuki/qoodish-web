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

export type PublicUser = {
  id: number;
  uid: string;
  name: string;
  biography: string;
  image: ImageVariants | null;
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
