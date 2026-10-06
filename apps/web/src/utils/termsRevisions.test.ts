import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatEffectiveDate,
  isBeforeEffectiveDate
} from './termsRevisions.ts';

describe('isBeforeEffectiveDate', () => {
  it('takes effect at midnight in Tokyo rather than UTC', () => {
    assert.equal(
      isBeforeEffectiveDate('2026-10-07', new Date('2026-10-06T14:59:59Z')),
      true
    );
    assert.equal(
      isBeforeEffectiveDate('2026-10-07', new Date('2026-10-06T15:00:00Z')),
      false
    );
  });
});

describe('formatEffectiveDate', () => {
  it('names the calendar date in the reader’s language', () => {
    assert.equal(formatEffectiveDate('en', '2026-10-12'), 'October 12, 2026');
    assert.equal(formatEffectiveDate('ja', '2026-10-12'), '2026年10月12日');
  });
});
