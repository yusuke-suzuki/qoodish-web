import { env } from 'cloudflare:test';
import { and, asc, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { recordComment } from '../comments.ts';
import { database } from '../db/client.ts';
import {
  blocks,
  commentRevisions,
  comments,
  notifications
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { at, ids, seedWorld } from '../test/world.ts';

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(method: string, path: string, uid: string, body?: unknown) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function revisionsOf(commentId: number) {
  return db()
    .select({
      body: commentRevisions.body,
      status: commentRevisions.status,
      userId: commentRevisions.userId
    })
    .from(commentRevisions)
    .where(eq(commentRevisions.commentId, commentId))
    .orderBy(asc(commentRevisions.id));
}

async function commentNotifications(type: string, id: number) {
  return db()
    .select({
      notifierId: notifications.notifierId,
      recipientId: notifications.recipientId
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.key, 'comment'),
        eq(notifications.notifiableType, type),
        eq(notifications.notifiableId, id)
      )
    );
}

function bodies(pin: { comments: { body: string }[] }) {
  return pin.comments.map(({ body }) => body);
}

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
    expect(await revisionsOf(commentId)).toEqual([
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
    expect((await revisionsOf(commentId)).map(({ body }) => body)).toEqual([
      'Nice\nbowl',
      'Great bowl'
    ]);
    expect((await send('PUT', path, 'carol', { comment: 'Mine' })).status).toBe(
      404
    );
  });

  it('answers 404 to anyone but the author and under any other post', async () => {
    const elsewhere = `/pins/${ids.latte}/comments/${commentId}`;
    const before = await revisionsOf(commentId);

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
    expect(await revisionsOf(commentId)).toEqual(before);
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
    expect((await revisionsOf(commentId)).at(-1)).toMatchObject({
      status: 'deleted',
      body: 'Great bowl'
    });
  });

  it('answers 404 on a comment already discarded', async () => {
    const path = `/pins/${ids.shoyu}/comments/${commentId}`;
    const before = await revisionsOf(commentId);

    expect((await send('PUT', path, 'bob', { comment: 'Back' })).status).toBe(
      404
    );
    expect((await send('DELETE', path, 'bob')).status).toBe(404);
    expect(await revisionsOf(commentId)).toHaveLength(before.length);
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

describe('comments on a chapter', () => {
  it('records, revises and discards a comment, answering with it', async () => {
    const base = `/chapters/${ids.noodleStory}/comments`;
    const created = await send('POST', base, 'bob', { comment: 'Lovely' });
    const path = `${base}/${created.body.id}`;
    const revised = await send('PATCH', path, 'bob', { comment: 'Lovelier' });
    const discarded = await send('DELETE', path, 'bob');

    expect(created).toMatchObject({
      status: 200,
      body: {
        body: 'Lovely',
        author: { id: ids.bob },
        liked: false,
        likes_count: 0,
        editable: true
      }
    });
    expect(revised.body).toMatchObject({ body: 'Lovelier', editable: true });
    expect(discarded.body).toMatchObject({
      id: created.body.id,
      body: 'Lovelier',
      editable: true
    });
    expect(await commentNotifications('Chapter', ids.noodleStory)).toEqual([
      { notifierId: ids.bob, recipientId: ids.alice }
    ]);
  });

  it('answers 404 to anyone but the author and under another chapter', async () => {
    const created = await send(
      'POST',
      `/chapters/${ids.noodleStory}/comments`,
      'bob',
      { comment: 'Mine' }
    );
    const statuses = await Promise.all([
      send(
        'PATCH',
        `/chapters/${ids.noodleStory}/comments/${created.body.id}`,
        'carol',
        { comment: 'Theirs' }
      ),
      send(
        'PATCH',
        `/chapters/${ids.cafeStory}/comments/${created.body.id}`,
        'bob',
        { comment: 'Moved' }
      ),
      send(
        'DELETE',
        `/chapters/${ids.noodleStory}/comments/${created.body.id}`,
        'carol'
      )
    ]);

    expect(statuses.map(({ status }) => status)).toEqual([404, 404, 404]);
    expect(await revisionsOf(created.body.id)).toEqual([
      { body: 'Mine', status: 'published', userId: ids.bob }
    ]);
  });

  it('answers 404 on a chapter the user cannot read', async () => {
    expect(
      (
        await send('POST', `/chapters/${ids.draft}/comments`, 'bob', {
          comment: 'Early'
        })
      ).status
    ).toBe(404);
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

  it('reads the block from the database and leaves earlier comments alone', async () => {
    const earlier = await db()
      .select({
        id: comments.id,
        currentRevisionId: comments.currentRevisionId
      })
      .from(comments)
      .where(eq(comments.userId, ids.carol));

    await expect(
      recordComment(db(), ids.carol, {
        type: 'Pin',
        commentable: { id: ids.latte, userId: ids.bob },
        body: 'Sneaky'
      })
    ).rejects.toMatchObject({ status: 422 });
    expect(
      await db().select().from(comments).where(eq(comments.body, 'Sneaky'))
    ).toEqual([]);
    expect(await commentNotifications('Pin', ids.latte)).toEqual([]);
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
