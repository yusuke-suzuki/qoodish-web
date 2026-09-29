import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const actions = () => import('./journalBookmarks.ts');

beforeEach(resetServerActionMocks);

describe('bookmarkJournal', () => {
  it('bookmarks the journal and records the follow', async () => {
    const { bookmarkJournal } = await actions();

    const result = await bookmarkJournal(6);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/journals/6/bookmark', method: 'POST', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), [
      { name: 'follow', params: { content_type: 'journal', item_id: 6 } }
    ]);
  });

  it('reports the API error without recording a follow', async () => {
    const { bookmarkJournal } = await actions();
    failWith('Not found', 404);

    assert.deepEqual(await bookmarkJournal(6), {
      success: false,
      error: 'Not found'
    });
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('removeJournalBookmark', () => {
  it('removes the bookmark without recording an event', async () => {
    const { removeJournalBookmark } = await actions();

    const result = await removeJournalBookmark(6);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/journals/6/bookmark', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error', async () => {
    const { removeJournalBookmark } = await actions();
    failWith();

    assert.deepEqual(await removeJournalBookmark(6), {
      success: false,
      error: 'Forbidden'
    });
  });
});
