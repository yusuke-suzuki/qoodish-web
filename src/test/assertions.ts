import assert from 'node:assert/strict';

export function assertCloseTo(
  actual: number,
  expected: number,
  tolerance: number
): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
}
