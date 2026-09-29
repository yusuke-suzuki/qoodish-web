import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiRequests,
  failWith,
  resetServerActionMocks,
  respondWith,
  revalidatedTags
} from '../test/serverActionMocks.ts';

const actions = () => import('./users.ts');

beforeEach(resetServerActionMocks);

describe('updateProfile', () => {
  it('updates the profile and refreshes the user', async () => {
    const { updateProfile } = await actions();
    const profile = { id: 9, name: 'Ann' };
    respondWith(profile);

    const result = await updateProfile({ name: 'Ann', biography: 'Walker' });

    assert.deepEqual(result, { success: true, data: profile });
    assert.deepEqual(apiRequests(), [
      {
        path: '/me/profile',
        method: 'PUT',
        body: { name: 'Ann', biography: 'Walker' }
      }
    ]);
    assert.deepEqual(revalidatedTags(), ['user:9']);
  });

  it('reports the API error without refreshing', async () => {
    const { updateProfile } = await actions();
    failWith('Name is required', 422);

    assert.deepEqual(await updateProfile({ name: '' }), {
      success: false,
      error: 'Name is required'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('deleteAccount', () => {
  it('deletes the account and refreshes everything it authored', async () => {
    const { deleteAccount } = await actions();

    const result = await deleteAccount(9);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/account', method: 'DELETE', body: undefined }
    ]);
    assert.deepEqual(revalidatedTags(), [
      'maps',
      'pins',
      'chapters',
      'content',
      'user:9'
    ]);
  });

  it('still refreshes shared lists when the user id is unknown', async () => {
    const { deleteAccount } = await actions();

    await deleteAccount();

    assert.deepEqual(revalidatedTags(), [
      'maps',
      'pins',
      'chapters',
      'content'
    ]);
  });

  it('reports the API error without refreshing', async () => {
    const { deleteAccount } = await actions();
    failWith();

    assert.deepEqual(await deleteAccount(9), {
      success: false,
      error: 'Forbidden'
    });
    assert.deepEqual(revalidatedTags(), []);
  });
});

describe('updatePreferences', () => {
  it('saves the push notification preferences', async () => {
    const { updatePreferences } = await actions();
    const preferences = {
      web_push: {
        liked: true,
        coauthor_invited: false,
        comment: true,
        published: false
      }
    };

    const result = await updatePreferences(preferences);

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/preferences', method: 'PUT', body: preferences }
    ]);
  });

  it('reports the API error', async () => {
    const { updatePreferences } = await actions();
    failWith();

    assert.deepEqual(
      await updatePreferences({
        web_push: {
          liked: false,
          coauthor_invited: false,
          comment: false,
          published: false
        }
      }),
      { success: false, error: 'Forbidden' }
    );
  });
});
