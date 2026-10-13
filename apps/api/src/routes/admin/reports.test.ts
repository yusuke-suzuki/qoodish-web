import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { currentTimestamp, database } from '../../db/client.ts';
import { moderationDecisions, reports, users } from '../../db/schema.ts';
import { sendAsStaff } from '../../test/client.ts';
import { STAFF, seedStaff } from '../../test/staff.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../../test/world.ts';

const db = () => database(env.DB);

const REPORTS = {
  shoyuByBob: 1,
  pinCommentOrphaned: 2,
  decidedMap: 3,
  shoyuByCarol: 4,
  latteByAlice: 5,
  latteByCarol: 6,
  latteByBob: 7,
  chapterComment: 8,
  journal: 9,
  missingPin: 10,
  editedUser: 11
};

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

function report(
  id: number,
  moderatableType: string,
  moderatableId: number,
  reporterId: number | null,
  createdAt: string,
  overrides: Partial<typeof reports.$inferInsert> = {}
): typeof reports.$inferInsert {
  return {
    id,
    moderatableType,
    moderatableId,
    reporterId,
    category: 'spam',
    locale: 'en',
    createdAt,
    ...overrides
  };
}

async function file(rows: (typeof reports.$inferInsert)[]): Promise<void> {
  for (const row of rows) {
    await db().insert(reports).values(row);
  }
}

async function recorded(id: number) {
  const [row] = await db()
    .select()
    .from(moderationDecisions)
    .where(eq(moderationDecisions.id, id));

  return row;
}

async function decisionCount() {
  return db().$count(moderationDecisions);
}

