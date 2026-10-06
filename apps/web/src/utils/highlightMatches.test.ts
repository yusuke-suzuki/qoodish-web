import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type HighlightPart, highlightMatches } from './highlightMatches.ts';

const bracketed = (parts: HighlightPart[]) =>
  parts.map((part) => (part.highlight ? `[${part.text}]` : part.text)).join('');

describe('highlightMatches', () => {
  it('highlights a match anywhere in the text, ignoring case', () => {
    assert.equal(
      bracketed(highlightMatches('Tokyo Ramen', 'RAM')),
      'Tokyo [Ram]en'
    );
  });

  it('highlights inside Japanese text without word boundaries', () => {
    assert.equal(
      bracketed(highlightMatches('東京のラーメン屋', 'ラーメン')),
      '東京の[ラーメン]屋'
    );
  });

  it('highlights every occurrence of every word in the query', () => {
    assert.equal(
      bracketed(highlightMatches('cafe and bar cafe', 'bar cafe')),
      '[cafe] and [bar] [cafe]'
    );
  });

  it('splits the query on full-width spaces', () => {
    assert.equal(
      bracketed(highlightMatches('渋谷 カフェ', '渋谷　カフェ')),
      '[渋谷] [カフェ]'
    );
  });

  it('prefers the longer word where two overlap', () => {
    assert.equal(
      bracketed(highlightMatches('seaside', 'sea seaside')),
      '[seaside]'
    );
  });

  it('treats regular expression characters literally', () => {
    assert.equal(bracketed(highlightMatches('a.b axb', 'a.b')), '[a.b] axb');
  });

  it('keeps surrogate pairs intact', () => {
    assert.equal(
      bracketed(highlightMatches('🍜ラーメン', 'ラ')),
      '🍜[ラ]ーメン'
    );
  });

  it('returns the whole text unhighlighted when nothing matches', () => {
    assert.deepEqual(highlightMatches('Kyoto', 'osaka'), [
      { text: 'Kyoto', highlight: false, start: 0 }
    ]);
    assert.deepEqual(highlightMatches('Kyoto', '  '), [
      { text: 'Kyoto', highlight: false, start: 0 }
    ]);
  });

  it('returns nothing for empty text', () => {
    assert.deepEqual(highlightMatches('', 'a'), []);
    assert.deepEqual(highlightMatches('', ''), []);
  });

  it('gives each part its offset in the text', () => {
    assert.deepEqual(
      highlightMatches('abab', 'b').map((part) => part.start),
      [0, 1, 2, 3]
    );
  });
});
