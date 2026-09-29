import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const actions = () => import('./notifications.ts');

beforeEach(resetServerActionMocks);

describe('markNotificationAsRead', () => {
  it('marks the notification as read', async () => {
    const { markNotificationAsRead } = await actions();

    const result = await markNotificationAsRead(12);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/notifications/12', method: 'PUT', body: { read: true } }
    ]);
  });

  it('reports the API error', async () => {
    const { markNotificationAsRead } = await actions();
    failWith('Not found', 404);

    assert.deepEqual(await markNotificationAsRead(12), {
      success: false,
      error: 'Not found'
    });
  });
});
