import type {
  ModeratableType,
  ModerationOutcome,
  ReportCategory,
  ReportStatus
} from '../reports.ts';

export type Dictionary = {
  appName: string;
  pendingReports: string;
  noPendingReports: string;
  report: (id: number) => string;
  backToReports: string;
  switchLanguage: string;
  categoryLabel: string;
  categories: Record<ReportCategory, string>;
  types: Record<ModeratableType, string>;
  statuses: Record<ReportStatus, string>;
  outcomes: Record<ModerationOutcome, string>;
  target: string;
  openTarget: string;
  targetGone: string;
  editedSinceFiled: string;
  reporter: string;
  deletedReporter: string;
  filedAt: string;
  reporterLanguage: string;
  languages: Record<string, string>;
  details: string;
  snapshot: string;
  none: string;
  otherPendingReports: string;
  decisionHistory: string;
  noDecisions: string;
  reviewedOtherRevision: string;
  systemModerator: string;
  decision: string;
  decisionScope: string;
  reason: string;
  reasonHelp: string;
  recordDecision: string;
  decisionRecorded: (id: number) => string;
  invalidDecision: string;
  notFound: string;
  forbidden: string;
  apiUnavailable: string;
  navReports: string;
  navStaff: string;
  staffMembers: string;
  noStaffMembers: string;
  grantRole: string;
  grantRoleHelp: string;
  email: string;
  role: string;
  chooseRole: string;
  grant: string;
  invalidGrant: string;
  roles: string;
  noRoles: string;
  permissions: Record<string, string>;
  remove: string;
  removeRole: (role: string) => string;
  revoke: string;
  revoked: string;
  staffUpdated: (email: string) => string;
};
