import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./commentLikes.ts');

beforeEach(resetServerActionMocks);

describe('likeComment', () => {
  it('likes a pin comment, refreshes the pin and records the like', async () => {
    const { likeComment } = await actions();

    const result = await likeComment({ type: 'pin', id: 3 }, 21);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/pins/3/comments/21/like', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3']);
    assert.deepEqual(recordedEvents(), [
      { name: 'like', params: { content_type: 'comment', item_id: 21 } }
    ]);
  });

  it('likes a chapter comment through the chapter endpoint', async () => {
    const { likeComment } = await actions();

    await likeComment({ type: 'chapter', id: 8 }, 21);

    assert.equal(apiRequests()[0].path, '/chapters/8/comments/21/like');
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
  });

  it('reports the API error without side effects', async () => {
    const { likeComment } = await actions();
    failWith('Not found', 404);

    const result = await likeComment({ type: 'pin', id: 3 }, 21);

    assert.deepEqual(result, { success: false, error: 'Not found' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('unlikeComment', () => {
  it('removes the like and refreshes the subject without an event', async () => {
    const { unlikeComment } = await actions();

    const result = await unlikeComment({ type: 'chapter', id: 8 }, 21);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/chapters/8/comments/21/like',
        method: 'DELETE',
        body: undefined
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { unlikeComment } = await actions();
    failWith();

    const result = await unlikeComment({ type: 'pin', id: 3 }, 21);

    assert.deepEqual(result, { success: false, error: 'Forbidden' });
    assert.deepEqual(revalidatedTags(), []);
  });
});
