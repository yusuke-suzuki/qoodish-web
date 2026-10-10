import type { ImageVariants } from './images.ts';
import type { IsoTimestamp } from './scalars.ts';
import type { UserSummary } from './users.ts';

export type NotificationKey =
  | 'coauthor_invited'
  | 'liked'
  | 'comment'
  | 'published';

export type NotifiableType = 'pin' | 'map' | 'comment' | 'chapter';

export type Notifiable = {
  id: number;
  type: NotifiableType;
  image: ImageVariants | null;
  image_url: string;
};

export type Notification = {
  id: number;
  key: NotificationKey;
  click_action: string;
  notifiable: Notifiable;
  notifier: UserSummary;
  read: boolean;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type NotificationGroup = Notification & {
  notifiers: UserSummary[];
  notifiers_count: number;
};
