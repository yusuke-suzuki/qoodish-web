import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

const page = { items: [], nextCursor: 'c2' };
const apiFetchPage = mock.fn(async () => page);

mock.module(new URL('./api.ts', import.meta.url).href, {
  namedExports: {
    apiFetch: mock.fn(),
    apiFetchList: mock.fn(),
    apiFetchPage,
    assertApiAvailable: mock.fn()
  }
});

const users = () => import('./users.ts');

beforeEach(() => {
  apiFetchPage.mock.resetCalls();
});

describe('getNotifications', () => {
  it('pages the unread notifications from the cursor', async () => {
    const { getNotifications } = await users();

    assert.equal(
      await getNotifications('ja', { cursor: 'c1', read: false }),
      page
    );
    assert.deepEqual(apiFetchPage.mock.calls[0].arguments, [
      '/v2/me/notifications',
      {
        lang: 'ja',
        cursor: 'c1',
        query: { read: 'false' },
        next: { revalidate: 0 }
      }
    ]);
  });

  it('asks for every notification when no filter is given', async () => {
    const { getNotifications } = await users();

    await getNotifications('ja');

    assert.deepEqual(apiFetchPage.mock.calls[0].arguments, [
      '/v2/me/notifications',
      {
        lang: 'ja',
        cursor: undefined,
        query: undefined,
        next: { revalidate: 0 }
      }
    ]);
  });
});
