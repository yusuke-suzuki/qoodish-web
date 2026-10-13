import { describe, expect, it } from 'vitest';
import { cloudflareImageId } from './cloudflare-images.ts';

const env = { CLOUDFLARE_IMAGES_ACCOUNT_HASH: 'hash' };

describe('cloudflareImageId', () => {
  it('takes the path between the account hash and the variant', () => {
    expect(
      cloudflareImageId(
        env,
        'https://imagedelivery.net/hash/qoodish/abc/public'
      )
    ).toBe('qoodish/abc');
    expect(
      cloudflareImageId(env, 'https://imagedelivery.net/hash/abc/public')
    ).toBe('abc');
  });

  it('ignores a URL outside the account image delivery', () => {
    expect(
      cloudflareImageId(env, 'https://example.com/hash/qoodish/abc/public')
    ).toBeUndefined();
    expect(
      cloudflareImageId(
        env,
        'https://imagedelivery.net/other/qoodish/abc/public'
      )
    ).toBeUndefined();
    expect(
      cloudflareImageId(env, 'https://imagedelivery.net/hash/public')
    ).toBeUndefined();
    expect(cloudflareImageId(env, 'not a url')).toBeUndefined();
  });
});
