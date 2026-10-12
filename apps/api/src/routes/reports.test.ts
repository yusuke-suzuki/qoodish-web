import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { currentTimestamp, database } from '../db/client.ts';
import { moderationDecisions, reports } from '../db/schema.ts';
import { send } from '../test/client.ts';
import { IMAGE_BASE, ids, seedWorld } from '../test/world.ts';

const db = () => database(env.DB);

async function filed(id: number) {
  const [row] = await db().select().from(reports).where(eq(reports.id, id));

  return row;
}

async function reportCount() {
  return db().$count(reports);
}

beforeAll(async () => {
  await seedWorld(env.DB);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /reports', () => {
  it('files a report with a snapshot of the content and queues its mails', async () => {
    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');

    const { status, body } = await send('POST', '/reports', 'bob', {
      moderatable_type: 'Pin',
      moderatable_id: ids.shoyu,
      category: 'harassment',
      details: 'Targets me\r\nby name.'
    });

    expect(status).toBe(201);
    expect(body).toEqual({
      id: expect.any(Number),
      category: 'harassment',
      status: 'pending',
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/)
    });
    expect(await filed(body.id)).toMatchObject({
      reporterId: ids.bob,
      moderatableType: 'Pin',
      moderatableId: ids.shoyu,
      category: 'harassment',
      details: 'Targets me\nby name.',
      locale: 'en',
      reportedRevisionId: 1,
      createdAt: body.created_at,
      contentSnapshot: [
        'Shoyu Ramen',
        'Notes on Shoyu Ramen',
        `${IMAGE_BASE}/shoyu/public`,
        `${IMAGE_BASE}/shoyu-2/public`
      ].join('\n')
    });
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      { body: { mail: 'report_received', reportId: body.id } },
      { body: { mail: 'report_acknowledged', reportId: body.id } }
    ]);
  });

  it('files reports on a comment, a map, a chapter, a journal and a user', async () => {
    const targets = [
      ['Comment', ids.pinComment, 'alice', 'Comment 1'],
      [
        'Map',
        ids.ramen,
        'bob',
        `Tokyo Ramen\nAbout Tokyo Ramen\n${IMAGE_BASE}/ramen/public`
      ],
      [
        'Chapter',
        ids.noodleStory,
        'bob',
        `Noodle Story\nNoodles by the river\n${IMAGE_BASE}/story/public`
      ],
      ['Journal', 1, 'bob', "Alice's journal\n"],
      [
        'User',
        ids.alice,
        'bob',
        `Alice\nRamen walker\n${IMAGE_BASE}/alice/public`
      ]
    ] as const;

    for (const [type, id, reporter, snapshot] of targets) {
      const { status, body } = await send('POST', '/reports', reporter, {
        moderatable_type: type,
        moderatable_id: String(id),
        category: 'spam'
      });

      expect(status, type).toBe(201);
      expect((await filed(body.id))?.contentSnapshot, type).toBe(snapshot);
    }
  });

  it('records the locale of the request', async () => {
    const { body } = await send(
      'POST',
      '/reports',
      'carol',
      { moderatable_type: 'Pin', moderatable_id: ids.latte, category: 'spam' },
      'ja'
    );

    expect((await filed(body.id))?.locale).toBe('ja');
  });

  it('answers 404 on content the reporter cannot reference', async () => {
    const before = await reportCount();

    for (const moderatable_id of [ids.secretPin, ids.removedPin, 999, 'x']) {
      const { status } = await send('POST', '/reports', 'bob', {
        moderatable_type: 'Pin',
        moderatable_id,
        category: 'spam'
      });

      expect(status).toBe(404);
    }

    expect(await reportCount()).toBe(before);
  });

  it('answers 400 on a type that cannot be reported', async () => {
    expect(
      await send('POST', '/reports', 'bob', {
        moderatable_type: 'Vote',
        moderatable_id: 1,
        category: 'spam'
      })
    ).toEqual({
      status: 400,
      body: { title: 'BadRequest', detail: 'This content cannot be reported.' }
    });
  });

  it('refuses a second report while the first waits for a decision', async () => {
    const report = {
      moderatable_type: 'Chapter',
      moderatable_id: ids.cafeStory,
      category: 'spam'
    };

    expect((await send('POST', '/reports', 'alice', report)).status).toBe(201);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const before = await reportCount();

    expect(
      await send(
        'POST',
        '/reports',
        'alice',
        { ...report, category: 'hate' },
        'ja'
      )
    ).toEqual({
      status: 422,
      body: {
        title: 'UnprocessableContent',
        detail:
          '対象はすでに報告を受け付けており、確認が完了するまで再度報告することはできません。'
      }
    });
    expect(await reportCount()).toBe(before);
    expect(sendBatch).not.toHaveBeenCalled();
    expect((await send('POST', '/reports', 'carol', report)).status).toBe(201);
  });

  it('files a second report once the first was decided', async () => {
    const report = {
      moderatable_type: 'User',
      moderatable_id: ids.carol,
      category: 'spam'
    };

    expect((await send('POST', '/reports', 'bob', report)).status).toBe(201);

    await db().insert(moderationDecisions).values({
      moderatableType: 'User',
      moderatableId: ids.carol,
      outcome: 'kept',
      reason: 'Not spam.',
      staffMemberId: 1,
      createdAt: currentTimestamp()
    });

    expect(
      (await send('POST', '/reports', 'bob', { ...report, category: 'hate' }))
        .status
    ).toBe(201);
  });

  it('refuses a report on the own content', async () => {
    expect(
      await send('POST', '/reports', 'alice', {
        moderatable_type: 'Pin',
        moderatable_id: ids.shoyu,
        category: 'spam'
      })
    ).toEqual({
      status: 422,
      body: {
        title: 'UnprocessableContent',
        detail: 'Reporter is the author and cannot report their own post.'
      }
    });
  });

  it('answers 422 with the reasons a report is invalid', async () => {
    const target = { moderatable_type: 'Map', moderatable_id: ids.cafe };
    const detailOf = async (
      payload: Record<string, unknown>,
      language?: string
    ) =>
      (
        await send(
          'POST',
          '/reports',
          'alice',
          { ...target, ...payload },
          language
        )
      ).body.detail;

    expect(await detailOf({})).toBe('Reason for reporting must be selected.');
    expect(await detailOf({ category: 'abuse' })).toBe(
      'Reason for reporting must be selected.'
    );
    expect(await detailOf({ category: 'copyright', details: ' ' })).toBe(
      'Details must be filled in.'
    );
    expect(await detailOf({ category: 'other' }, 'ja')).toBe(
      '詳しい内容をご記入ください。'
    );
    expect(
      await detailOf({ category: 'spam', details: 'a'.repeat(2001) })
    ).toBe('Details must be 2000 characters or fewer.');
    expect(
      await detailOf({ category: 'abuse', details: 'a'.repeat(2001) }, 'ja')
    ).toBe(
      '報告の理由を選択してください。詳しい内容は 2000 文字以内でご記入ください。'
    );
    expect(
      await detailOf({ category: 'spam', details: `${'a'.repeat(2000)}\r` })
    ).toBeUndefined();
  });

  it('ignores who the payload claims filed the report', async () => {
    const { status, body } = await send('POST', '/reports', 'carol', {
      moderatable_type: 'Map',
      moderatable_id: ids.ramen,
      category: 'spam',
      reporter_email: 'other@example.com',
      reporter_id: ids.bob,
      evidence_url: 'https://example.com/original'
    });

    expect(status).toBe(201);
    expect((await filed(body.id))?.reporterId).toBe(ids.carol);
  });

  it('answers 401 without authentication', async () => {
    expect(
      (
        await send('POST', '/reports', undefined, {
          moderatable_type: 'Pin',
          moderatable_id: ids.shoyu,
          category: 'spam'
        })
      ).status
    ).toBe(401);
  });
});
