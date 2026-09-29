import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { authEvent } from './authEvent.ts';

describe('authEvent', () => {
  it('reports a new Firebase user as a sign-up', () => {
    assert.deepEqual(authEvent(true, 'google.com'), {
      name: 'sign_up',
      params: { method: 'google.com' }
    });
  });

  it('reports a returning Firebase user as a login', () => {
    assert.deepEqual(authEvent(false, 'emailLink'), {
      name: 'login',
      params: { method: 'emailLink' }
    });
  });
});
