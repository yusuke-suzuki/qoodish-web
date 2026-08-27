import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildAlternates, defaultOgImage } from './metadata.ts';

describe('defaultOgImage', () => {
  it('returns the English image for en', () => {
    assert.match(defaultOgImage('en'), /ogp-image-en/);
  });

  it('returns the Japanese image for any other language', () => {
    assert.match(defaultOgImage('ja'), /ogp-image-ja/);
    assert.match(defaultOgImage('fr'), /ogp-image-ja/);
  });
});

describe('buildAlternates', () => {
  it('builds canonical and hreflang paths for a localized page', () => {
    assert.deepEqual(buildAlternates('ja', '/maps/5'), {
      canonical: '/ja/maps/5',
      languages: {
        en: '/en/maps/5',
        ja: '/ja/maps/5',
        'x-default': '/en/maps/5'
      }
    });
  });

  it('normalizes an unsupported language in the canonical path', () => {
    assert.deepEqual(buildAlternates('fr', '/maps/5'), {
      canonical: '/en/maps/5',
      languages: {
        en: '/en/maps/5',
        ja: '/ja/maps/5',
        'x-default': '/en/maps/5'
      }
    });
  });

  it('maps the root page to bare locale paths', () => {
    assert.deepEqual(buildAlternates('en'), {
      canonical: '/en',
      languages: {
        en: '/en',
        ja: '/ja',
        'x-default': '/en'
      }
    });
  });
});
