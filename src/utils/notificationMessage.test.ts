import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { notificationMessageKey } from './notificationMessage.ts';

describe('notificationMessageKey', () => {
  it('resolves a pin addressed by its former name', () => {
    assert.equal(notificationMessageKey('liked', 'review'), 'liked pin');
  });

  it('resolves a pin addressed by its current name', () => {
    assert.equal(notificationMessageKey('comment', 'pin'), 'comment pin');
  });

  it('leaves every other subject as it is', () => {
    assert.equal(notificationMessageKey('liked', 'chapter'), 'liked chapter');
  });
});
