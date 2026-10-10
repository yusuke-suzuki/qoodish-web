import type { IsoTimestamp } from './scalars.ts';
import type { UserSummary } from './users.ts';

export type JournalRef = {
  id: number;
  title: string;
};

export type Journal = {
  id: number;
  title: string;
  description: string | null;
  author: UserSummary;
  chapters_count: number;
  editable: boolean;
  bookmarking: boolean;
  created_at: IsoTimestamp;
  updated_at: IsoTimestamp;
};
