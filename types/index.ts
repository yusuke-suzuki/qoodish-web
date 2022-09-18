type PushNotification = {
  followed: boolean;
  invited: boolean;
  liked: boolean;
  comment: boolean;
};

export type Profile = {
  id: number;
  uid: string;
  email: string;
  name: string;
  biography: string;
  image_url: string;
  thumbnail_url: string;
  thumbnail_url_400: string;
  thumbnail_url_800: string;
  maps_count: number;
  following_maps_count: number;
  reviews_count: number;
  likes_count: number;
  push_notification: PushNotification;
};
