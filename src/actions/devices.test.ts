import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import {
  apiFetch,
  apiRequests,
  failWith,
  resetServerActionMocks
} from '../test/serverActionMocks.ts';

const actions = () => import('./devices.ts');

beforeEach(resetServerActionMocks);

describe('registerDevice', () => {
  it('registers the encoded token with PUT', async () => {
    const { registerDevice } = await actions();

    const result = await registerDevice('a/b');

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/devices/a%2Fb', method: 'PUT', body: undefined }
    ]);
  });

  it('refuses a token that is not a single path segment', async () => {
    const { registerDevice } = await actions();

    const result = await registerDevice('..');

    assert.equal(result.success, false);
    assert.equal(apiFetch.mock.callCount(), 0);
  });

  it('reports the API error', async () => {
    const { registerDevice } = await actions();
    failWith('Unauthorized', 401);

    assert.deepEqual(await registerDevice('token-1'), {
      success: false,
      error: 'Unauthorized'
    });
  });
});

describe('unregisterDevice', () => {
  it('unregisters the token with DELETE', async () => {
    const { unregisterDevice } = await actions();

    const result = await unregisterDevice('token-1');

    assert.deepEqual(result, { success: true });
    assert.deepEqual(apiRequests(), [
      { path: '/me/devices/token-1', method: 'DELETE', body: undefined }
    ]);
  });

  it('reports the API error', async () => {
    const { unregisterDevice } = await actions();
    failWith('Not found', 404);

    assert.deepEqual(await unregisterDevice('token-1'), {
      success: false,
      error: 'Not found'
    });
  });
});
