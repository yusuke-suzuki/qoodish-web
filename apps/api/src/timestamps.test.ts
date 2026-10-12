import { describe, expect, it } from 'vitest';
import { parseTimestamp } from './timestamps.ts';

describe('parseTimestamp', () => {
  it('normalizes to UTC with microseconds', () => {
    expect(parseTimestamp('2026-01-05T12:00:00Z')).toBe(
      '2026-01-05T12:00:00.000000Z'
    );
    expect(parseTimestamp(' 2026-01-05 12:00:00 ')).toBe(
      '2026-01-05T12:00:00.000000Z'
    );
    expect(parseTimestamp('2026-01-05')).toBe('2026-01-05T00:00:00.000000Z');
    expect(parseTimestamp('2026-01-05T12:00:00.1234567Z')).toBe(
      '2026-01-05T12:00:00.123456Z'
    );
  });

  it('applies the offset in any of its spellings', () => {
    for (const zone of ['+09:00', '+0900', '+09']) {
      expect(parseTimestamp(`2026-01-05T21:30:00${zone}`)).toBe(
        '2026-01-05T12:30:00.000000Z'
      );
    }
    expect(parseTimestamp('2026-01-05T00:00:00-05:30')).toBe(
      '2026-01-05T05:30:00.000000Z'
    );
  });

  it('rolls an overflowing day over as Ruby does', () => {
    expect(parseTimestamp('2026-02-31 00:00:00')).toBe(
      '2026-03-03T00:00:00.000000Z'
    );
  });

  it('rejects text that is not a time', () => {
    for (const text of ['', 'x', '2024-13-45T25:99:00Z', '2026-01-05T12']) {
      expect(parseTimestamp(text)).toBeNull();
    }
  });
});
