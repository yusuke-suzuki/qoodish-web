import type {
  Decision,
  ModeratableType,
  ModerationOutcome
} from '@qoodish/api-contract';
import { and, asc, desc, eq, gte, lt, lte, or, sql } from 'drizzle-orm';
import { currentTimestamp, type Database, scalar } from './db/client.ts';
import { moderationDecisions, reports, users } from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { enqueueMails, type MailMessage } from './mail.ts';
import {
  contentSnapshot,
  type ModeratableContent,
  moderatableContent,
  moderatableType
} from './reports.ts';
import { first, present } from './routing.ts';
import type { ActingStaffMember } from './staff-members.ts';

export const MODERATION_OUTCOMES = [
  'kept',
  'removed',
  'unavailable'
] as const satisfies readonly ModerationOutcome[];

const UNREMOVABLE_TYPES: readonly ModeratableType[] = ['User', 'Journal'];

function refusals(
  type: ModeratableType | undefined,
  target: ModeratableContent | undefined,
  outcome: ModerationOutcome | undefined,
  reason: string | undefined
): MessageKey[] {
  const keys: MessageKey[] = [];

  if (outcome === undefined) {
    keys.push('decision_outcome_invalid');
  }

  if (!present(reason)) {
    keys.push('decision_reason_required');
  }

  if (outcome !== 'unavailable' && target === undefined) {
    keys.push('decision_target_gone');
  }

  if (outcome === 'unavailable' && target !== undefined) {
    keys.push('decision_target_present');
  }

  if (
    outcome === 'removed' &&
    type !== undefined &&
    UNREMOVABLE_TYPES.includes(type)
  ) {
    keys.push('decision_type_unremovable');
  }

  return keys;
}

function answeredReports(
  db: Database,
  decision: {
    id: number;
    moderatableType: string;
    moderatableId: number;
    createdAt: string;
  }
) {
  const onTarget = and(
    eq(moderationDecisions.moderatableType, decision.moderatableType),
    eq(moderationDecisions.moderatableId, decision.moderatableId)
  );
  const previous = db
    .select({ createdAt: moderationDecisions.createdAt })
    .from(moderationDecisions)
    .where(
      and(
        onTarget,
        or(
          lt(moderationDecisions.createdAt, decision.createdAt),
          and(
            eq(moderationDecisions.createdAt, decision.createdAt),
            lt(moderationDecisions.id, decision.id)
          )
        )
      )
    )
    .orderBy(desc(moderationDecisions.createdAt), desc(moderationDecisions.id))
    .limit(1);

  return db
    .select({ id: reports.id, reporterEmail: users.email })
    .from(reports)
    .leftJoin(users, eq(users.id, reports.reporterId))
    .where(
      and(
        eq(reports.moderatableType, decision.moderatableType),
        eq(reports.moderatableId, decision.moderatableId),
        lte(reports.createdAt, decision.createdAt),
        gte(reports.createdAt, sql`coalesce(${scalar(previous)}, '')`)
      )
    )
    .orderBy(asc(reports.createdAt), asc(reports.id));
}

export async function decideReport(
  db: Database,
  queue: Queue<MailMessage>,
  staffMember: ActingStaffMember,
  input: {
    reportId: number;
    outcome: ModerationOutcome | undefined;
    reason: string | undefined;
  }
): Promise<Decision> {
  const report = first(
    await db
      .select({
        moderatableType: reports.moderatableType,
        moderatableId: reports.moderatableId,
        contentSnapshot: reports.contentSnapshot,
        reportedRevisionId: reports.reportedRevisionId
      })
      .from(reports)
      .where(eq(reports.id, input.reportId))
  );
  const type = moderatableType(report.moderatableType);
  const target =
    type &&
    (await moderatableContent(db, type, report.moderatableId, undefined));
  const { outcome, reason } = input;
  const refused = refusals(type, target, outcome, reason);

  if (refused.length > 0 || outcome === undefined || reason === undefined) {
    throw ApiError.invalid(refused);
  }

  const reviewed =
    target && outcome !== 'unavailable'
      ? {
          authorId: scalar(
            db
              .select({ id: users.id })
              .from(users)
              .where(eq(users.id, target.authorId))
          ),
          contentSnapshot: contentSnapshot(target),
          reviewedRevisionId: target.currentRevisionId
        }
      : {
          authorId: null,
          contentSnapshot: report.contentSnapshot,
          reviewedRevisionId: report.reportedRevisionId
        };
  const recorded = first(
    await db
      .insert(moderationDecisions)
      .values({
        ...reviewed,
        moderatableType: report.moderatableType,
        moderatableId: report.moderatableId,
        outcome,
        reason,
        staffMemberId: staffMember.id,
        createdAt: currentTimestamp()
      })
      .returning({
        id: moderationDecisions.id,
        createdAt: moderationDecisions.createdAt
      })
  );
  const [answered, author] = await db.batch([
    answeredReports(db, { ...report, ...recorded }),
    db
      .select({ email: users.email })
      .from(moderationDecisions)
      .innerJoin(users, eq(users.id, moderationDecisions.authorId))
      .where(eq(moderationDecisions.id, recorded.id))
  ]);

  await enqueueMails(queue, [
    ...answered
      .filter((row) => present(row.reporterEmail))
      .map(
        (row): MailMessage => ({
          mail: 'decision_notified',
          reportId: row.id,
          decisionId: recorded.id
        })
      ),
    ...(outcome === 'removed' && present(author[0]?.email)
      ? [{ mail: 'content_removed' as const, decisionId: recorded.id }]
      : [])
  ]);

  return {
    id: recorded.id,
    outcome,
    reason,
    moderator_email: staffMember.email,
    created_at: recorded.createdAt
  };
}
