import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const actions = () => import('./reports.ts');

beforeEach(resetServerActionMocks);

describe('createReport', () => {
  it('files the report with its details', async () => {
    const { createReport } = await actions();

    const result = await createReport({
      moderatable_type: 'Pin',
      moderatable_id: 3,
      category: 'spam',
      details: 'Advertising'
    });

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/reports',
        method: 'POST',
        body: {
          moderatable_type: 'Pin',
          moderatable_id: 3,
          category: 'spam',
          details: 'Advertising'
        }
      }
    ]);
  });

  it('reports the API error', async () => {
    const { createReport } = await actions();
    failWith('Already reported', 422);

    assert.deepEqual(
      await createReport({
        moderatable_type: 'Pin',
        moderatable_id: 3,
        category: 'spam'
      }),
      { success: false, error: 'Already reported' }
    );
  });
});
