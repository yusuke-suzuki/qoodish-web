import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { NotificationsPage } from '../../types/index.ts';
import {
  apiRequests,
  failWith,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const getNotifications =
  mock.fn<
    (lang: string, options: { cursor: string }) => Promise<NotificationsPage>
  >();

mock.module(new URL('../lib/users.ts', import.meta.url).href, {
  namedExports: { getNotifications }
});

const actions = () => import('./notifications.ts');

beforeEach(() => {
  resetServerActionMocks();
  getNotifications.mock.resetCalls();
});

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

describe('fetchMoreNotifications', () => {
  it('pages the notifications from the cursor', async () => {
    const { fetchMoreNotifications } = await actions();
    const page = { notifications: [], nextCursor: '3' };
    getNotifications.mock.mockImplementation(async () => page);

    const result = await fetchMoreNotifications('ja', '8');

    assert.equal(result, page);
    assert.deepEqual(getNotifications.mock.calls[0].arguments, [
      'ja',
      { cursor: '8' }
    ]);
  });
});
