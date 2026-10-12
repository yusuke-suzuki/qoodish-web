import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { database, inIds, uniqueIds } from './db/client.ts';
import { reports, users } from './db/schema.ts';
import type { Env } from './env.ts';
import {
  DEFAULT_LOCALE,
  isMessageKey,
  LOCALES,
  type Locale,
  translate
} from './i18n/index.ts';
import { present } from './routing.ts';

const mailMessage = z.object({
  mail: z.enum(['report_received', 'report_acknowledged']),
  reportId: z.int().positive()
});

export type MailMessage = z.infer<typeof mailMessage>;

const RETRY_DELAY_SECONDS = 60;

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

type Composed = { to: string; subject: string; text: string };

export async function enqueueMails(
  queue: Queue<MailMessage>,
  messages: readonly MailMessage[]
): Promise<void> {
  try {
    await queue.sendBatch(messages.map((body) => ({ body })));
  } catch (error) {
    console.error('Failed to enqueue mails', error);
  }
}

function iso8601(timestamp: string): string {
  return timestamp.replace(/\.\d+Z$/, 'Z');
}

function reportLocale(report: FiledReport): Locale {
  return LOCALES.find((locale) => locale === report.locale) ?? DEFAULT_LOCALE;
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

  const locale = reportLocale(report);

  return {
    to,
    ...ACKNOWLEDGEMENTS[locale](report, categoryLabel(locale, report.category))
  };
}

function composeMail(
  message: MailMessage,
  report: FiledReport,
  env: Env
): EmailMessageBuilder | null {
  const composed =
    message.mail === 'report_received'
      ? reportReceived(report, env)
      : reportAcknowledged(report);

  return (
    composed && { from: env.MAIL_FROM, replyTo: env.MAIL_REPLY_TO, ...composed }
  );
}

async function filedReports(
  env: Env,
  reportIds: readonly number[]
): Promise<Map<number, FiledReport>> {
  const db = database(env.DB);
  const rows = await db
    .select({
      id: reports.id,
      category: reports.category,
      moderatableType: reports.moderatableType,
      moderatableId: reports.moderatableId,
      locale: reports.locale,
      details: reports.details,
      contentSnapshot: reports.contentSnapshot,
      createdAt: reports.createdAt,
      reporterId: users.id,
      reporterName: users.name,
      reporterEmail: users.email
    })
    .from(reports)
    .leftJoin(users, eq(users.id, reports.reporterId))
    .where(inIds(reports.id, reportIds));

  return new Map(rows.map((row) => [row.id, row]));
}

export async function deliverMails(
  batch: MessageBatch<unknown>,
  env: Env
): Promise<void> {
  const parsed = batch.messages.map((message) => ({
    message,
    body: mailMessage.safeParse(message.body)
  }));
  const filed = await filedReports(
    env,
    uniqueIds(
      parsed.map(({ body }) => (body.success ? body.data.reportId : null))
    )
  );

  const deliveries = parsed.flatMap(({ message, body }) => {
    if (!body.success) {
      console.error('Dropped a malformed mail message', body.error);
      message.ack();
      return [];
    }

    const report = filed.get(body.data.reportId);
    const mail = report && composeMail(body.data, report, env);

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
