import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { relativeTime } from './relativeTime.ts';

const now = new Date('2026-09-28T12:00:00Z');

const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('relativeTime', () => {
  it('says now for the current moment', () => {
    assert.equal(relativeTime('en', now, now), 'now');
    assert.equal(relativeTime('ja', now, now), '今');
  });

  it('counts seconds under a minute', () => {
    assert.equal(relativeTime('en', ago(1), now), '1 second ago');
    assert.equal(relativeTime('en', ago(59), now), '59 seconds ago');
    assert.equal(relativeTime('ja', ago(30), now), '30 秒前');
  });

  it('counts whole minutes under an hour', () => {
    assert.equal(relativeTime('en', ago(MINUTE), now), '1 minute ago');
    assert.equal(relativeTime('en', ago(HOUR - 1), now), '59 minutes ago');
  });

  it('counts whole hours under a day', () => {
    assert.equal(relativeTime('en', ago(HOUR), now), '1 hour ago');
    assert.equal(relativeTime('ja', ago(DAY - 1), now), '23 時間前');
  });

  it('counts days rather than naming yesterday', () => {
    assert.equal(relativeTime('en', ago(DAY), now), '1 day ago');
    assert.equal(relativeTime('ja', ago(DAY), now), '1 日前');
    assert.equal(relativeTime('en', ago(29 * DAY), now), '29 days ago');
  });

  it('counts months from thirty days', () => {
    assert.equal(relativeTime('en', ago(30 * DAY), now), '1 month ago');
    assert.equal(relativeTime('en', ago(364 * DAY), now), '12 months ago');
    assert.equal(relativeTime('ja', ago(90 * DAY), now), '3 か月前');
  });

  it('counts years from 365 days', () => {
    assert.equal(relativeTime('en', ago(365 * DAY), now), '1 year ago');
    assert.equal(relativeTime('ja', ago(3 * 365 * DAY), now), '3 年前');
  });

  it('treats a timestamp ahead of the clock as now', () => {
    assert.equal(relativeTime('en', ago(-120), now), 'now');
  });
});
