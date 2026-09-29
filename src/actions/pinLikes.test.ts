import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./pinLikes.ts');

beforeEach(resetServerActionMocks);

describe('likePin', () => {
  it('likes the pin, refreshes its cache and records the like', async () => {
    const { likePin } = await actions();

    const result = await likePin(3);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/pins/3/like', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3']);
    assert.deepEqual(recordedEvents(), [
      { name: 'like', params: { content_type: 'pin', item_id: 3 } }
    ]);
  });

  it('reports the API error without side effects', async () => {
    const { likePin } = await actions();
    failWith('Not found', 404);

    const result = await likePin(3);

    assert.deepEqual(result, { success: false, error: 'Not found' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('unlikePin', () => {
  it('removes the like and refreshes the pin without an event', async () => {
    const { unlikePin } = await actions();

    const result = await unlikePin(3);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/pins/3/like', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { unlikePin } = await actions();
    failWith();

    const result = await unlikePin(3);

    assert.deepEqual(result, { success: false, error: 'Forbidden' });
    assert.deepEqual(revalidatedTags(), []);
  });
});
