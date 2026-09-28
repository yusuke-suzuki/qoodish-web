import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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
  it('returns the English card for en', () => {
    assert.match(
      defaultOgImage('en'),
      /^https:\/\/qoodish\.com\/og\/en-\w+\.jpg$/
    );
  });

  it('returns the Japanese card for any other language', () => {
    assert.match(
      defaultOgImage('ja'),
      /^https:\/\/qoodish\.com\/og\/ja-\w+\.jpg$/
    );
    assert.equal(defaultOgImage('fr'), defaultOgImage('ja'));
  });

  it('points at a card that ships in the static assets', () => {
    for (const lang of ['en', 'ja']) {
      const path = new URL(defaultOgImage(lang)).pathname;
      assert.equal(
        existsSync(new URL(`../../public${path}`, import.meta.url)),
        true
      );
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
