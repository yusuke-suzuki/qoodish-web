import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { requestDevice } from './devices.ts';

function apiStub(error: string | null = null) {
  return mock.fn(async () => ({
    data: null,
    error,
    status: error ? 500 : 204
  }));
}

describe('requestDevice', () => {
  it('sends the encoded token as a single path segment', async () => {
    const api = apiStub();

    const result = await requestDevice('a/b?c', 'PUT', api);

    assert.deepEqual(api.mock.calls[0].arguments, [
      '/me/devices/a%2Fb%3Fc',
      { method: 'PUT' }
    ]);
    assert.deepEqual(result, { success: true });
  });

  it('uses the method it is given', async () => {
    const api = apiStub();

    await requestDevice('token-1', 'DELETE', api);

    assert.deepEqual(api.mock.calls[0].arguments, [
      '/me/devices/token-1',
      { method: 'DELETE' }
    ]);
  });

  it('refuses a dot-segment token without sending a request', async () => {
    const api = apiStub();

    const result = await requestDevice('..', 'DELETE', api);

    assert.equal(api.mock.callCount(), 0);
    assert.equal(result.success, false);
  });

  it('reports the API error', async () => {
    const result = await requestDevice('token-1', 'PUT', apiStub('Forbidden'));

    assert.deepEqual(result, { success: false, error: 'Forbidden' });
  });
});
