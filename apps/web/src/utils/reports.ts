export type ModeratableType = 'Pin' | 'Comment' | 'Map' | 'Chapter' | 'User';

export const REPORT_CATEGORIES = [
  'spam',
  'harassment',
  'hate',
  'sexual',
  'violence',
  'illegal',
  'privacy',
  'copyright',
  'impersonation',
  'other'
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
