import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./chapterLikes.ts');

beforeEach(resetServerActionMocks);

describe('likeChapter', () => {
  it('likes the chapter, refreshes it and records the like', async () => {
    const { likeChapter } = await actions();

    const result = await likeChapter(8);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/chapters/8/like', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
    assert.deepEqual(recordedEvents(), [
      { name: 'like', params: { content_type: 'chapter', item_id: 8 } }
    ]);
  });

  it('reports the API error without side effects', async () => {
    const { likeChapter } = await actions();
    failWith('Not found', 404);

    const result = await likeChapter(8);

    assert.deepEqual(result, { success: false, error: 'Not found' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('unlikeChapter', () => {
  it('removes the like and refreshes the chapter without an event', async () => {
    const { unlikeChapter } = await actions();

    const result = await unlikeChapter(8);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/chapters/8/like', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { unlikeChapter } = await actions();
    failWith();

    const result = await unlikeChapter(8);

    assert.deepEqual(result, { success: false, error: 'Forbidden' });
    assert.deepEqual(revalidatedTags(), []);
  });
});
