import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const actions = () => import('./mapBookmarks.ts');

beforeEach(resetServerActionMocks);

describe('bookmarkMap', () => {
  it('bookmarks the map and records the follow', async () => {
    const { bookmarkMap } = await actions();

    const result = await bookmarkMap(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/bookmark', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), [
      { name: 'follow', params: { content_type: 'map', item_id: 2 } }
    ]);
  });

  it('reports the API error without recording a follow', async () => {
    const { bookmarkMap } = await actions();
    failWith('Not found', 404);

    assert.deepEqual(await bookmarkMap(2), {
      success: false,
      error: 'Not found'
    });
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('removeBookmark', () => {
  it('removes the bookmark without recording an event', async () => {
    const { removeBookmark } = await actions();

    const result = await removeBookmark(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/bookmark', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error', async () => {
    const { removeBookmark } = await actions();
    failWith();

    assert.deepEqual(await removeBookmark(2), {
      success: false,
      error: 'Forbidden'
    });
  });
});
