import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildVariants,
  MAX_IMAGE_FILE_SIZE,
  splitOversizedImages
} from './uploadImage.ts';

const DELIVERY_BASE = 'https://imagedelivery.net/hash/image-1';

function fileOfSize(bytes: number, name: string): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });
}

describe('splitOversizedImages', () => {
  it('keeps files at the limit and rejects files above it', () => {
    const atLimit = fileOfSize(MAX_IMAGE_FILE_SIZE, 'ok.jpg');
    const aboveLimit = fileOfSize(MAX_IMAGE_FILE_SIZE + 1, 'big.jpg');

    const { accepted, oversized } = splitOversizedImages([atLimit, aboveLimit]);

    assert.deepEqual(accepted, [atLimit]);
    assert.deepEqual(oversized, [aboveLimit]);
  });

  it('preserves the selection order among accepted files', () => {
    const first = fileOfSize(1, 'first.jpg');
    const second = fileOfSize(2, 'second.jpg');

    assert.deepEqual(splitOversizedImages([first, second]).accepted, [
      first,
      second
    ]);
  });
});

function variantUrls(names: string[]): string[] {
  return names.map((name) => `${DELIVERY_BASE}/${name}`);
}

describe('buildVariants', () => {
  it('maps Cloudflare variant names onto the API image keys', () => {
    const urls = variantUrls(['avatar', 'card', 'hero', 'ogp', 'public']);

    assert.deepEqual(buildVariants(urls), {
      url: `${DELIVERY_BASE}/public`,
      avatar: `${DELIVERY_BASE}/avatar`,
      card: `${DELIVERY_BASE}/card`,
      hero: `${DELIVERY_BASE}/hero`,
      ogp: `${DELIVERY_BASE}/ogp`
    });
  });

  it('ignores extra variants Cloudflare may add', () => {
    const urls = variantUrls([
      'avatar',
      'card',
      'hero',
      'ogp',
      'public',
      'thumbnail'
    ]);

    assert.equal(buildVariants(urls).url, `${DELIVERY_BASE}/public`);
  });

  it('rejects a response missing a configured variant', () => {
    const urls = variantUrls(['avatar', 'card', 'hero', 'public']);

    assert.throws(() => buildVariants(urls), /"ogp" is not configured/);
  });

  it('rejects a response missing the built-in public variant', () => {
    const urls = variantUrls(['avatar', 'card', 'hero', 'ogp']);

    assert.throws(() => buildVariants(urls), /"public" is not configured/);
  });
});
