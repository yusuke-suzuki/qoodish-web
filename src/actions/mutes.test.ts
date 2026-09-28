import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { MutedAccount } from '../../types/index.ts';
import {
  apiRequests,
  failWith,
  resetServerActionMocks,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const getMutedAccounts =
  mock.fn<(lang: string, nextId: number) => Promise<MutedAccount[]>>();

mock.module(new URL('../lib/users.ts', import.meta.url).href, {
  namedExports: { getMutedAccounts }
});

const actions = () => import('./mutes.ts');

beforeEach(() => {
  resetServerActionMocks();
  getMutedAccounts.mock.resetCalls();
});

describe('fetchMoreMutedAccounts', () => {
  it('pages the muted accounts from the cursor', async () => {
    const { fetchMoreMutedAccounts } = await actions();
    const page = [{ id: 3, cursor: 7 } as MutedAccount];
    getMutedAccounts.mock.mockImplementation(async () => page);

    const result = await fetchMoreMutedAccounts('ja', 8);

    assert.equal(result, page);
    assert.deepEqual(getMutedAccounts.mock.calls[0].arguments, ['ja', 8]);
  });
});

describe('muteUser', () => {
  it('mutes the account and refreshes its profile', async () => {
    const { muteUser } = await actions();

    const result = await muteUser(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/users/2/mute', method: 'POST', body: undefined }
    ]);
    assert.equal(revalidatedTags().length, 1);
  });

  it('reports the API error without refreshing the profile', async () => {
    const { muteUser } = await actions();
    failWith();

    assert.deepEqual(await muteUser(2), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('unmuteUser', () => {
  it('unmutes the account and refreshes its profile', async () => {
    const { unmuteUser } = await actions();

    const result = await unmuteUser(2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/users/2/mute', method: 'DELETE', body: undefined }
    ]);
    assert.equal(revalidatedTags().length, 1);
  });

  it('reports the API error without refreshing the profile', async () => {
    const { unmuteUser } = await actions();
    failWith();

    assert.deepEqual(await unmuteUser(2), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});
