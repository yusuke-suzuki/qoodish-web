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

export const MODERATABLE_TYPES = [
  'Pin',
  'Comment',
  'Map',
  'Chapter',
  'Journal',
  'User'
] as const;

export type ModeratableType = (typeof MODERATABLE_TYPES)[number];

export const MODERATION_OUTCOMES = ['kept', 'removed', 'unavailable'] as const;

export type ModerationOutcome = (typeof MODERATION_OUTCOMES)[number];

export type ReportStatus = ModerationOutcome | 'pending';

export type Report = {
  id: number;
  category: ReportCategory;
  moderatable_type: ModeratableType;
  moderatable_id: number;
  reporter: { id: number; name: string } | null;
  created_at: string;
};

export type Decision = {
  id: number;
  outcome: ModerationOutcome;
  reason: string;
  moderator_email: string | null;
  created_at: string;
  reviewed_as_filed: boolean;
};

export type ReportDetail = Report & {
  status: ReportStatus;
  locale: string;
  details: string | null;
  evidence_url: string | null;
  content_snapshot: string | null;
  target_available: boolean;
  moderatable_parent: { type: 'Pin' | 'Chapter' | 'User'; id: number } | null;
  edited_since_filed: boolean;
  decisions: Decision[];
  other_pending_reports: Report[];
};

export type DecisionInput = {
  outcome: ModerationOutcome;
  reason: string;
};

const UNREMOVABLE_TYPES = new Set<ModeratableType>(['User', 'Journal']);

export function allowedOutcomes(
  moderatableType: ModeratableType,
  targetAvailable: boolean
): ModerationOutcome[] {
  if (!targetAvailable) {
    return ['unavailable'];
  }

  return UNREMOVABLE_TYPES.has(moderatableType)
    ? ['kept']
    : ['kept', 'removed'];
}

export function parseDecision(
  outcome: unknown,
  reason: unknown
): DecisionInput | null {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';

  if (
    !MODERATION_OUTCOMES.includes(outcome as ModerationOutcome) ||
    !trimmedReason
  ) {
    return null;
  }

  return { outcome: outcome as ModerationOutcome, reason: trimmedReason };
}

export function publicPath(
  report: Pick<
    ReportDetail,
    'moderatable_type' | 'moderatable_id' | 'moderatable_parent'
  >
): string | null {
  const { moderatable_type: type, moderatable_id: id } = report;

  switch (type) {
    case 'Pin':
      return `/pins/${id}`;
    case 'Map':
      return `/maps/${id}`;
    case 'Chapter':
      return `/chapters/${id}`;
    case 'User':
      return `/users/${id}`;
    case 'Journal':
    case 'Comment':
      return report.moderatable_parent
        ? publicPath({
            moderatable_type: report.moderatable_parent.type,
            moderatable_id: report.moderatable_parent.id,
            moderatable_parent: null
          })
        : null;
  }
}

export function httpUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}
