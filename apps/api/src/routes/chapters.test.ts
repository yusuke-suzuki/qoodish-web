import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from '../db/client.ts';
import { blocks } from '../db/schema.ts';
import { get, idsOf, send } from '../test/client.ts';
import {
  chapterVotesBy,
  commentNotifications,
  commentRevisionsOf,
  likedNotifications
} from '../test/records.ts';
import { seedDave, seedRelations } from '../test/relations.ts';
import { alice } from '../test/serialized.ts';
import { at, ids, seedWorld } from '../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedDave(env.DB);
  await seedRelations(env.DB);
});

const db = () => database(env.DB);

describe('chapters', () => {
  it('lets the author read a draft', async () => {
    expect((await get(`/chapters/${ids.draft}`, 'alice')).body).toMatchObject({
      id: ids.draft,
      status: 'draft',
      editable: true
    });
    expect((await get(`/chapters/${ids.draft}`, 'bob')).status).toBe(404);
  });

  it('serializes the viewer state of a chapter', async () => {
    expect(await get(`/chapters/${ids.noodleStory}`, 'bob')).toMatchObject({
      status: 200,
      body: {
        id: ids.noodleStory,
        map_id: ids.ramen,
        author: {
          ...alice,
          biography: 'Ramen walker',
          blocking: false,
          muting: false
        },
        map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
        journal: { id: 1, title: "Alice's journal" },
        editable: false,
        liked: true,
        likes_count: 1,
        comments_count: 2
      }
    });
    expect(
      (await get(`/chapters/${ids.noodleStory}`, 'alice')).body
    ).toMatchObject({ comments_count: 1 });
  });

  it('lists the comments of a chapter with their editable flag', async () => {
    expect(
      await idsOf(`/chapters/${ids.noodleStory}/comments`, 'carol')
    ).toEqual([ids.chapterComment, ids.removedChapterComment]);
    expect(
      (await get(`/chapters/${ids.noodleStory}/comments`, 'carol')).body
    ).toMatchObject([{ editable: false }, { editable: true }]);
    expect(
      await idsOf(`/chapters/${ids.noodleStory}/comments`, 'alice')
    ).toEqual([ids.removedChapterComment]);
  });

  it('pages the feed by next_timestamp', async () => {
    expect(await idsOf('/chapters', 'bob')).toEqual([
      ids.cafeStory,
      ids.noodleStory
    ]);
    expect(
      await idsOf(`/chapters?next_timestamp=${at(13)}&next_id=999`, 'bob')
    ).toEqual([ids.cafeStory, ids.noodleStory]);
    expect(await idsOf(`/chapters?next_timestamp=${at(13)}`, 'bob')).toEqual([
      ids.noodleStory
    ]);
  });

  it('ignores an invalid next_id and a next_id without next_timestamp', async () => {
    for (const nextId of ['abc', '0', '']) {
      expect(
        await idsOf(
          `/chapters?next_timestamp=${at(13)}&next_id=${nextId}`,
          'bob'
        )
      ).toEqual([ids.noodleStory]);
    }
    expect(await idsOf('/chapters?next_id=1&other=x', 'bob')).toEqual([
      ids.cafeStory,
      ids.noodleStory
    ]);
  });

  it('reads the first of repeated feed parameters', async () => {
    expect(
      await idsOf(
        `/chapters?next_timestamp=${at(13)}&next_timestamp=x&next_id=999&next_id=1`,
        'bob'
      )
    ).toEqual([ids.cafeStory, ids.noodleStory]);
    expect(
      (await get(`/chapters?next_timestamp=x&next_timestamp=${at(13)}`, 'bob'))
        .status
    ).toBe(400);
  });

  it('answers 400 for a malformed next_timestamp', async () => {
    for (const nextTimestamp of ['', 'x', '2024-13-45T25:99:00Z']) {
      expect(
        await get(`/chapters?next_timestamp=${nextTimestamp}`, 'bob', 'en')
      ).toEqual({
        status: 400,
        body: { title: 'BadRequest', detail: 'Invalid parameter specified.' }
      });
    }
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
    expect(await commentRevisionsOf(created.body.id)).toEqual([
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
});
