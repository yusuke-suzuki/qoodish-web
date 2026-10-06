import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import devicePath from './devicePath.ts';

describe('devicePath', () => {
  it('keeps a base64url token as one path segment', () => {
    assert.equal(devicePath('abc-DEF_123'), '/me/devices/abc-DEF_123');
  });

  it('escapes characters that would split or rewrite the path', () => {
    assert.equal(devicePath('a/b?c#d'), '/me/devices/a%2Fb%3Fc%23d');
  });

  it('refuses a token that is a dot segment or empty', () => {
    assert.equal(devicePath('.'), null);
    assert.equal(devicePath('..'), null);
    assert.equal(devicePath(''), null);
  });
});
