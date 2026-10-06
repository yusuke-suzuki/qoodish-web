import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { allowedOutcomes, parseDecision, publicPath } from './reports.ts';

describe('allowedOutcomes', () => {
  it('offers keeping or removing content that is still there', () => {
    assert.deepEqual(allowedOutcomes('Pin', true), ['kept', 'removed']);
  });

  it('does not offer removing an account or a journal', () => {
    assert.deepEqual(allowedOutcomes('User', true), ['kept']);
    assert.deepEqual(allowedOutcomes('Journal', true), ['kept']);
  });

  it('only offers closing a report whose content is gone', () => {
    assert.deepEqual(allowedOutcomes('Pin', false), ['unavailable']);
  });
});

describe('parseDecision', () => {
  it('accepts a known outcome with a reason', () => {
    assert.deepEqual(parseDecision('removed', '  Hate speech.  '), {
      outcome: 'removed',
      reason: 'Hate speech.'
    });
  });

  it('refuses an unknown outcome', () => {
    assert.equal(parseDecision('deleted', 'x'), null);
  });

  it('refuses a blank reason', () => {
    assert.equal(parseDecision('kept', '   '), null);
    assert.equal(parseDecision('kept', undefined), null);
  });
});

describe('publicPath', () => {
  it('links content to its own page', () => {
    assert.equal(
      publicPath({
        moderatable_type: 'Map',
        moderatable_id: 3,
        moderatable_parent: null
      }),
      '/maps/3'
    );
  });

  it('links a comment to the content it was posted on', () => {
    assert.equal(
      publicPath({
        moderatable_type: 'Comment',
        moderatable_id: 7,
        moderatable_parent: { type: 'Chapter', id: 2 }
      }),
      '/chapters/2'
    );
  });

  it('links a journal to the user it belongs to', () => {
    assert.equal(
      publicPath({
        moderatable_type: 'Journal',
        moderatable_id: 9,
        moderatable_parent: { type: 'User', id: 4 }
      }),
      '/users/4'
    );
  });

  it('gives no link when the parent is unknown', () => {
    assert.equal(
      publicPath({
        moderatable_type: 'Comment',
        moderatable_id: 7,
        moderatable_parent: null
      }),
      null
    );
  });
});
