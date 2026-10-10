import type { ImageVariants } from './images.ts';
import type { IsoTimestamp } from './scalars.ts';
import type { UserSummary } from './users.ts';

export type GuestCoauthor = UserSummary & {
  author: boolean;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};

export type Coauthor = GuestCoauthor & {
  editable: boolean;
};

export type CoauthorshipInvitationStatus = 'pending' | 'accepted' | 'declined';

export type CoauthorshipInvitation = {
  id: number;
  map: {
    id: number;
    name: string;
    description: string;
    image: ImageVariants | null;
    image_url: string;
  };
  inviter: UserSummary;
  status: CoauthorshipInvitationStatus;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};
