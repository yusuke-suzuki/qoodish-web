import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { preferredLocale } from './index.ts';

describe('preferredLocale', () => {
  it('picks the most wanted supported language', () => {
    assert.equal(preferredLocale('en-US,en;q=0.9,ja;q=0.8'), 'en');
    assert.equal(preferredLocale('fr;q=1, ja;q=0.5, en;q=0.4'), 'ja');
  });

  it('ignores a language the reader refused', () => {
    assert.equal(preferredLocale('en;q=0, ja;q=0.1'), 'ja');
  });

  it('falls back to Japanese, the language moderation runs in', () => {
    assert.equal(preferredLocale('fr-FR'), 'ja');
    assert.equal(preferredLocale(undefined), 'ja');
  });
});
