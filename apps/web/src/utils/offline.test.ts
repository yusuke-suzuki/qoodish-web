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
      offlinePathFor('https://qoodish.com/ja/maps/1', ['en-US']),
      '/offline/ja'
    );
    assert.equal(
      offlinePathFor('https://qoodish.com/en', ['ja-JP']),
      '/offline/en'
    );
  });

  it('ignores the query and the fragment', () => {
    assert.equal(
      offlinePathFor('https://qoodish.com/ja?tab=pins#top', ['en-US']),
      '/offline/ja'
    );
  });

  it('follows the browser languages without a locale segment', () => {
    assert.equal(
      offlinePathFor('https://qoodish.com/?utm_source=homescreen', [
        'ja-JP',
        'en-US'
      ]),
      '/offline/ja'
    );
    assert.equal(
      offlinePathFor('https://qoodish.com/japan', ['fr-FR', 'ja']),
      '/offline/ja'
    );
  });

  it('falls back to the default locale when no language matches', () => {
    assert.equal(
      offlinePathFor('https://qoodish.com/fr/maps', ['fr-FR']),
      '/offline/en'
    );
    assert.equal(offlinePathFor('https://qoodish.com/', []), '/offline/en');
  });
});
