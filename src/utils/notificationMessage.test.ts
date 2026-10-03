import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import enMessages from '../dictionaries/en.json' with { type: 'json' };
import jaMessages from '../dictionaries/ja.json' with { type: 'json' };
import { notificationMessageKey } from './notificationMessage.ts';

const en: Record<string, string> = enMessages;
const ja: Record<string, string> = jaMessages;

const NOTIFIED_SUBJECTS: [key: string, notifiableType: string][] = [
  ['coauthor_invited', 'map'],
  ['liked', 'map'],
  ['liked', 'review'],
  ['liked', 'pin'],
  ['liked', 'comment'],
  ['liked', 'chapter'],
  ['comment', 'review'],
  ['comment', 'pin'],
  ['comment', 'chapter'],
  ['published', 'chapter']
];

describe('notification messages', () => {
  for (const [key, notifiableType] of NOTIFIED_SUBJECTS) {
    it(`reads ${key} on a ${notifiableType} in both languages`, () => {
      const message = notificationMessageKey(key, notifiableType);

      assert.ok(en[message], `en.json is missing "${message}"`);
      assert.ok(ja[message], `ja.json is missing "${message}"`);
    });

    it(`reads ${key} on a ${notifiableType} by several notifiers in both languages`, () => {
      const message = `${notificationMessageKey(key, notifiableType)} others`;

      assert.ok(en[`${message} one`], `en.json is missing "${message} one"`);
      assert.ok(
        en[`${message} other`],
        `en.json is missing "${message} other"`
      );
      assert.ok(
        ja[`${message} other`],
        `ja.json is missing "${message} other"`
      );
    });
  }
});

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
