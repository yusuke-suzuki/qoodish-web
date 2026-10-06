import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { BlockedAccount, CursorPage } from '../../types/index.ts';
import {
  apiRequests,
  failWith,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const getBlockedAccounts =
  mock.fn<
    (lang: string, cursor: string) => Promise<CursorPage<BlockedAccount>>
  >();

mock.module(new URL('../lib/users.ts', import.meta.url).href, {
  namedExports: { getBlockedAccounts }
});

const actions = () => import('./blocks.ts');

beforeEach(() => {
  resetServerActionMocks();
  getBlockedAccounts.mock.resetCalls();
});

describe('fetchMoreBlockedAccounts', () => {
  it('pages the blocked accounts from the cursor', async () => {
    const { fetchMoreBlockedAccounts } = await actions();
    const page = { items: [{ id: 3 } as BlockedAccount], nextCursor: '7' };
    getBlockedAccounts.mock.mockImplementation(async () => page);

    const result = await fetchMoreBlockedAccounts('ja', '8');

    assert.equal(result, page);
    assert.deepEqual(getBlockedAccounts.mock.calls[0].arguments, ['ja', '8']);
  });
});

describe('blockUser', () => {
  it('blocks the account and refreshes its profile', async () => {
    const { blockUser } = await actions();

    const result = await blockUser(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/users/2/block', method: 'POST', body: undefined }
    ]);
    assert.equal(revalidatedTags().length, 1);
  });

  it('reports the API error without refreshing the profile', async () => {
    const { blockUser } = await actions();
    failWith();

    assert.deepEqual(await blockUser(2), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('unblockUser', () => {
  it('unblocks the account and refreshes its profile', async () => {
    const { unblockUser } = await actions();

    const result = await unblockUser(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/users/2/block', method: 'DELETE', body: undefined }
    ]);
    assert.equal(revalidatedTags().length, 1);
  });

  it('reports the API error without refreshing the profile', async () => {
    const { unblockUser } = await actions();
    failWith();

    assert.deepEqual(await unblockUser(2), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});
