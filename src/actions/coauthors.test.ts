import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiFetch,
  apiRequests,
  failWith,
  resetServerActionMocks,
  respondWith,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./coauthors.ts');

beforeEach(resetServerActionMocks);

describe('searchUsers', () => {
  it('searches with the trimmed, encoded query', async () => {
    const { searchUsers } = await actions();
    const users = [{ id: 1, name: 'Ann' }];
    respondWith(users);

    const result = await searchUsers('  Ann & Bob ');

    assert.deepEqual(result, users);
    assert.deepEqual(apiRequests(), [
      { path: '/users?q=Ann%20%26%20Bob', method: undefined, body: undefined }
    ]);
  });

  it('answers a blank query without asking the API', async () => {
    const { searchUsers } = await actions();

    assert.deepEqual(await searchUsers('   '), []);
    assert.equal(apiFetch.mock.callCount(), 0);
  });

  it('answers an empty list when the search fails', async () => {
    const { searchUsers } = await actions();
    failWith('Unauthorized', 401);

    assert.deepEqual(await searchUsers('Ann'), []);
  });
});

describe('inviteCoauthor', () => {
  it('invites the user to the map', async () => {
    const { inviteCoauthor } = await actions();

    const result = await inviteCoauthor(2, 7);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/maps/2/coauthorship_invitations',
        method: 'POST',
        body: { user_id: 7 }
      }
    ]);
  });

  it('reports the API error', async () => {
    const { inviteCoauthor } = await actions();
    failWith('Already invited', 422);

    assert.deepEqual(await inviteCoauthor(2, 7), {
      success: false,
      error: 'Already invited'
    });
  });
});

describe('removeCoauthor', () => {
  it('removes the coauthor and refreshes the map', async () => {
    const { removeCoauthor } = await actions();

    const result = await removeCoauthor(2, 7);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/maps/2/coauthors/7', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });

  it('reports the API error without refreshing', async () => {
    const { removeCoauthor } = await actions();
    failWith();

    assert.deepEqual(await removeCoauthor(2, 7), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('acceptCoauthorshipInvitation', () => {
  it('accepts the invitation and refreshes the map it opens', async () => {
    const { acceptCoauthorshipInvitation } = await actions();

    const result = await acceptCoauthorshipInvitation(4, 2);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/coauthorship_invitations/4/accept',
        method: 'POST',
        body: undefined
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['map:2']);
  });

  it('refreshes nothing when the map is unknown', async () => {
    const { acceptCoauthorshipInvitation } = await actions();

    await acceptCoauthorshipInvitation(4);

    assert.deepEqual(revalidatedTags(), []);
  });

  it('reports the API error without refreshing', async () => {
    const { acceptCoauthorshipInvitation } = await actions();
    failWith('Expired', 410);

    assert.deepEqual(await acceptCoauthorshipInvitation(4, 2), {
      success: false,
      error: 'Expired'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('declineCoauthorshipInvitation', () => {
  it('declines the invitation', async () => {
    const { declineCoauthorshipInvitation } = await actions();

    const result = await declineCoauthorshipInvitation(4);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/coauthorship_invitations/4/decline',
        method: 'POST',
        body: undefined
      }
    ]);
  });

  it('reports the API error', async () => {
    const { declineCoauthorshipInvitation } = await actions();
    failWith('Expired', 410);

    assert.deepEqual(await declineCoauthorshipInvitation(4), {
      success: false,
      error: 'Expired'
    });
  });
});
