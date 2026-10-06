import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';
import { getDictionary } from './getDictionary.ts';
import { LOCALES } from './locales.ts';
import { manifestScreenshots } from './manifestScreenshots.ts';

describe('manifestScreenshots', () => {
  it('offers both a narrow and a wide screenshot for every language', () => {
    for (const lang of LOCALES) {
      const formFactors = manifestScreenshots(lang).map(
        (screenshot) => screenshot.form_factor
      );
      assert.ok(formFactors.includes('narrow'));
      assert.ok(formFactors.includes('wide'));
    }
  });

  it('shows the screenshots captured in the requested language', () => {
    for (const lang of LOCALES) {
      for (const { src } of manifestScreenshots(lang)) {
        assert.match(
          src,
          new RegExp(`^/screenshots/[\\w-]+-${lang}-\\w{8}\\.webp$`)
        );
      }
    }
  });

  it('falls back to English for an unsupported language', () => {
    assert.deepEqual(manifestScreenshots('fr'), manifestScreenshots('en'));
  });

  it('labels every screenshot in the requested language', () => {
    for (const lang of LOCALES) {
      const labels = Object.values(getDictionary(lang));
      for (const { label } of manifestScreenshots(lang)) {
        assert.ok(label);
        assert.ok(labels.includes(label));
      }
    }
  });

  it('keeps each form factor within the size limits Chrome accepts', () => {
    for (const lang of LOCALES) {
      for (const { sizes, form_factor } of manifestScreenshots(lang)) {
        const [width, height] = (sizes ?? '').split('x').map(Number);
        for (const edge of [width, height]) {
          assert.ok(edge >= 320 && edge <= 3840);
        }
        assert.ok(Math.max(width, height) <= 2.3 * Math.min(width, height));
        assert.equal(form_factor === 'wide', width > height);
      }
    }
  });

  it('points at screenshots that ship in the static assets', () => {
    for (const lang of LOCALES) {
      for (const { src } of manifestScreenshots(lang)) {
        assert.equal(
          existsSync(new URL(`../../public${src}`, import.meta.url)),
          true
        );
      }
    }
  });
});
