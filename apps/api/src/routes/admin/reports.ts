import type {
  Decision,
  ModeratableParent,
  ModeratableType,
  Report,
  ReportCategory,
  ReportDetail,
  ReviewedDecision
} from '@qoodish/api-contract';
import { and, asc, eq, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../../db/client.ts';
import {
  chapters,
  comments,
  journals,
  maps,
  moderationDecisions,
  pins,
  reports,
  staffMembers,
  users
} from '../../db/schema.ts';
import {
  requireStaffPermission,
  type StaffEnv
} from '../../middleware/require-staff-permission.ts';
import {
  decideReport,
  MODERATION_OUTCOMES
} from '../../moderation-decisions.ts';
import { moderatableType, pendingReport } from '../../reports.ts';
import { first } from '../../routing.ts';
import { withoutCarriageReturns } from '../../text.ts';
import { id, jsonBody, pathParams } from '../../validation.ts';

type ModerationTarget = {
  currentRevisionId: number | null;
  parent: ModeratableParent | null;
};

const reportSummary = {
  id: reports.id,
  category: reports.category,
  moderatableType: reports.moderatableType,
  moderatableId: reports.moderatableId,
  createdAt: reports.createdAt,
  reporterId: reports.reporterId,
  reporterName: users.name
};

function summaries(db: Database) {
  return db
    .select(reportSummary)
    .from(reports)
    .leftJoin(users, eq(users.id, reports.reporterId))
    .$dynamic();
}

function reportJson(row: {
  id: number;
  category: string;
  moderatableType: string;
  moderatableId: number;
  createdAt: string;
  reporterId: number | null;
  reporterName: string | null;
}): Report {
  return {
    id: row.id,
    category: row.category as ReportCategory,
    moderatable_type: row.moderatableType as ModeratableType,
    moderatable_id: row.moderatableId,
    reporter:
      row.reporterId === null
        ? null
        : { id: row.reporterId, name: row.reporterName },
    created_at: row.createdAt
  };
}

async function revisionOf(
  db: Database,
  table: typeof pins | typeof maps | typeof chapters | typeof users,
  targetId: number
): Promise<ModerationTarget | undefined> {
  const [row] = await db
    .select({ currentRevisionId: table.currentRevisionId })
    .from(table)
    .where(eq(table.id, targetId));

  return row && { currentRevisionId: row.currentRevisionId, parent: null };
}

async function commentTarget(
  db: Database,
  targetId: number
): Promise<ModerationTarget | undefined> {
  const [comment] = await db
    .select({
      currentRevisionId: comments.currentRevisionId,
      pinId: pins.id,
      chapterId: chapters.id
    })
    .from(comments)
    .leftJoin(
      pins,
      and(
        eq(comments.commentableType, 'Pin'),
        eq(pins.id, comments.commentableId)
      )
    )
    .leftJoin(
      chapters,
      and(
        eq(comments.commentableType, 'Chapter'),
        eq(chapters.id, comments.commentableId)
      )
    )
    .where(eq(comments.id, targetId));

  if (!comment) {
    return undefined;
  }

  const parent: ModeratableParent | null =
    comment.pinId !== null
      ? { type: 'Pin', id: comment.pinId }
      : comment.chapterId !== null
        ? { type: 'Chapter', id: comment.chapterId }
        : null;

  return { currentRevisionId: comment.currentRevisionId, parent };
}

async function journalTarget(
  db: Database,
  targetId: number
): Promise<ModerationTarget | undefined> {
  const [journal] = await db
    .select({
      currentRevisionId: journals.currentRevisionId,
      userId: journals.userId
    })
    .from(journals)
    .where(eq(journals.id, targetId));

  return (
    journal && {
      currentRevisionId: journal.currentRevisionId,
      parent: { type: 'User', id: journal.userId }
    }
  );
}

function moderationTarget(
  db: Database,
  type: string,
  targetId: number
): Promise<ModerationTarget | undefined> {
  switch (moderatableType(type)) {
    case 'Pin':
      return revisionOf(db, pins, targetId);
    case 'Map':
      return revisionOf(db, maps, targetId);
    case 'Chapter':
      return revisionOf(db, chapters, targetId);
    case 'User':
      return revisionOf(db, users, targetId);
    case 'Comment':
      return commentTarget(db, targetId);
    case 'Journal':
      return journalTarget(db, targetId);
    case undefined:
      return Promise.resolve(undefined);
  }
}

const decisionBody = z.object({
  outcome: z.enum(MODERATION_OUTCOMES).optional().catch(undefined),
  reason: z
    .string()
    .overwrite(withoutCarriageReturns)
    .optional()
    .catch(undefined)
});

const app = new Hono<StaffEnv>();

app.get('/', requireStaffPermission('read_reports'), async (c) => {
  const db = c.get('db');
  const rows = await summaries(db)
    .where(pendingReport(db))
    .orderBy(asc(reports.createdAt), asc(reports.id));

  return c.json<Report[]>(rows.map(reportJson));
});

app.get(
  '/:id',
  requireStaffPermission('read_reports'),
  pathParams(z.object({ id })),
  async (c) => {
    const db = c.get('db');
    const report = first(
      await db
        .select({
          ...reportSummary,
          locale: reports.locale,
          details: reports.details,
          contentSnapshot: reports.contentSnapshot,
          reportedRevisionId: reports.reportedRevisionId
        })
        .from(reports)
        .leftJoin(users, eq(users.id, reports.reporterId))
        .where(eq(reports.id, c.req.valid('param').id))
    );
    const onTarget = (table: typeof reports | typeof moderationDecisions) =>
      and(
        eq(table.moderatableType, report.moderatableType),
        eq(table.moderatableId, report.moderatableId)
      );
    const [[decisions, others], target] = await Promise.all([
      db.batch([
        db
          .select({
            id: moderationDecisions.id,
            outcome: moderationDecisions.outcome,
            reason: moderationDecisions.reason,
            moderatorEmail: staffMembers.email,
            createdAt: moderationDecisions.createdAt,
            reviewedRevisionId: moderationDecisions.reviewedRevisionId
          })
          .from(moderationDecisions)
          .leftJoin(
            staffMembers,
            eq(staffMembers.id, moderationDecisions.staffMemberId)
          )
          .where(onTarget(moderationDecisions))
          .orderBy(
            asc(moderationDecisions.createdAt),
            asc(moderationDecisions.id)
          ),
        summaries(db)
          .where(
            and(onTarget(reports), ne(reports.id, report.id), pendingReport(db))
          )
          .orderBy(asc(reports.createdAt), asc(reports.id))
      ]),
      moderationTarget(db, report.moderatableType, report.moderatableId)
    ]);
    const decision = decisions.find(
      (candidate) => candidate.createdAt >= report.createdAt
    );

    return c.json<ReportDetail>({
      ...reportJson(report),
      status: (decision?.outcome as ReportDetail['status']) ?? 'pending',
      locale: report.locale,
      details: report.details,
      content_snapshot: report.contentSnapshot,
      target_available: target !== undefined,
      moderatable_parent: target?.parent ?? null,
      edited_since_filed:
        target !== undefined &&
        report.reportedRevisionId !== null &&
        target.currentRevisionId !== report.reportedRevisionId,
      decisions: decisions.map(
        (row): ReviewedDecision => ({
          id: row.id,
          outcome: row.outcome as ReviewedDecision['outcome'],
          reason: row.reason,
          moderator_email: row.moderatorEmail,
          created_at: row.createdAt,
          reviewed_as_filed:
            report.reportedRevisionId !== null &&
            row.reviewedRevisionId === report.reportedRevisionId
        })
      ),
      other_pending_reports: others.map(reportJson)
    });
  }
);

app.post(
  '/:reportId/decision',
  requireStaffPermission('decide_reports'),
  pathParams(z.object({ reportId: id })),
  jsonBody(decisionBody),
  async (c) => {
    const body = c.req.valid('json');

    return c.json<Decision>(
      await decideReport(c.get('db'), c.env.MAIL_QUEUE, c.get('staffMember'), {
        reportId: c.req.valid('param').reportId,
        outcome: body.outcome,
        reason: body.reason
      }),
      201
    );
  }
);

export default app;
