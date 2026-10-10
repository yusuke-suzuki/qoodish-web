import type { IsoTimestamp } from './scalars.ts';

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'sexual'
  | 'violence'
  | 'illegal'
  | 'privacy'
  | 'copyright'
  | 'impersonation'
  | 'other';

export type ModeratableType =
  | 'Pin'
  | 'Comment'
  | 'Map'
  | 'Chapter'
  | 'Journal'
  | 'User';

export type ModerationOutcome = 'kept' | 'removed' | 'unavailable';

export type ReportStatus = ModerationOutcome | 'pending';

export type ReportReceipt = {
  id: number;
  category: ReportCategory;
  status: ReportStatus;
  created_at: IsoTimestamp;
};