function decide(reportId: number | string, body: unknown, language?: string) {
  return sendAsStaff(
    'POST',
    `/admin/reports/${reportId}/decision`,
    STAFF.moderator.email,
    body,
    language
  );
}

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedStaff(env.DB);

  await db()
    .update(users)
    .set({ email: 'alice@example.com', locale: 'ja' })
    .where(eq(users.id, ids.alice));
  await db()
    .update(users)
    .set({ email: 'bob@example.com' })
    .where(eq(users.id, ids.bob));

  await file([
    report(REPORTS.shoyuByBob, 'Pin', ids.shoyu, ids.bob, at(28, 1), {
      reportedRevisionId: 1,
      contentSnapshot: 'Shoyu Ramen'
    }),
    report(
      REPORTS.pinCommentOrphaned,
      'Comment',
      ids.pinComment,
      null,
      at(28, 2),
      { category: 'hate' }
    ),
    report(REPORTS.decidedMap, 'Map', ids.removedMap, ids.carol, at(16)),
    report(REPORTS.shoyuByCarol, 'Pin', ids.shoyu, ids.carol, at(28, 3)),
    report(REPORTS.latteByAlice, 'Pin', ids.latte, ids.alice, at(10)),
    report(REPORTS.latteByCarol, 'Pin', ids.latte, ids.carol, at(12), {
      category: 'other',
      details: 'Offensive.',
      locale: 'ja',
      contentSnapshot: 'Matcha Latte\nNotes on Matcha Latte'
    }),
    report(REPORTS.latteByBob, 'Pin', ids.latte, ids.bob, at(13)),
    report(
      REPORTS.chapterComment,
      'Comment',
      ids.chapterComment,
      ids.alice,
      at(14)
    ),
    report(REPORTS.journal, 'Journal', 1, ids.bob, at(15)),
    report(REPORTS.missingPin, 'Pin', 999, ids.bob, at(18), {
      contentSnapshot: 'Gone pin',
      reportedRevisionId: 42
    }),
    report(REPORTS.editedUser, 'User', ids.carol, ids.bob, at(19), {
      reportedRevisionId: 5
    })
  ]);
  await db()
    .insert(moderationDecisions)
    .values([
      {
        id: 7,
        moderatableType: 'Pin',
        moderatableId: ids.latte,
        outcome: 'kept',
        reason: 'Not spam.',
        staffMemberId: STAFF.moderator.id,
        createdAt: at(11)
      },
      {
        id: 8,
        moderatableType: 'User',
        moderatableId: ids.carol,
        outcome: 'kept',
        reason: 'Fine.',
        staffMemberId: null,
        reviewedRevisionId: 5,
        createdAt: at(1)
      },
      {
        id: 9,
        moderatableType: 'User',
        moderatableId: ids.carol,
        outcome: 'kept',
        reason: 'Still fine.',
        staffMemberId: STAFF.moderator.id,
        reviewedRevisionId: 6,
        createdAt: at(1, 1)
      }
    ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('admin authorization', () => {
  it('answers 401 without an Access assertion', async () => {
    expect(
      await sendAsStaff('GET', '/admin/reports', undefined, undefined, 'ja')
    ).toEqual({
      status: 401,
      body: { title: 'Unauthorized', detail: '認証エラーが発生しました。' }
    });
  });

  it('answers 401 for an assertion of another application or a blank email', async () => {
    for (const claims of [
      { email: STAFF.moderator.email, aud: ['another-aud'] },
      { email: '   ' }
    ]) {
      expect((await sendAsStaff('GET', '/admin/reports', claims)).status).toBe(
        401
      );
    }
  });

  it('answers 403 to an Access user who is not active staff or lacks the permission', async () => {
    for (const email of [
      'stranger@example.com',
      STAFF.revoked.email,
      STAFF.roleless.email
    ]) {
      expect(await sendAsStaff('GET', '/admin/reports', email)).toEqual({
        status: 403,
        body: { title: 'Forbidden', detail: 'Operation not allowed.' }
      });
    }
  });

  it('checks the permission before looking the report up', async () => {
    expect(
      (await sendAsStaff('GET', '/admin/reports/999', STAFF.roleless.email))
        .status
    ).toBe(403);
    expect(
      (await sendAsStaff('GET', '/admin/reports/999', undefined)).status
    ).toBe(401);
  });

  it('finds the staff member regardless of case and surrounding spaces', async () => {
    expect(
      (await sendAsStaff('GET', '/admin/reports', ' Staff@Example.COM ')).status
    ).toBe(200);
  });
});

describe('GET /admin/reports', () => {
  it('lists the pending reports oldest first without the reporter email', async () => {
    const { status, body } = await sendAsStaff(
      'GET',
      '/admin/reports',
      STAFF.reader.email
    );

    expect(status).toBe(200);
    expect(body.map((item: { id: number }) => item.id)).toEqual([
      REPORTS.latteByCarol,
      REPORTS.latteByBob,
      REPORTS.chapterComment,
      REPORTS.journal,
      REPORTS.missingPin,
      REPORTS.editedUser,
      REPORTS.shoyuByBob,
      REPORTS.pinCommentOrphaned,
      REPORTS.shoyuByCarol
    ]);
    expect(body.slice(-3)).toEqual([
      {
        id: REPORTS.shoyuByBob,
        category: 'spam',
        moderatable_type: 'Pin',
        moderatable_id: ids.shoyu,
        reporter: { id: ids.bob, name: 'Bob' },
        created_at: at(28, 1)
      },
      {
        id: REPORTS.pinCommentOrphaned,
        category: 'hate',
        moderatable_type: 'Comment',
        moderatable_id: ids.pinComment,
        reporter: null,
        created_at: at(28, 2)
      },
      expect.objectContaining({ id: REPORTS.shoyuByCarol })
    ]);
  });
});

describe('GET /admin/reports/:id', () => {
  it('shows a report with its snapshot, history and sibling reports', async () => {
    const { status, body } = await sendAsStaff(
      'GET',
      `/admin/reports/${REPORTS.latteByCarol}`,
      STAFF.reader.email
    );

    expect(status).toBe(200);
    expect(body).toEqual({
      id: REPORTS.latteByCarol,
      category: 'other',
      moderatable_type: 'Pin',
      moderatable_id: ids.latte,
      reporter: { id: ids.carol, name: 'Carol' },
      created_at: at(12),
      status: 'pending',
      locale: 'ja',
      details: 'Offensive.',
      content_snapshot: 'Matcha Latte\nNotes on Matcha Latte',
      target_available: true,
      moderatable_parent: null,
      edited_since_filed: false,
      decisions: [
        {
          id: 7,
          outcome: 'kept',
          reason: 'Not spam.',
          moderator_email: STAFF.moderator.email,
          created_at: at(11),
          reviewed_as_filed: false
        }
      ],
      other_pending_reports: [
        {
          id: REPORTS.latteByBob,
          category: 'spam',
          moderatable_type: 'Pin',
          moderatable_id: ids.latte,
          reporter: { id: ids.bob, name: 'Bob' },
          created_at: at(13)
        }
      ]
    });
  });

  it('reads the status from the first decision made since the report', async () => {
    const { body } = await sendAsStaff(
      'GET',
      `/admin/reports/${REPORTS.latteByAlice}`,
      STAFF.reader.email
    );

    expect(body.status).toBe('kept');
    expect(
      body.other_pending_reports.map((item: { id: number }) => item.id)
    ).toEqual([REPORTS.latteByCarol, REPORTS.latteByBob]);
  });

  it('names the content a comment or a journal belongs to', async () => {
    const parentOf = async (reportId: number) =>
      (
        await sendAsStaff(
          'GET',
          `/admin/reports/${reportId}`,
          STAFF.reader.email
        )
      ).body.moderatable_parent;

    expect(await parentOf(REPORTS.pinCommentOrphaned)).toEqual({
      type: 'Pin',
      id: ids.shoyu
    });
    expect(await parentOf(REPORTS.chapterComment)).toEqual({
      type: 'Chapter',
      id: ids.noodleStory
    });
    expect(await parentOf(REPORTS.journal)).toEqual({
      type: 'User',
      id: ids.alice
    });
  });

  it('tells a gone target and an edit since the report', async () => {
    const show = async (reportId: number) =>
      (
        await sendAsStaff(
          'GET',
          `/admin/reports/${reportId}`,
          STAFF.reader.email
        )
      ).body;

    expect(await show(REPORTS.missingPin)).toMatchObject({
      target_available: false,
      moderatable_parent: null,
      edited_since_filed: false,
      decisions: [],
      other_pending_reports: []
    });
    expect(await show(REPORTS.shoyuByBob)).toMatchObject({
      target_available: true,
      edited_since_filed: false
    });
    expect(await show(REPORTS.editedUser)).toMatchObject({
      status: 'pending',
      target_available: true,
      edited_since_filed: true,
      decisions: [
        {
          id: 8,
          moderator_email: null,
          reviewed_as_filed: true
        },
        {
          id: 9,
          moderator_email: STAFF.moderator.email,
          reviewed_as_filed: false
        }
      ]
    });
  });

  it('answers 404 for a report that does not exist', async () => {
    for (const reportId of [999, 'x']) {
      expect(
        (
          await sendAsStaff(
            'GET',
            `/admin/reports/${reportId}`,
            STAFF.reader.email
          )
        ).status
      ).toBe(404);
    }
  });
});

describe('POST /admin/reports/:report_id/decision', () => {
  it('removes the content, records it as reviewed now and queues the mails', async () => {
    const filedAt = currentTimestamp();

    await file([
      report(101, 'Map', ids.ramen, ids.bob, at(1)),
      report(102, 'Map', ids.ramen, ids.carol, at(2)),
      report(103, 'Map', ids.ramen, null, at(3))
    ]);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const { status, body } = await decide(101, {
      outcome: 'removed',
      reason: 'Hate\r\nspeech.',
      staff_member_id: STAFF.administrator.id
    });

    expect(status).toBe(201);
    expect(body).toEqual({
      id: expect.any(Number),
      outcome: 'removed',
      reason: 'Hate\nspeech.',
      moderator_email: STAFF.moderator.email,
      created_at: expect.stringMatching(TIMESTAMP)
    });
    expect(body.created_at >= filedAt).toBe(true);
    expect(await recorded(body.id)).toEqual({
      id: body.id,
      moderatableType: 'Map',
      moderatableId: ids.ramen,
      authorId: ids.alice,
      moderatorId: null,
      staffMemberId: STAFF.moderator.id,
      outcome: 'removed',
      reason: 'Hate\nspeech.',
      contentSnapshot: `Tokyo Ramen\nAbout Tokyo Ramen\n${IMAGE_BASE}/ramen/public`,
      reviewedRevisionId: 1,
      createdAt: body.created_at
    });
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      {
        body: { mail: 'decision_notified', reportId: 101, decisionId: body.id }
      },
      { body: { mail: 'content_removed', decisionId: body.id } }
    ]);
    expect(
      (await sendAsStaff('GET', '/admin/reports/102', STAFF.reader.email)).body
        .status
    ).toBe('removed');
  });

  it('answers only the reports filed since the previous decision', async () => {
    await file([
      report(104, 'Map', ids.ramen, ids.bob, currentTimestamp()),
      report(105, 'Map', ids.ramen, ids.alice, currentTimestamp())
    ]);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const { status, body } = await decide(104, {
      outcome: 'kept',
      reason: 'Objection upheld.'
    });

    expect(status).toBe(201);
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      {
        body: { mail: 'decision_notified', reportId: 104, decisionId: body.id }
      },
      {
        body: { mail: 'decision_notified', reportId: 105, decisionId: body.id }
      }
    ]);
  });

  it('keeps a journal and tells only the reporters with an address', async () => {
    await file([report(106, 'Journal', 1, null, at(20))]);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const { status, body } = await decide(106, {
      outcome: 'kept',
      reason: 'Fine.'
    });

    expect(status).toBe(201);
    expect(await recorded(body.id)).toMatchObject({
      moderatableType: 'Journal',
      moderatableId: 1,
      authorId: ids.alice,
      contentSnapshot: "Alice's journal\n",
      reviewedRevisionId: null
    });
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      {
        body: {
          mail: 'decision_notified',
          reportId: REPORTS.journal,
          decisionId: body.id
        }
      }
    ]);
  });

  it('queues nothing when nobody has an address to tell', async () => {
    await file([report(109, 'User', ids.bob, null, at(20))]);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const { status, body } = await decide(109, {
      outcome: 'kept',
      reason: 'Fine.'
    });

    expect(status).toBe(201);
    expect(await recorded(body.id)).toMatchObject({
      moderatableType: 'User',
      moderatableId: ids.bob,
      authorId: ids.bob,
      contentSnapshot: 'Bob\n'
    });
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('removes content whose author has no address without telling the author', async () => {
    await file([
      report(107, 'Comment', ids.removedPinComment, ids.bob, currentTimestamp())
    ]);

    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const { status, body } = await decide(107, {
      outcome: 'removed',
      reason: 'Harassment.'
    });

    expect(status).toBe(201);
    expect(await recorded(body.id)).toMatchObject({
      authorId: ids.carol,
      contentSnapshot: 'Comment 3'
    });
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      {
        body: { mail: 'decision_notified', reportId: 107, decisionId: body.id }
      }
    ]);
  });

  it('closes a report whose target is gone with what the report recorded', async () => {
    const { status, body } = await decide(REPORTS.missingPin, {
      outcome: 'unavailable',
      reason: 'The author deleted the pin.'
    });

    expect(status).toBe(201);
    expect(await recorded(body.id)).toMatchObject({
      moderatableType: 'Pin',
      moderatableId: 999,
      authorId: null,
      contentSnapshot: 'Gone pin',
      reviewedRevisionId: 42,
      staffMemberId: STAFF.moderator.id
    });
    expect(
      (
        await sendAsStaff(
          'GET',
          `/admin/reports/${REPORTS.missingPin}`,
          STAFF.reader.email
        )
      ).body
    ).toMatchObject({
      status: 'unavailable',
      decisions: [{ id: body.id, reviewed_as_filed: true }]
    });
  });

  it('answers 422 with every reason a decision is refused', async () => {
    await file([report(108, 'Pin', 998, ids.bob, at(21))]);

    const before = await decisionCount();
    const sendBatch = vi.spyOn(env.MAIL_QUEUE, 'sendBatch');
    const detailOf = async (
      reportId: number,
      body: unknown,
      language?: string
    ) => {
      const res = await decide(reportId, body, language);

      expect(res.status).toBe(422);
      expect(res.body.title).toBe('UnprocessableContent');
      return res.body.detail;
    };

    expect(
      await detailOf(REPORTS.journal, { outcome: 'removed', reason: 'x' })
    ).toBe(
      'Target type is an account or a journal, which cannot be removed. Choose "Keep the content" instead.'
    );
    expect(
      await detailOf(
        REPORTS.editedUser,
        { outcome: 'removed', reason: 'x' },
        'ja'
      )
    ).toBe(
      '対象の種類がアカウントか手帳の場合は、非表示にできません。「対象を維持する」を選んでください。'
    );
    expect(await detailOf(108, { outcome: 'kept', reason: 'x' })).toBe(
      'Target is gone. Choose "Close because the content is gone" instead.'
    );
    expect(
      await detailOf(REPORTS.shoyuByBob, {
        outcome: 'unavailable',
        reason: 'x'
      })
    ).toBe(
      'Target is still there. Choose "Keep the content" or "Remove the content" instead.'
    );
    expect(
      await detailOf(REPORTS.shoyuByBob, { outcome: 'deleted' }, 'ja')
    ).toBe('対応結果を選択してください。理由を入力してください。');
    expect(await detailOf(REPORTS.shoyuByBob, { reason: 'Fine.' })).toBe(
      'Outcome must be selected.'
    );
    for (const reason of [{ text: 'Fine.' }, ' \r\n', null]) {
      expect(
        await detailOf(REPORTS.shoyuByBob, { outcome: 'kept', reason })
      ).toBe('Reason must be filled in.');
    }
    expect(await detailOf(108, { outcome: 1, reason: 'x' })).toBe(
      'Outcome must be selected. Target is gone. Choose "Close because the content is gone" instead.'
    );
    expect(await decisionCount()).toBe(before);
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('answers 404 for a report that does not exist', async () => {
    for (const reportId of [999, 'x']) {
      expect(
        (await decide(reportId, { outcome: 'kept', reason: 'x' })).status
      ).toBe(404);
    }
  });

  it('forbids staff without the permission to decide', async () => {
    const before = await decisionCount();

    for (const email of [STAFF.reader.email, STAFF.revoked.email]) {
      expect(
        (
          await sendAsStaff(
            'POST',
            `/admin/reports/${REPORTS.shoyuByCarol}/decision`,
            email,
            { outcome: 'kept', reason: 'Fine.' }
          )
        ).status
      ).toBe(403);
    }
    expect(
      (
        await sendAsStaff(
          'POST',
          `/admin/reports/${REPORTS.shoyuByCarol}/decision`,
          undefined,
          { outcome: 'kept', reason: 'Fine.' }
        )
      ).status
    ).toBe(401);
    expect(await decisionCount()).toBe(before);
  });
});
