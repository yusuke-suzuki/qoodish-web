import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PinProperty } from '../../types/index.ts';
import {
  chooseOptions,
  matchesOptions,
  offeredOptionIds
} from './pinPropertyOptions.ts';

const payment: PinProperty = {
  id: 1,
  name: 'Payment',
  multiple: true,
  position: 0,
  options: [
    { id: 11, name: 'Cash only', position: 0 },
    { id: 12, name: 'PayPay', position: 0 }
  ]
};

const genre: PinProperty = {
  id: 2,
  name: 'Genre',
  multiple: false,
  position: 0,
  options: [
    { id: 21, name: 'Ramen', position: 0 },
    { id: 22, name: 'Cafe', position: 0 }
  ]
};

describe('chooseOptions', () => {
  it('replaces the options of one property and keeps the others', () => {
    assert.deepEqual(chooseOptions([11, 21], genre, [22]), [11, 22]);
    assert.deepEqual(chooseOptions([11, 21], payment, [11, 12]), [21, 11, 12]);
  });

  it('clears the options of one property', () => {
    assert.deepEqual(chooseOptions([11, 21], genre, []), [11]);
  });

  it('ignores options of another property', () => {
    assert.deepEqual(chooseOptions([], genre, [11, 22]), [22]);
  });
});

describe('matchesOptions', () => {
  const properties = [payment, genre];

  it('matches every pin when nothing is chosen', () => {
    assert.equal(matchesOptions([], properties, []), true);
  });

  it('matches a pin with any chosen option of a property', () => {
    assert.equal(matchesOptions([12], properties, [11, 12]), true);
    assert.equal(matchesOptions([21], properties, [11, 12]), false);
  });

  it('requires a match for every property with a chosen option', () => {
    assert.equal(matchesOptions([11, 22], properties, [11, 22]), true);
    assert.equal(matchesOptions([11, 21], properties, [11, 22]), false);
  });
});

describe('offeredOptionIds', () => {
  it('drops options the map no longer offers', () => {
    assert.deepEqual(
      offeredOptionIds([payment, genre], [11, 99, 22]),
      [11, 22]
    );
  });
});
