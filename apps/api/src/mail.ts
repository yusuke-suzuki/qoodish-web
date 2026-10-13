import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { chunks, database, inIds, uniqueIds } from './db/client.ts';
import { moderationDecisions, reports, users } from './db/schema.ts';
import type { Env } from './env.ts';
import {
  DEFAULT_LOCALE,
  isMessageKey,
  LOCALES,
  type Locale,
  translate
} from './i18n/index.ts';
import { present } from './routing.ts';

const recordId = z.int().positive();

const mailMessage = z.discriminatedUnion('mail', [
  z.object({
    mail: z.enum(['report_received', 'report_acknowledged']),
    reportId: recordId
  }),
  z.object({
    mail: z.literal('decision_notified'),
    reportId: recordId,
    decisionId: recordId
  }),
  z.object({ mail: z.literal('content_removed'), decisionId: recordId })
]);

export type MailMessage = z.infer<typeof mailMessage>;

const RETRY_DELAY_SECONDS = 60;
const QUEUE_BATCH_LIMIT = 100;

type FiledReport = {
  id: number;
  category: string;
  moderatableType: string;
  moderatableId: number;
  locale: string;
  details: string | null;
  contentSnapshot: string | null;
  createdAt: string;
  reporterId: number | null;
  reporterName: string | null;
  reporterEmail: string | null;
};

type RecordedDecision = {
  id: number;
  outcome: string;
  reason: string;
  contentSnapshot: string | null;
  createdAt: string;
  authorEmail: string | null;
  authorLocale: string | null;
};

type Composed = { to: string; subject: string; text: string };

type Records = {
  reports: Map<number, FiledReport>;
  decisions: Map<number, RecordedDecision>;
};

export async function enqueueMails(
  queue: Queue<MailMessage>,
  messages: readonly MailMessage[]
): Promise<void> {
  for (const group of chunks(messages, QUEUE_BATCH_LIMIT)) {
    try {
      await queue.sendBatch(group.map((body) => ({ body })));
    } catch (error) {
      console.error('Failed to enqueue mails', error);
    }
  }
}

function iso8601(timestamp: string): string {
  return timestamp.replace(/\.\d+Z$/, 'Z');
}

function supportedLocale(locale: string | null): Locale {
  return LOCALES.find((supported) => supported === locale) ?? DEFAULT_LOCALE;
}

function categoryLabel(locale: Locale, category: string): string {
  const key = `report_category_${category}`;

  return isMessageKey(key) ? translate(locale, key) : category;
}

function reportReceived(report: FiledReport, env: Env): Composed {
  const reporter =
    report.reporterId === null
      ? 'deleted account'
      : `user ${report.reporterId} (${report.reporterName ?? ''})`;

  return {
    to: env.REPORT_NOTIFICATION_EMAIL,
    subject: `[Qoodish] New report #${report.id}`,
    text: `A new report was filed.

Report: #${report.id}
Category: ${report.category}
Target: ${report.moderatableType} ${report.moderatableId}
Reporter: ${reporter}
Locale: ${report.locale}
Filed at: ${iso8601(report.createdAt)}

Details:
${present(report.details) ? report.details : '(none)'}

Snapshot of the content at the time of the report:
${present(report.contentSnapshot) ? report.contentSnapshot : '(none)'}

Decide it on the dashboard:
${env.ADMIN_ENDPOINT}/${DEFAULT_LOCALE}/reports/${report.id}
`
  };
}

const ACKNOWLEDGEMENTS: Record<
  Locale,
  (report: FiledReport, reason: string) => Omit<Composed, 'to'>
