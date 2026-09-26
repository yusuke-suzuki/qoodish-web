import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseGrant } from './staff.ts';

describe('parseGrant', () => {
  it('accepts an email with a role', () => {
    assert.deepEqual(parseGrant('  new@example.com ', '3'), {
      email: 'new@example.com',
      role_id: 3
    });
  });

  it('refuses a blank email', () => {
    assert.equal(parseGrant('   ', '3'), null);
    assert.equal(parseGrant(undefined, '3'), null);
  });

  it('refuses a missing or malformed role', () => {
    assert.equal(parseGrant('new@example.com', ''), null);
    assert.equal(parseGrant('new@example.com', 'admin'), null);
    assert.equal(parseGrant('new@example.com', '0'), null);
  });
});
