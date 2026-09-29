import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  recordedEvents,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./comments.ts');

beforeEach(resetServerActionMocks);

describe('createComment', () => {
  it('comments on a pin, refreshes it and records the comment', async () => {
    const { createComment } = await actions();

    const result = await createComment({ type: 'pin', id: 3 }, 'Nice spot');

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/pins/3/comments',
        method: 'POST',
        body: { comment: 'Nice spot' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['pin:3']);
    assert.deepEqual(recordedEvents(), [
      { name: 'add_comment', params: { content_type: 'pin', item_id: 3 } }
    ]);
  });

  it('comments on a chapter through the chapter endpoint', async () => {
    const { createComment } = await actions();

    await createComment({ type: 'chapter', id: 8 }, 'Lovely read');

    assert.equal(apiRequests()[0].path, '/chapters/8/comments');
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
    assert.deepEqual(recordedEvents(), [
      { name: 'add_comment', params: { content_type: 'chapter', item_id: 8 } }
    ]);
  });

  it('reports the API error without side effects', async () => {
    const { createComment } = await actions();
    failWith('Comment is too long', 422);

    const result = await createComment({ type: 'pin', id: 3 }, 'x');

    assert.deepEqual(result, { success: false, error: 'Comment is too long' });
    assert.deepEqual(revalidatedTags(), []);
    assert.deepEqual(recordedEvents(), []);
  });
});

describe('deleteComment', () => {
  it('deletes the comment and refreshes its subject', async () => {
    const { deleteComment } = await actions();

    const result = await deleteComment({ type: 'chapter', id: 8 }, 21);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/chapters/8/comments/21', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['chapter:8']);
    assert.deepEqual(recordedEvents(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { deleteComment } = await actions();
    failWith();

    const result = await deleteComment({ type: 'pin', id: 3 }, 21);

    assert.deepEqual(result, { success: false, error: 'Forbidden' });
    assert.deepEqual(revalidatedTags(), []);
  });
});