> = {
  en: (report, reason) => ({
    subject: `[Qoodish] We received your report (#${report.id})`,
    text: `Thank you for your report. We have received it and will review the content against our Terms of Service.

Report: #${report.id}
Reason: ${reason}
Filed at: ${iso8601(report.createdAt)}

As a rule we decide within 7 days of receipt whether to remove the content or take another measure, and we will tell you the outcome by email. Where a decision requires more time, we will let you know.

You do not need to reply to this message.

Qoodish
https://qoodish.com
`
  }),
  ja: (report, reason) => ({
    subject: `[Qoodish] 報告を受け付けました (#${report.id})`,
    text: `ご報告ありがとうございます。報告を受け付けました。利用規約に照らして内容を確認します。

報告番号: #${report.id}
報告の理由: ${reason}
受付日時: ${iso8601(report.createdAt)}

原則として受付から 7 日以内に、削除その他の措置を講ずるか否かを判断し、結果をメールでお知らせします。判断に時間を要する場合は、その旨をご連絡します。

このメールへの返信は不要です。

Qoodish
https://qoodish.com
`
  })
};

function reportAcknowledged(report: FiledReport): Composed | null {
  const to = report.reporterEmail;

  if (!present(to)) {
    return null;
  }

  const locale = supportedLocale(report.locale);

  return {
    to,
    ...ACKNOWLEDGEMENTS[locale](report, categoryLabel(locale, report.category))
  };
}

function outcomeLabel(locale: Locale, outcome: string): string {
  const key = `moderation_outcome_${outcome}`;

  return isMessageKey(key) ? translate(locale, key) : outcome;
}

const DECISION_NOTICES: Record<
  Locale,
  (
    report: FiledReport,
    decision: RecordedDecision,
    labels: { category: string; outcome: string }
  ) => Omit<Composed, 'to'>
> = {
  en: (report, decision, labels) => ({
    subject: `[Qoodish] The outcome of your report (#${report.id})`,
    text: `We have finished reviewing what you reported.

Report: #${report.id}
Reason: ${labels.category}
Filed at: ${iso8601(report.createdAt)}
Decided at: ${iso8601(decision.createdAt)}

Outcome:
${labels.outcome}

Reason for the decision:
${decision.reason}

If you believe this outcome is wrong, you may write to support@qoodish.com.

Qoodish
https://qoodish.com
`
  }),
  ja: (report, decision, labels) => ({
    subject: `[Qoodish] 報告への対応が完了しました (#${report.id})`,
    text: `ご報告いただいた内容の確認が完了しました。

報告番号: #${report.id}
報告の理由: ${labels.category}
受付日時: ${iso8601(report.createdAt)}
判断日時: ${iso8601(decision.createdAt)}

対応結果:
${labels.outcome}

判断の理由:
${decision.reason}

この判断に誤りがあるとお考えの場合は、support@qoodish.com までご連絡ください。

Qoodish
https://qoodish.com
`
  })
};

function decisionNotified(
  report: FiledReport,
  decision: RecordedDecision
): Composed | null {
  const to = report.reporterEmail;

  if (!present(to)) {
    return null;
  }

  const locale = supportedLocale(report.locale);

  return {
    to,
    ...DECISION_NOTICES[locale](report, decision, {
      category: categoryLabel(locale, report.category),
      outcome: outcomeLabel(locale, decision.outcome)
    })
  };
}

const REMOVAL_NOTICES: Record<
  Locale,
  (decision: RecordedDecision, snapshot: string) => Omit<Composed, 'to'>
> = {
  en: (decision, snapshot) => ({
    subject: '[Qoodish] Your content has been removed',
    text: `We removed one of your posts because it violates our Terms of Service.

Removed at: ${iso8601(decision.createdAt)}

Reason:
${decision.reason}

The content at the time of removal:
${snapshot}

If you believe this measure is wrong, you may object by writing to support@qoodish.com. We will examine your objection and reconsider the measure where we find it necessary.

Qoodish
https://qoodish.com
`
  }),
  ja: (decision, snapshot) => ({
    subject: '[Qoodish] 投稿を削除しました',
    text: `利用規約に違反するため、お客様の投稿を削除しました。

削除日時: ${iso8601(decision.createdAt)}

理由:
${decision.reason}

削除時点の投稿内容:
${snapshot}

この措置に誤りがあるとお考えの場合は、support@qoodish.com まで異議を申し出ることができます。異議の内容を確認し、必要と認めるときは措置を見直します。

Qoodish
https://qoodish.com
`
  })
};

