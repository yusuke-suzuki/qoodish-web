import type {
  ModeratableType,
  ModerationOutcome,
  ReportCategory,
  ReportStatus
} from './reports.ts';
import type { IsoTimestamp } from './scalars.ts';

export type Report = {
  id: number;
  category: ReportCategory;
  moderatable_type: ModeratableType;
  moderatable_id: number;
  reporter: { id: number; name: string } | null;
  created_at: IsoTimestamp;
};

export type Decision = {
  id: number;
  outcome: ModerationOutcome;
  reason: string;
  moderator_email: string | null;
  created_at: IsoTimestamp;
};

export type ReviewedDecision = Decision & {
  reviewed_as_filed: boolean;
};

export type ModeratableParent = {
  type: 'Pin' | 'Chapter' | 'User';
  id: number;
};

export type ReportDetail = Report & {
  status: ReportStatus;
  locale: string;
  details: string | null;
  content_snapshot: string | null;
  target_available: boolean;
  moderatable_parent: ModeratableParent | null;
  edited_since_filed: boolean;
  decisions: ReviewedDecision[];
  other_pending_reports: Report[];
};

export type StaffRole = {
  id: number;
  name: string;
};

export type StaffMember = {
  id: number;
  email: string;
  revoked_at: IsoTimestamp | null;
  roles: StaffRole[];
};

export type Role = StaffRole & {
  description: string | null;
  permissions: string[];
};
