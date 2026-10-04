import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Notification } from '../../types/index.ts';
import { notificationGroupKey } from './notificationGroupKey.ts';

const notification = (
  id: number,
  key: string,
  type: string,
  notifiableId: number
) =>
  ({
    id,
    key,
    notifiable: { id: notifiableId, type, image: null }
  }) as Notification;

describe('notificationGroupKey', () => {
  it('matches the latest entry of a group with an earlier one', () => {
    assert.equal(
      notificationGroupKey(notification(9, 'liked', 'pin', 3)),
      notificationGroupKey(notification(4, 'liked', 'pin', 3))
    );
  });

  it('keeps different actions on the same subject apart', () => {
    assert.notEqual(
      notificationGroupKey(notification(9, 'liked', 'pin', 3)),
      notificationGroupKey(notification(4, 'comment', 'pin', 3))
    );
  });

  it('keeps the same action on different subjects apart', () => {
    assert.notEqual(
      notificationGroupKey(notification(9, 'liked', 'pin', 3)),
      notificationGroupKey(notification(4, 'liked', 'chapter', 3))
    );
  });
});
