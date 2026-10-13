import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { database } from './db/client.ts';
import { moderationDecisions, reports, users } from './db/schema.ts';
import { deliverMails, enqueueMails } from './mail.ts';
import { at, ids, seedWorld } from './test/world.ts';

const REPORTS = {
  english: 1,
  japanese: 2,
  orphaned: 3,
  withoutDetails: 4
};

const DECISIONS = {
  removed: 101,
  kept: 102,
  authorWithoutAddress: 103,
  authorDeleted: 104
};

function message(body: unknown) {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    attempts: 1,
    body,
    ack: vi.fn(),
    retry: vi.fn()
  };
}

async function deliver(
  bodies: unknown[],
  send: (mail: EmailMessageBuilder) => Promise<EmailSendResult> = async () => ({
    messageId: 'sent'
  })
) {
  const messages = bodies.map(message);
  const sendMail = vi.fn(send);

  await deliverMails(
    {
      queue: 'dev-qoodish-api-mail',
      messages,
      ackAll: vi.fn(),
      retryAll: vi.fn()
    } as unknown as MessageBatch<unknown>,
    { ...env, EMAIL: { send: sendMail as SendEmail['send'] } }
  );

  return { messages, sent: sendMail.mock.calls.map(([mail]) => mail) };
}

beforeAll(async () => {
  await seedWorld(env.DB);

  const db = database(env.DB);

  await db
    .update(users)
    .set({ email: 'bob@example.com' })
    .where(eq(users.id, ids.bob));
  await db
    .update(users)
    .set({ email: 'carol@example.com', locale: 'ja' })
    .where(eq(users.id, ids.carol));

  const report = {
    moderatableType: 'Pin',
    moderatableId: ids.shoyu,
    category: 'harassment',
    createdAt: at(28, 123456)
  };

  await db.insert(reports).values([
    {
      ...report,
      id: REPORTS.english,
      reporterId: ids.bob,
      locale: 'en',
      details: 'Targets me by name.',
      contentSnapshot: 'Shoyu Ramen\nNotes on Shoyu Ramen'
    },
    { ...report, id: REPORTS.japanese, reporterId: ids.carol, locale: 'ja' },
    { ...report, id: REPORTS.orphaned, reporterId: null, locale: 'en' },
    {
      ...report,
      id: REPORTS.withoutDetails,
      reporterId: ids.alice,
      locale: 'en',
      details: ' '
    }
  ]);

  const decision = {
    moderatableType: 'Pin',
    moderatableId: ids.shoyu,
    staffMemberId: 1
  };

  await db.insert(moderationDecisions).values([
    {
      ...decision,
      id: DECISIONS.removed,
      outcome: 'removed',
      reason: 'Harassment.',
      authorId: ids.bob,
      contentSnapshot: 'Shoyu Ramen\nNotes on Shoyu Ramen',
      createdAt: at(29, 654321)
    },
    {
      ...decision,
      id: DECISIONS.kept,
      outcome: 'kept',
      reason: '問題ありません。',
      authorId: ids.carol,
      createdAt: at(30)
    },
    {
      ...decision,
      id: DECISIONS.authorWithoutAddress,
      outcome: 'removed',
      reason: 'Spam.',
      authorId: ids.alice,
      createdAt: at(30)
    },
    {
      ...decision,
      id: DECISIONS.authorDeleted,
      outcome: 'removed',
      reason: 'Spam.',
      authorId: null,
      createdAt: at(30)
    }
  ]);
});

