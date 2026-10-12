import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import { blocks, notifications, votes } from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { at, ids, seedWorld } from '../test/world.ts';
import { like } from '../votes.ts';

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(method: string, path: string, uid: string) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    { method, headers: { authorization: `Bearer ${token}` } },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function likedNotifications(type: string, id: number) {
  return db()
    .select({
      notifierId: notifications.notifierId,
      recipientId: notifications.recipientId
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.key, 'liked'),
        eq(notifications.notifiableType, type),
        eq(notifications.notifiableId, id)
      )
    );
}

describe('POST/DELETE /pins/:pinId/like', () => {
  it('likes a pin once and notifies its author once', async () => {
    const path = `/pins/${ids.shoyu}/like`;
    const unliked = await send('DELETE', path, 'bob');
    const missing = await send('DELETE', path, 'bob');
    const liked = await send('POST', path, 'bob');
    const again = await send('POST', path, 'bob');

    await send('DELETE', path, 'bob');
    await send('POST', path, 'bob');

    expect(unliked).toMatchObject({
      status: 200,
      body: { id: ids.shoyu, liked: false, likes_count: 1 }
    });
    expect(missing.status).toBe(404);
    expect(liked.body).toMatchObject({ liked: true, likes_count: 2 });
    expect(again.body).toMatchObject({ liked: true, likes_count: 2 });
    expect(await likedNotifications('Pin', ids.shoyu)).toEqual([
      { notifierId: ids.bob, recipientId: ids.alice }
    ]);
  });

  it('lets the author like their own pin without a notification', async () => {
    const { body } = await send('POST', `/pins/${ids.shoyu}/like`, 'alice');

    expect(body).toMatchObject({ liked: true, likes_count: 3 });
    expect(await likedNotifications('Pin', ids.shoyu)).toHaveLength(1);
  });

  it('answers 404 on a pin the user cannot see', async () => {
    expect(
      (await send('POST', `/pins/${ids.secretPin}/like`, 'bob')).status
    ).toBe(404);
  });
});

describe('POST/DELETE /pins/:pinId/comments/:commentId/like', () => {
  it('likes a comment and answers with the pin', async () => {
    const path = `/pins/${ids.shoyu}/comments/${ids.pinComment}/like`;
    const liked = await send('POST', path, 'carol');
    const comment = liked.body.comments.find(
      ({ id }: { id: number }) => id === ids.pinComment
    );

    expect(liked.status).toBe(200);
    expect(comment).toMatchObject({ liked: true, likes_count: 2 });
    expect(await likedNotifications('Comment', ids.pinComment)).toEqual([
      { notifierId: ids.carol, recipientId: ids.bob }
    ]);

    const unliked = await send('DELETE', path, 'carol');

    expect(
      unliked.body.comments.find(
        ({ id }: { id: number }) => id === ids.pinComment
      )
    ).toMatchObject({ liked: false, likes_count: 1 });
  });

  it('answers 404 on a deleted comment', async () => {
    expect(
      (
        await send(
          'POST',
          `/pins/${ids.shoyu}/comments/${ids.deletedPinComment}/like`,
          'carol'
        )
      ).status
    ).toBe(404);
  });
});

describe('POST/DELETE /chapters/:chapterId/like', () => {
  it('likes a chapter and answers with its detail', async () => {
    const path = `/chapters/${ids.noodleStory}/like`;
    const liked = await send('POST', path, 'carol');
    const unliked = await send('DELETE', path, 'carol');

    expect(liked).toMatchObject({
      status: 200,
      body: { id: ids.noodleStory, liked: true, likes_count: 2 }
    });
    expect(liked.body.comments_count).toEqual(expect.any(Number));
    expect(unliked.body).toMatchObject({ liked: false, likes_count: 1 });
    expect(await likedNotifications('Chapter', ids.noodleStory)).toEqual([
      { notifierId: ids.carol, recipientId: ids.alice }
    ]);
  });

  it('answers 404 on a draft chapter', async () => {
    expect(
      (await send('POST', `/chapters/${ids.draft}/like`, 'bob')).status
    ).toBe(404);
  });
});

describe('POST/DELETE /chapters/:chapterId/comments/:commentId/like', () => {
  it('answers 404 on a deleted comment or one on another chapter', async () => {
    const statuses = await Promise.all(
      [
        `/chapters/${ids.noodleStory}/comments/${ids.deletedChapterComment}/like`,
        `/chapters/${ids.cafeStory}/comments/${ids.chapterComment}/like`
      ].map(async (path) => (await send('POST', path, 'alice')).status)
    );

    expect(statuses).toEqual([404, 404]);
  });

  it('likes a comment on a chapter and answers with the comment', async () => {
    const path = `/chapters/${ids.noodleStory}/comments/${ids.chapterComment}/like`;
    const liked = await send('POST', path, 'alice');
    const unliked = await send('DELETE', path, 'alice');

    expect(liked).toMatchObject({
      status: 200,
      body: {
        id: ids.chapterComment,
        liked: true,
        likes_count: 1,
        editable: false
      }
    });
    expect(unliked.body).toMatchObject({ liked: false, likes_count: 0 });
  });
});

describe('likes across a block', () => {
  it('answers 422 when the user blocks the author', async () => {
    await db()
      .insert(blocks)
      .values({
        blockerId: ids.carol,
        blockedId: ids.alice,
        createdAt: at(30)
      });

    const blocked = await send(
      'POST',
      `/chapters/${ids.noodleStory}/like`,
      'carol'
    );

    expect(blocked).toMatchObject({
      status: 422,
      body: {
        detail:
          'You cannot like a post by an account you have blocked or that has blocked you.'
      }
    });
    expect(await chapterVotesBy(ids.carol)).toEqual([]);
  });

  it('reads the block from the database rather than from the loaded viewer', async () => {
    const before = await likedNotifications('Chapter', ids.noodleStory);

    await expect(
      like(db(), ids.carol, {
        type: 'Chapter',
        id: ids.noodleStory,
        userId: ids.alice
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(await chapterVotesBy(ids.carol)).toEqual([]);
    expect(await likedNotifications('Chapter', ids.noodleStory)).toEqual(
      before
    );
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
      like(db(), ids.carol, { type: 'Pin', id: ids.shoyu, userId: ids.alice })
    ).rejects.toMatchObject({ status: 422 });
  });

  it('answers 422 when the author blocked the user', async () => {
    await expect(
      like(db(), ids.alice, {
        type: 'Comment',
        id: ids.chapterComment,
        userId: ids.carol
      })
    ).rejects.toMatchObject({ status: 422 });
  });
});

describe('likes without a new vote', () => {
  it('records no notification for a like that already stood', async () => {
    await db()
      .delete(notifications)
      .where(eq(notifications.notifiableType, 'Pin'));

    await send('POST', `/pins/${ids.shoyu}/like`, 'bob');

    expect(await likedNotifications('Pin', ids.shoyu)).toEqual([]);
  });
});

async function chapterVotesBy(voterId: number) {
  return db()
    .select({ id: votes.id })
    .from(votes)
    .where(
      and(
        eq(votes.votableType, 'Chapter'),
        eq(votes.votableId, ids.noodleStory),
        eq(votes.voterId, voterId)
      )
    );
}
