import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  resetServerActionMocks,
  respondWith
} from '../test/serverActionMocks.ts';

const actions = () => import('./journals.ts');

beforeEach(resetServerActionMocks);

describe('updateJournal', () => {
  it('updates the signed-in user’s journal and returns it', async () => {
    const { updateJournal } = await actions();
    const journal = { id: 6, title: 'Walks', description: 'Weekend walks' };
    respondWith(journal);

    const result = await updateJournal({
      title: 'Walks',
      description: 'Weekend walks'
    });

    assert.deepEqual(result, { success: true, data: journal });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/journal',
        method: 'PUT',
        body: { title: 'Walks', description: 'Weekend walks' }
      }
    ]);
  });

  it('reports the API error', async () => {
    const { updateJournal } = await actions();
    failWith('Title is too long', 422);

    assert.deepEqual(await updateJournal({ title: 'x' }), {
      success: false,
      error: 'Title is too long'
    });
  });
});
