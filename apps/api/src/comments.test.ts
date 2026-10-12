import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { recordComment } from './comments.ts';
import { database } from './db/client.ts';
import { blocks, comments, notifications } from './db/schema.ts';
import { commentNotifications } from './test/records.ts';
import { at, ids, seedWorld } from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await database(env.DB)
    .insert(blocks)
    .values({ blockerId: ids.carol, blockedId: ids.bob, createdAt: at(30) });
});

const db = () => database(env.DB);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recordComment', () => {
  it('enqueues a web push of the notification it records', async () => {
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await recordComment(db(), env.WEB_PUSH_QUEUE, ids.bob, {
      type: 'Pin',
      commentable: { id: ids.shoyu, userId: ids.alice },
      body: 'Slurp'
    });

    const [notification] = await db()
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.key, 'comment'),
          eq(notifications.notifiableType, 'Pin'),
          eq(notifications.notifiableId, ids.shoyu),
          eq(notifications.notifierId, ids.bob)
        )
      );

    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      { body: { notificationId: notification?.id } }
    ]);
  });

  it('reads the block from the database and leaves earlier comments alone', async () => {
    const earlier = await db()
      .select({
        id: comments.id,
        currentRevisionId: comments.currentRevisionId
      })
      .from(comments)
      .where(eq(comments.userId, ids.carol));
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await expect(
      recordComment(db(), env.WEB_PUSH_QUEUE, ids.carol, {
        type: 'Pin',
        commentable: { id: ids.latte, userId: ids.bob },
        body: 'Sneaky'
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(
      await db().select().from(comments).where(eq(comments.body, 'Sneaky'))
    ).toEqual([]);
    expect(await commentNotifications('Pin', ids.latte)).toEqual([]);
    expect(sendBatch).not.toHaveBeenCalled();
    expect(
      await db()
        .select({
          id: comments.id,
          currentRevisionId: comments.currentRevisionId
        })
        .from(comments)
        .where(eq(comments.userId, ids.carol))
    ).toEqual(earlier);
  });
});
