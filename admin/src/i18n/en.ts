import type { Dictionary } from './dictionary.ts';

export const en: Dictionary = {
  appName: 'Qoodish Admin',
  pendingReports: 'Pending reports',
  noPendingReports: 'No reports are waiting for a decision.',
  report: (id) => `Report #${id}`,
  backToReports: 'Back to pending reports',
  switchLanguage: '日本語',
  categoryLabel: 'Reason for the report',
  categories: {
    spam: 'Spam or advertising',
    harassment: 'Harassment or bullying',
    hate: 'Hate speech or discrimination',
    sexual: 'Sexual content',
    violence: 'Violent or graphic content',
    illegal: 'Illegal activity or content',
    privacy: 'Privacy violation or defamation',
    copyright: 'Copyright or trademark infringement',
    impersonation: 'Impersonation',
    other: 'Something else'
  },
  types: {
    Pin: 'Pin',
    Comment: 'Comment',
    Map: 'Map',
    Chapter: 'Chapter',
    Journal: 'Journal',
    User: 'Account'
  },
  statuses: {
    pending: 'Pending',
    kept: 'Kept',
    removed: 'Removed',
    unavailable: 'Closed as gone'
  },
  outcomes: {
    kept: 'Keep the content',
    removed: 'Remove the content',
    unavailable: 'Close because the content is gone'
  },
  target: 'Content',
  openTarget: 'Open the content',
  targetGone: 'The reported content no longer exists.',
  editedSinceFiled:
    'The content was edited after this report was filed. The snapshot below shows it as reported.',
  reporter: 'Reporter',
  deletedReporter: 'Deleted account',
  filedAt: 'Filed at',
  reporterLanguage: "Reporter's language",
  languages: { en: 'English', ja: 'Japanese' },
  details: 'Details',
  snapshot: 'Content at the time of the report',
  none: 'None',
  otherPendingReports: 'Other pending reports on this content',
  decisionHistory: 'Decision history',
  noDecisions: 'No decisions yet.',
  reviewedOtherRevision: 'Decided on a different revision',
  systemModerator: 'System',
  decision: 'Decision',
  decisionScope: 'The decision answers every pending report on this content.',
  reason: 'Reason',
  reasonHelp:
    'Sent as written to the reporters, and to the author when the content is removed.',
  recordDecision: 'Record decision',
  decisionRecorded: (id) => `Recorded the decision on report #${id}.`,
  invalidDecision: 'Choose a decision and enter a reason.',
  notFound: 'Not found.',
  forbidden: 'You do not have permission to do this.',
  apiUnavailable: 'The API could not be reached. Try again later.'
};
