import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type Asset,
  assetFileName,
  assetViewport,
  ICON_PURPOSES,
  ICON_SIZES,
  parseAssetFileName
} from './assets.ts';

describe('assetFileName', () => {
  it('keeps the names the icons are already hosted under', () => {
    assert.equal(
      assetFileName({ kind: 'icon', purpose: 'maskable', size: 192 }),
      'maskable_icon_x192.png'
    );
    assert.equal(
      assetFileName({ kind: 'icon', purpose: 'any', size: 512 }),
      'icon_x512.png'
    );
    assert.equal(
      assetFileName({ kind: 'ogImage', locale: 'ja' }),
      'ogp-image-ja.png'
    );
  });
});

describe('parseAssetFileName', () => {
  it('reads back every name it hands out', () => {
    const assets: Asset[] = [
      ...ICON_SIZES.flatMap((size) =>
        ICON_PURPOSES.map((purpose): Asset => ({ kind: 'icon', purpose, size }))
      ),
      { kind: 'ogImage', locale: 'ja' },
      { kind: 'ogImage', locale: 'en' }
    ];

    for (const asset of assets) {
      assert.deepEqual(parseAssetFileName(assetFileName(asset)), asset);
    }
  });

  it('refuses sizes, languages and names it does not render', () => {
    assert.equal(parseAssetFileName('icon_x100.png'), null);
    assert.equal(parseAssetFileName('maskable_icon_x192.webp'), null);
    assert.equal(parseAssetFileName('ogp-image-fr.png'), null);
    assert.equal(parseAssetFileName('styles.css'), null);
  });
});

describe('assetViewport', () => {
  it('draws an icon at its own size and a share image at 1200x630', () => {
    assert.deepEqual(
      assetViewport({ kind: 'icon', purpose: 'any', size: 48 }),
      { width: 48, height: 48 }
    );
    assert.deepEqual(assetViewport({ kind: 'ogImage', locale: 'en' }), {
      width: 1200,
      height: 630
    });
  });
});
