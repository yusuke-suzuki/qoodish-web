import type {
  ModeratableType,
  ModerationOutcome,
  ReportCategory,
  ReportDetail
} from '@qoodish/api-contract';

export type {
  Decision,
  ModeratableType,
  ModerationOutcome,
  Report,
  ReportCategory,
  ReportDetail,
  ReportStatus,
  ReviewedDecision
} from '@qoodish/api-contract';

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
] as const satisfies readonly ReportCategory[];

export const MODERATABLE_TYPES = [
  'Pin',
  'Comment',
  'Map',
  'Chapter',
  'Journal',
  'User'
] as const satisfies readonly ModeratableType[];

export const MODERATION_OUTCOMES = [
  'kept',
  'removed',
  'unavailable'
] as const satisfies readonly ModerationOutcome[];

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