function contentRemoved(decision: RecordedDecision): Composed | null {
  const to = decision.authorEmail;

  if (!present(to)) {
    return null;
  }

  return {
    to,
    ...REMOVAL_NOTICES[supportedLocale(decision.authorLocale)](
      decision,
      present(decision.contentSnapshot) ? decision.contentSnapshot : '(none)'
    )
  };
}

function composed(
  message: MailMessage,
  { reports, decisions }: Records,
  env: Env
): Composed | null {
  switch (message.mail) {
    case 'report_received': {
      const report = reports.get(message.reportId);

      return report ? reportReceived(report, env) : null;
    }
    case 'report_acknowledged': {
      const report = reports.get(message.reportId);

      return report ? reportAcknowledged(report) : null;
    }
    case 'decision_notified': {
      const report = reports.get(message.reportId);
      const decision = decisions.get(message.decisionId);

      return report && decision ? decisionNotified(report, decision) : null;
    }
    case 'content_removed': {
      const decision = decisions.get(message.decisionId);

      return decision ? contentRemoved(decision) : null;
    }
  }
}

function composeMail(
  message: MailMessage,
  records: Records,
  env: Env
): EmailMessageBuilder | null {
  const mail = composed(message, records, env);

  return mail && { from: env.MAIL_FROM, replyTo: env.MAIL_REPLY_TO, ...mail };
}

async function loadRecords(
  env: Env,
  messages: readonly MailMessage[]
): Promise<Records> {
  const db = database(env.DB);
  const reportIds = uniqueIds(
    messages.map((message) => ('reportId' in message ? message.reportId : null))
  );
  const decisionIds = uniqueIds(
    messages.map((message) =>
      'decisionId' in message ? message.decisionId : null
    )
  );
  const [reportRows, decisionRows] = await db.batch([
    db
      .select({
        id: reports.id,
        category: reports.category,
        moderatableType: reports.moderatableType,
        moderatableId: reports.moderatableId,
        locale: reports.locale,
        details: reports.details,
        contentSnapshot: reports.contentSnapshot,
        createdAt: reports.createdAt,
        reporterId: reports.reporterId,
        reporterName: users.name,
        reporterEmail: users.email
      })
      .from(reports)
      .leftJoin(users, eq(users.id, reports.reporterId))
      .where(inIds(reports.id, reportIds)),
    db
      .select({
        id: moderationDecisions.id,
        outcome: moderationDecisions.outcome,
        reason: moderationDecisions.reason,
        contentSnapshot: moderationDecisions.contentSnapshot,
        createdAt: moderationDecisions.createdAt,
        authorEmail: users.email,
        authorLocale: users.locale
      })
      .from(moderationDecisions)
      .leftJoin(users, eq(users.id, moderationDecisions.authorId))
      .where(inIds(moderationDecisions.id, decisionIds))
  ]);

  return {
    reports: new Map(reportRows.map((row) => [row.id, row])),
    decisions: new Map(decisionRows.map((row) => [row.id, row]))
  };
}

export async function deliverMails(
  batch: MessageBatch<unknown>,
  env: Env
): Promise<void> {
  const parsed = batch.messages.map((message) => ({
    message,
    body: mailMessage.safeParse(message.body)
  }));
  const records = await loadRecords(
    env,
    parsed.flatMap(({ body }) => (body.success ? [body.data] : []))
  );

  const deliveries = parsed.flatMap(({ message, body }) => {
    if (!body.success) {
      console.error('Dropped a malformed mail message', body.error);
      message.ack();
      return [];
    }

    const mail = composeMail(body.data, records, env);

    if (!mail) {
      message.ack();
      return [];
    }

    return [{ message, kind: body.data.mail, mail }];
  });
  const outcomes = await Promise.allSettled(
    deliveries.map(({ mail }) => env.EMAIL.send(mail))
  );

  deliveries.forEach(({ message, kind }, index) => {
    const outcome = outcomes[index];

    if (outcome?.status === 'rejected') {
      console.error(`Failed to send ${kind}`, outcome.reason);
      message.retry({ delaySeconds: RETRY_DELAY_SECONDS });
    } else {
      message.ack();
    }
  });
}
