import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { database } from './db/client.ts';
import { blocks, notifications, votes } from './db/schema.ts';
import { chapterVotesBy, likedNotifications } from './test/records.ts';
import { at, ids, seedWorld } from './test/world.ts';
import { like } from './votes.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await database(env.DB)
    .insert(blocks)
    .values({ blockerId: ids.carol, blockedId: ids.alice, createdAt: at(30) });
});

const db = () => database(env.DB);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('like', () => {
  it('enqueues a web push of the notification it records', async () => {
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await like(db(), env.WEB_PUSH_QUEUE, ids.alice, {
      type: 'Chapter',
      id: ids.cafeStory,
      userId: ids.bob
    });

    const [notification] = await db()
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.key, 'liked'),
          eq(notifications.notifiableType, 'Chapter'),
          eq(notifications.notifiableId, ids.cafeStory),
          eq(notifications.notifierId, ids.alice)
        )
      );

    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      { body: { notificationId: notification?.id } }
    ]);
  });

  it('enqueues nothing for a repeated like or a like of an own post', async () => {
    const likeCafeStory = () =>
      like(db(), env.WEB_PUSH_QUEUE, ids.alice, {
        type: 'Chapter',
        id: ids.cafeStory,
        userId: ids.bob
      });

    await likeCafeStory();

    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await likeCafeStory();
    await like(db(), env.WEB_PUSH_QUEUE, ids.bob, {
      type: 'Pin',
      id: ids.latte,
      userId: ids.bob
    });

    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('reads the block from the database rather than from the loaded viewer', async () => {
    const before = await likedNotifications('Chapter', ids.noodleStory);
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await expect(
      like(db(), env.WEB_PUSH_QUEUE, ids.carol, {
        type: 'Chapter',
        id: ids.noodleStory,
        userId: ids.alice
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(await chapterVotesBy(ids.carol)).toEqual([]);
    expect(await likedNotifications('Chapter', ids.noodleStory)).toEqual(
      before
    );
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('answers 422 on a post the user liked before the block', async () => {
    const standing = await db()
      .select({ id: votes.id })
      .from(votes)
      .where(
        and(
          eq(votes.votableType, 'Pin'),
          eq(votes.votableId, ids.shoyu),
          eq(votes.voterId, ids.carol)
        )
      );

    expect(standing).toHaveLength(1);
    await expect(
      like(db(), env.WEB_PUSH_QUEUE, ids.carol, {
        type: 'Pin',
        id: ids.shoyu,
        userId: ids.alice
      })
    ).rejects.toMatchObject({ status: 422 });
  });

  it('answers 422 when the author blocked the user', async () => {
    await expect(
      like(db(), env.WEB_PUSH_QUEUE, ids.alice, {
        type: 'Comment',
        id: ids.chapterComment,
        userId: ids.carol
      })
    ).rejects.toMatchObject({ status: 422 });
  });
});
