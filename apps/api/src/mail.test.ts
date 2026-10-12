import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { database } from './db/client.ts';
import { reports, users } from './db/schema.ts';
import { deliverMails } from './mail.ts';
import { at, ids, seedWorld } from './test/world.ts';

const REPORTS = {
  english: 1,
  japanese: 2,
  orphaned: 3,
  withoutDetails: 4
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
    .set({ email: 'carol@example.com' })
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
