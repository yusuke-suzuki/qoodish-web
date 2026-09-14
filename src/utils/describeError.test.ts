import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import describeError from './describeError.ts';

describe('describeError', () => {
  it('renders an error by its own string form', () => {
    assert.equal(
      describeError(new TypeError('fetch failed')),
      'TypeError: fetch failed'
    );
  });

  it('appends the cause when it is an error', () => {
    const error = new TypeError('fetch failed', {
      cause: new Error('ECONNREFUSED')
    });

    assert.equal(
      describeError(error),
      'TypeError: fetch failed (cause: Error: ECONNREFUSED)'
    );
  });

  it('ignores a cause that is not an error', () => {
    const error = new Error('boom', { cause: 'string cause' });

    assert.equal(describeError(error), 'Error: boom');
  });

  it('stringifies non-error values', () => {
    assert.equal(describeError('plain'), 'plain');
    assert.equal(describeError(undefined), 'undefined');
  });

  it('does not throw for a value with no string conversion', () => {
    assert.equal(describeError(Object.create(null)), '[object Object]');
  });
});
