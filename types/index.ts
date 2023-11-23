export type AutocompleteOption = {
  label: string;
  value: string;
};

export type PushNotification = {
  followed: boolean;
  liked: boolean;
  comment: boolean;
};

export type Profile = {
  id: number;
  uid: string;
  name: string;
  biography: string;
  image_url: string;
  thumbnail_url: string;
  thumbnail_url_400: string;
  thumbnail_url_800: string;
  maps_count: number;
  following_maps_count: number;
  reviews_count: number;
  push_notification: PushNotification;
};

export type Author = {
  id: number;
  name: string;
  profile_image_url: string;
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

export type Image = {
  id: number;
  url: string;
  thumbnail_url: string;
  thumbnail_url_400: string;
  thumbnail_url_800: string;
};

export type AppMap = {
  id: number;
  owner: Author;
  name: string;
  description: string;
  private: boolean;
  latitude: number;
  longitude: number;
  liked: boolean;
  likes_count: number;
  following: boolean;
  followers_count: number;
  editable: boolean;
  postable: boolean;
  shared: boolean;
  invitable: boolean;
  thumbnail_url: string;
  thumbnail_url_400: string;
  thumbnail_url_800: string;
  created_at: string;
  updated_at: string;
};

export type Follower = {
  id: number;
  uid: string;
  name: string;
  profile_image_url: string;
  owner: boolean;
  editable: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: number;
  uid: string;
  name: string;
  biography: string;
  image_url: string;
  thubmnail_url: string;
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
  thumbnail_url: string;
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
