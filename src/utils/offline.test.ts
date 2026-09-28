import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { offlinePath, offlinePathFor } from './offline.ts';

describe('offlinePath', () => {
  it('places the locale after the offline segment', () => {
    assert.equal(offlinePath('ja'), '/offline/ja');
  });
});

describe('offlinePathFor', () => {
  it('follows the locale of the requested page', () => {
    assert.equal(
      offlinePathFor('https://qoodish.com/ja/maps/1'),
      '/offline/ja'
    );
    assert.equal(offlinePathFor('https://qoodish.com/en'), '/offline/en');
  });

  it('ignores the query and the fragment', () => {
    assert.equal(
      offlinePathFor('https://qoodish.com/ja?tab=pins#top'),
      '/offline/ja'
    );
  });

  it('falls back to the default locale without a locale segment', () => {
    assert.equal(offlinePathFor('https://qoodish.com/'), '/offline/en');
    assert.equal(offlinePathFor('https://qoodish.com/fr/maps'), '/offline/en');
    assert.equal(offlinePathFor('https://qoodish.com/japan'), '/offline/en');
  });
});