describe('deliverMails', () => {
  it('tells the operator about a new report', async () => {
    const { messages, sent } = await deliver([
      { mail: 'report_received', reportId: REPORTS.english }
    ]);

    expect(sent).toEqual([
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'support@qoodish.com',
        subject: `[Qoodish] New report #${REPORTS.english}`,
        text: `A new report was filed.

Report: #${REPORTS.english}
Category: harassment
Target: Pin ${ids.shoyu}
Reporter: user ${ids.bob} (Bob)
Locale: en
Filed at: 2026-01-28T00:00:00Z

Details:
Targets me by name.

Snapshot of the content at the time of the report:
Shoyu Ramen
Notes on Shoyu Ramen

Decide it on the dashboard:
${env.ADMIN_ENDPOINT}/en/reports/${REPORTS.english}
`
      }
    ]);
    expect(messages[0]?.ack).toHaveBeenCalled();
  });

  it('writes (none) for what the report left blank and names a deleted reporter', async () => {
    const { sent } = await deliver([
      { mail: 'report_received', reportId: REPORTS.orphaned },
      { mail: 'report_received', reportId: REPORTS.withoutDetails }
    ]);

    expect(sent[0]?.text).toContain('Reporter: deleted account\n');
    expect(sent[0]?.text).toContain(
      'Details:\n(none)\n\nSnapshot of the content at the time of the report:\n(none)\n'
    );
    expect(sent[1]?.text).toContain('Details:\n(none)\n');
  });

  it('answers the reporter in the locale of the report', async () => {
    const { sent } = await deliver([
      { mail: 'report_acknowledged', reportId: REPORTS.english },
      { mail: 'report_acknowledged', reportId: REPORTS.japanese }
    ]);

    expect(sent).toEqual([
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'bob@example.com',
        subject: `[Qoodish] We received your report (#${REPORTS.english})`,
        text: `Thank you for your report. We have received it and will review the content against our Terms of Service.

Report: #${REPORTS.english}
Reason: Harassment or bullying
Filed at: 2026-01-28T00:00:00Z

As a rule we decide within 7 days of receipt whether to remove the content or take another measure, and we will tell you the outcome by email. Where a decision requires more time, we will let you know.

You do not need to reply to this message.

Qoodish
https://qoodish.com
`
      },
      expect.objectContaining({
        to: 'carol@example.com',
        subject: `[Qoodish] 報告を受け付けました (#${REPORTS.japanese})`,
        text: expect.stringContaining('報告の理由: 嫌がらせ・いじめ\n')
      })
    ]);
  });

  it('acknowledges nothing to a reporter without an address', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { messages, sent } = await deliver([
      { mail: 'report_acknowledged', reportId: REPORTS.orphaned },
      { mail: 'report_acknowledged', reportId: REPORTS.withoutDetails },
      { mail: 'report_received', reportId: 999 },
      { mail: 'unknown', reportId: REPORTS.english }
    ]);

    expect(sent).toEqual([]);
    for (const delivered of messages) {
      expect(delivered.ack).toHaveBeenCalled();
    }
  });

  it('tells the reporter the outcome of the report in its locale', async () => {
    const { messages, sent } = await deliver([
      {
        mail: 'decision_notified',
        reportId: REPORTS.english,
        decisionId: DECISIONS.removed
      },
      {
        mail: 'decision_notified',
        reportId: REPORTS.japanese,
        decisionId: DECISIONS.kept
      }
    ]);

    expect(sent).toEqual([
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'bob@example.com',
        subject: `[Qoodish] The outcome of your report (#${REPORTS.english})`,
        text: `We have finished reviewing what you reported.

Report: #${REPORTS.english}
Reason: Harassment or bullying
Filed at: 2026-01-28T00:00:00Z
Decided at: 2026-01-29T00:00:00Z

Outcome:
We found that the reported content violates our Terms of Service and removed it.

Reason for the decision:
Harassment.

If you believe this outcome is wrong, you may write to support@qoodish.com.

Qoodish
https://qoodish.com
`
      },
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'carol@example.com',
        subject: `[Qoodish] 報告への対応が完了しました (#${REPORTS.japanese})`,
        text: `ご報告いただいた内容の確認が完了しました。

報告番号: #${REPORTS.japanese}
報告の理由: 嫌がらせ・いじめ
受付日時: 2026-01-28T00:00:00Z
判断日時: 2026-01-30T00:00:00Z

対応結果:
利用規約に違反するとは判断しなかったため、報告された投稿の削除その他の措置は行いませんでした。

判断の理由:
問題ありません。

この判断に誤りがあるとお考えの場合は、support@qoodish.com までご連絡ください。

Qoodish
https://qoodish.com
`
      }
    ]);
    for (const delivered of messages) {
      expect(delivered.ack).toHaveBeenCalled();
    }
  });

  it('tells the author what was removed in the locale of the author', async () => {
    const { sent } = await deliver([
      { mail: 'content_removed', decisionId: DECISIONS.removed },
      { mail: 'content_removed', decisionId: DECISIONS.kept }
    ]);

    expect(sent).toEqual([
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'bob@example.com',
        subject: '[Qoodish] Your content has been removed',
        text: `We removed one of your posts because it violates our Terms of Service.

Removed at: 2026-01-29T00:00:00Z

Reason:
Harassment.

The content at the time of removal:
Shoyu Ramen
Notes on Shoyu Ramen

If you believe this measure is wrong, you may object by writing to support@qoodish.com. We will examine your objection and reconsider the measure where we find it necessary.

Qoodish
https://qoodish.com
`
      },
      {
        from: 'noreply@qoodish.com',
        replyTo: 'support@qoodish.com',
        to: 'carol@example.com',
        subject: '[Qoodish] 投稿を削除しました',
        text: `利用規約に違反するため、お客様の投稿を削除しました。

削除日時: 2026-01-30T00:00:00Z

理由:
問題ありません。

削除時点の投稿内容:
(none)

この措置に誤りがあるとお考えの場合は、support@qoodish.com まで異議を申し出ることができます。異議の内容を確認し、必要と認めるときは措置を見直します。

Qoodish
https://qoodish.com
`
      }
    ]);
  });

  it('sends no decision mail to nobody', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { messages, sent } = await deliver([
      { mail: 'content_removed', decisionId: DECISIONS.authorWithoutAddress },
      { mail: 'content_removed', decisionId: DECISIONS.authorDeleted },
      { mail: 'content_removed', decisionId: 999 },
      {
        mail: 'decision_notified',
        reportId: REPORTS.orphaned,
        decisionId: DECISIONS.removed
      },
      {
        mail: 'decision_notified',
        reportId: REPORTS.english,
        decisionId: 999
      },
      { mail: 'decision_notified', reportId: REPORTS.english }
    ]);

    expect(sent).toEqual([]);
    for (const delivered of messages) {
      expect(delivered.ack).toHaveBeenCalled();
    }
  });

  it('retries later only the mails the binding failed to send', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { messages } = await deliver(
      [
        { mail: 'report_received', reportId: REPORTS.english },
        { mail: 'report_acknowledged', reportId: REPORTS.english }
      ],
      async (mail) => {
        if (mail.to === 'support@qoodish.com') {
          throw new Error('E_RATE_LIMIT_EXCEEDED');
        }

        return { messageId: 'sent' };
      }
    );

    expect(messages[0]?.retry).toHaveBeenCalledExactlyOnceWith({
      delaySeconds: 60
    });
    expect(messages[0]?.ack).not.toHaveBeenCalled();
    expect(messages[1]?.ack).toHaveBeenCalled();
    expect(messages[1]?.retry).not.toHaveBeenCalled();
  });

  it('sends the mails of a batch at once', async () => {
    let inFlight = 0;
    let peak = 0;

    await deliver(
      [
        { mail: 'report_received', reportId: REPORTS.english },
        { mail: 'report_acknowledged', reportId: REPORTS.english },
        { mail: 'report_acknowledged', reportId: REPORTS.japanese }
      ],
      async () => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        await scheduler.wait(1);
        inFlight -= 1;

        return { messageId: 'sent' };
      }
    );

    expect(peak).toBe(3);
  });
});

describe('enqueueMails', () => {
  it('splits messages into batches the queue accepts', async () => {
    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const messages = Array.from({ length: 201 }, (_, index) => ({
      mail: 'content_removed' as const,
      decisionId: index + 1
    }));

    await enqueueMails(env.MAIL_QUEUE, messages);

    expect(sendBatch.mock.calls.map(([batch]) => [...batch].length)).toEqual([
      100, 100, 1
    ]);
  });
});
