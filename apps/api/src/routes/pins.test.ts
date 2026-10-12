import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import { blocks, comments, notifications } from '../db/schema.ts';
import { get, send } from '../test/client.ts';
import {
  commentNotifications,
  commentRevisionsOf,
  likedNotifications
} from '../test/records.ts';
import { seedDave, seedRelations } from '../test/relations.ts';
import { alice, bob } from '../test/serialized.ts';
import { at, ids, seedWorld } from '../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
  await seedRelations(env.DB);
});

const db = () => database(env.DB);

function bodies(pin: { comments: { body: string }[] }) {
  return pin.comments.map(({ body }) => body);
}

describe('pins', () => {
  it('serializes the viewer state of a pin and its comments', async () => {
    const { status, body } = await get(`/pins/${ids.shoyu}`, 'carol');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: ids.shoyu,
      author: { ...alice, blocking: false, muting: false },
      comments: [
        {
          id: ids.pinComment,
          author: bob,
          body: `Comment ${ids.pinComment}`,
          liked: false,
          likes_count: 1,
          pin_id: ids.shoyu
        }
      ],
      editable: false,
      liked: true,
      likes_count: 2
    });
  });

  it('hides comments by users the viewer mutes', async () => {
    const { body } = await get(`/pins/${ids.shoyu}`, 'alice');

    expect(body).toMatchObject({ editable: true, liked: false, comments: [] });
  });

  it('answers likes lists with no content', async () => {
    expect(await get(`/pins/${ids.shoyu}/likes`, 'bob')).toEqual({
      status: 204,
      body: null
    });
    expect(
      await get(`/pins/${ids.shoyu}/comments/${ids.pinComment}/likes`, 'bob')
    ).toEqual({ status: 204, body: null });
    expect((await get(`/pins/${ids.secretPin}/likes`, 'bob')).status).toBe(404);
    expect(
      (
        await get(
          `/pins/${ids.shoyu}/comments/${ids.removedPinComment}/likes`,
          'bob'
        )
      ).status
    ).toBe(404);
  });
});

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

describe('comments on a pin', () => {
  let commentId: number;

  it('records a comment with its revision and notifies the author', async () => {
    const { status, body } = await send(
      'POST',
      `/pins/${ids.shoyu}/comments`,
      'bob',
      { comment: 'Nice\r\nbowl' }
    );
    const [comment] = await db()
      .select()
      .from(comments)
      .where(eq(comments.body, 'Nice\nbowl'));

    commentId = comment?.id ?? 0;

    expect(status).toBe(200);
    expect(body.id).toBe(ids.shoyu);
    expect(bodies(body)).toContain('Nice\nbowl');
    expect(await commentRevisionsOf(commentId)).toEqual([
      { body: 'Nice\nbowl', status: 'published', userId: ids.bob }
    ]);
    expect(comment?.currentRevisionId).not.toBeNull();
    expect(await commentNotifications('Pin', ids.shoyu)).toEqual([
      { notifierId: ids.bob, recipientId: ids.alice }
    ]);
  });

  it('does not notify the author of their own comment', async () => {
    await send('POST', `/pins/${ids.shoyu}/comments`, 'alice', {
      comment: 'Thanks'
    });

    expect(await commentNotifications('Pin', ids.shoyu)).toHaveLength(1);
  });

  it('answers 422 for a blank or too long comment', async () => {
    const path = `/pins/${ids.shoyu}/comments`;
    const blank = await send('POST', path, 'bob', { comment: '  ' });
    const long = await send('POST', path, 'bob', { comment: 'a'.repeat(501) });

    expect(blank).toMatchObject({
      status: 422,
      body: { detail: 'Comment is required.' }
    });
    expect(long.body.detail).toBe('Comment is too long. (Max: 500)');
  });

  it('lets the author revise the comment, appending nothing for no change', async () => {
    const path = `/pins/${ids.shoyu}/comments/${commentId}`;
    const revised = await send('PUT', path, 'bob', { comment: 'Great bowl' });

    await send('PATCH', path, 'bob', { comment: 'Great bowl' });

    expect(bodies(revised.body)).toContain('Great bowl');
    expect(
      (await commentRevisionsOf(commentId)).map(({ body }) => body)
    ).toEqual(['Nice\nbowl', 'Great bowl']);
    expect((await send('PUT', path, 'carol', { comment: 'Mine' })).status).toBe(
      404
    );
  });

  it('answers 404 to anyone but the author and under any other post', async () => {
    const elsewhere = `/pins/${ids.latte}/comments/${commentId}`;
    const before = await commentRevisionsOf(commentId);

    expect(
      (await send('PUT', elsewhere, 'bob', { comment: 'Moved' })).status
    ).toBe(404);
    expect((await send('DELETE', elsewhere, 'bob')).status).toBe(404);
    expect(
      (
        await send(
          'DELETE',
          `/pins/${ids.shoyu}/comments/${commentId}`,
          'carol'
        )
      ).status
    ).toBe(404);
    expect(await commentRevisionsOf(commentId)).toEqual(before);
  });

  it('discards the comment as a revision', async () => {
    const { body } = await send(
      'DELETE',
      `/pins/${ids.shoyu}/comments/${commentId}`,
      'bob'
    );
    const [comment] = await db()
      .select({ status: comments.status })
      .from(comments)
      .where(eq(comments.id, commentId));

    expect(bodies(body)).not.toContain('Great bowl');
    expect(comment?.status).toBe('deleted');
    expect((await commentRevisionsOf(commentId)).at(-1)).toMatchObject({
      status: 'deleted',
      body: 'Great bowl'
    });
  });

  it('answers 404 on a comment already discarded', async () => {
    const path = `/pins/${ids.shoyu}/comments/${commentId}`;
    const before = await commentRevisionsOf(commentId);

    expect((await send('PUT', path, 'bob', { comment: 'Back' })).status).toBe(
      404
    );
    expect((await send('DELETE', path, 'bob')).status).toBe(404);
    expect(await commentRevisionsOf(commentId)).toHaveLength(before.length);
  });

  it('answers 422 for an edit that sends no comment', async () => {
    const created = await send('POST', `/pins/${ids.shoyu}/comments`, 'bob', {
      comment: 'Again'
    });
    const [comment] = await db()
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.body, 'Again'));
    const edit = await send(
      'PUT',
      `/pins/${ids.shoyu}/comments/${comment?.id}`,
      'bob',
      {}
    );

    expect(created.status).toBe(200);
    expect(edit).toMatchObject({
      status: 422,
      body: { detail: 'Comment is required.' }
    });
  });
});

describe('comments across a block', () => {
  it('answers 422 when the user blocks the author', async () => {
    await db()
      .insert(blocks)
      .values({ blockerId: ids.carol, blockedId: ids.bob, createdAt: at(30) });

    const blocked = await send('POST', `/pins/${ids.latte}/comments`, 'carol', {
      comment: 'Hi'
    });

    expect(blocked).toMatchObject({
      status: 422,
      body: {
        detail:
          'You cannot comment on a post by an account you have blocked or that has blocked you.'
      }
    });
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
