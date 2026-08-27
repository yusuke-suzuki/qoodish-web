import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildVariants } from './uploadImage.ts';

const DELIVERY_BASE = 'https://imagedelivery.net/hash/image-1';

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
