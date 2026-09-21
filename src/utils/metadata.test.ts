import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildAlternates, defaultOgImage, ogImages } from './metadata.ts';

describe('ogImages', () => {
  it('states the size and a description of the image', () => {
    assert.deepEqual(ogImages('https://example.com/og.png', 'A map'), [
      {
        url: 'https://example.com/og.png',
        width: 1200,
        height: 630,
        alt: 'A map'
      }
    ]);
  });
});

describe('defaultOgImage', () => {
  const EN_CARD = '8ca738eb-0789-4633-35b5-0b361b3aff00';
  const JA_CARD = '494350c9-9840-4e72-c1b9-c6cc597f4000';

  it('returns the English card for en', () => {
    assert.match(defaultOgImage('en'), new RegExp(EN_CARD));
  });

  it('returns the Japanese card for any other language', () => {
    assert.match(defaultOgImage('ja'), new RegExp(JA_CARD));
    assert.match(defaultOgImage('fr'), new RegExp(JA_CARD));
  });

  // ogImages states 1200x630 for whatever URL it is handed, and the host
  // serves that size from this variant alone.
  it('asks the host for the variant the pages claim the size of', () => {
    for (const lang of ['en', 'ja', 'fr']) {
      assert.equal(defaultOgImage(lang).endsWith('/ogp'), true);
    }
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
